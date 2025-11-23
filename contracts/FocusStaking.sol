// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {UUPSUpgradeable} from "@openzeppelin-upgradeable/contracts/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin-upgradeable/contracts/access/OwnableUpgradeable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Minimal IERC20 interface
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title FocusStaking - group focus sessions with bot-driven liveness (CELO/native + optional ERC20)
/// @notice XMTP bot-driven liveness: bot pings users off-chain, users call userPing(), bot calls markAFK() on no-response.
///         Finalization treats non-COMPLETED participants as dropouts (including FAILED).
contract FocusStaking is UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuard {
    // ---------- Basic utilities ----------
    enum TokenType { NATIVE, ERC20 }

    function initialize(address _stakingProtocol, address _communityPool) external initializer {
        __Ownable_init(msg.sender);
        stakingProtocol = _stakingProtocol;
        communityPool = _communityPool;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ---------- Owner / Bot ----------
    address public bot; // XMTP bot address (EOA or contract) able to call liveness functions

    modifier onlyBot() { require(msg.sender == bot, "bot only"); _; }

    function setBot(address newBot) external onlyOwner {
        bot = newBot;
        emit BotSet(newBot);
    }

    // Where forfeited stakes are sent (can point to a staking contract or vault)
    address public stakingProtocol;
    // A community pool that receives a share (optional)
    address public communityPool;

    function setStakingProtocol(address a) external onlyOwner {
        stakingProtocol = a;
        emit StakingProtocolSet(a);
    }
    function setCommunityPool(address a) external onlyOwner {
        communityPool = a;
        emit CommunityPoolSet(a);
    }

    // ---------- Data structures ----------
    enum ParticipantStatus { NOT_JOINED, JOINED, COMPLETED, FAILED, WITHDRAWN }

    struct Participant {
        address addr;
        uint256 stake; // in token smallest units or native wei (used as withdrawable amount after finalize)
        ParticipantStatus status;
    }

    struct Group {
        uint256 id;
        TokenType tokenType;
        address tokenAddr; // if ERC20, token contract; if native, ignored (set to address(0))
        uint256 stakeAmount; // required stake per participant
        uint256 maxSize;
        uint256 startTimestamp; // when session starts (set when startSession called)
        uint256 sessionDuration; // seconds
        uint256 maxInactivity; // seconds allowed without ping before considered AFK (for reference)
        bool started;
        bool finalized;
        address creator;
        uint256 totalCollected; // sum of all stakes
        uint256 totalCompleted; // count of completed participants
        mapping(address => uint256) participantIndex; // index+1
        Participant[] participants;
        uint256[50] __gap;
    }

    // lastAlive[groupId][user] => timestamp of last userPing
    mapping(uint256 => mapping(address => uint256)) public lastAlive;

    // Incremental group id
    uint256 public nextGroupId = 1;
    // Mapping groupId => Group (struct in storage)
    mapping(uint256 => Group) private groups;

    // ---------- Events ----------
    event GroupCreated(uint256 indexed groupId, address indexed creator, TokenType tokenType, address tokenAddr, uint256 stakeAmount, uint256 maxSize, uint256 sessionDuration, uint256 maxInactivity);
    event Joined(uint256 indexed groupId, address indexed user);
    event Left(uint256 indexed groupId, address indexed user);
    event Started(uint256 indexed groupId, uint256 startTimestamp);
    event LivenessPinged(uint256 indexed groupId, address indexed user, uint256 timestamp);
    event UserFailedLiveness(uint256 indexed groupId, address indexed user);
    event MarkedCompleted(uint256 indexed groupId, address indexed user);
    event Finalized(uint256 indexed groupId, uint256 totalCollected, uint256 totalCompleted, uint256 forfeited);
    event Withdrawn(uint256 indexed groupId, address indexed user, uint256 amount);
    event BotSet(address bot);
    event StakingProtocolSet(address stakingProtocol);
    event CommunityPoolSet(address communityPool);
    event FinalizeCalculations(uint256 indexed groupId, uint256 totalCompleted, uint256 dropouts, uint256 forfeited, uint256 share);
    event EmergencyFinalized(uint256 indexed groupId);
    event EmergencyWithdrawn(address indexed token, uint256 amount);

    // ---------- Create / Join / Start / Complete ----------
    /// @notice Create a group. For native token staking set tokenType=NATIVE and tokenAddr=address(0).
    /// @param tokenType TokenType.NATIVE or TokenType.ERC20
    /// @param tokenAddr If ERC20 set token contract address, else address(0)
    /// @param stakeAmount stake required per participant (wei or token smallest units)
    /// @param maxSize maximum participants in group
    /// @param sessionDuration number of seconds the session runs once started
    /// @param maxInactivity seconds of allowed inactivity (for bot logic reference)
    function createGroup(
        TokenType tokenType,
        address tokenAddr,
        uint256 stakeAmount,
        uint256 maxSize,
        uint256 sessionDuration,
        uint256 maxInactivity
    ) external returns (uint256) {
        require(stakeAmount > 0, "stake>0");
        require(maxSize >= 2, "min 2");
        require(sessionDuration >= 60, "session too short");
        require(maxInactivity >= 30, "inactivity too small");

        if (tokenType == TokenType.ERC20) {
            require(tokenAddr.code.length > 0, "Invalid ERC20 contract address");
        }

        uint256 id = nextGroupId++;
        Group storage g = groups[id];
        g.id = id;
        g.tokenType = tokenType;
        g.tokenAddr = tokenAddr;
        g.stakeAmount = stakeAmount;
        g.maxSize = maxSize;
        g.sessionDuration = sessionDuration;
        g.maxInactivity = maxInactivity;
        g.creator = msg.sender;

        emit GroupCreated(id, msg.sender, tokenType, tokenAddr, stakeAmount, maxSize, sessionDuration, maxInactivity);
        return id;
    }

    /// @notice Join a group and stake the required amount. For native token, send value equal to stakeAmount.
    function joinGroup(uint256 groupId) external payable nonReentrant {
        Group storage g = groups[groupId];
        require(g.id != 0, "no group");
        require(!g.started, "already started");
        require(g.participants.length < g.maxSize, "full");
        require(g.participantIndex[msg.sender] == 0, "already joined");

        if (g.tokenType == TokenType.NATIVE) {
            require(msg.value == g.stakeAmount, "wrong native amt");
        } else {
            require(msg.value == 0, "do not send native");
            require(g.tokenAddr != address(0), "token addr 0");
        }

        // State changes
        g.participants.push(Participant({
            addr: msg.sender,
            stake: g.stakeAmount,
            status: ParticipantStatus.JOINED
        }));
        g.participantIndex[msg.sender] = g.participants.length; // store index+1
        g.totalCollected += g.stakeAmount;

        // Interactions
        if (g.tokenType == TokenType.ERC20) {
            bool ok = IERC20(g.tokenAddr).transferFrom(msg.sender, address(this), g.stakeAmount);
            require(ok, "erc20 transferFrom fail");
        }

        emit Joined(groupId, msg.sender);
    }

    /// @notice A creator or any participant can start the session once enough people have joined.
    ///         Starting sets initial lastAlive timestamps so the first inactivity window begins from start.
    function startSession(uint256 groupId) external {
        Group storage g = groups[groupId];
        require(g.id != 0, "no group");
        require(!g.started, "already started");
        require(g.participants.length >= 2, "need >=2 participants");

        g.started = true;
        g.startTimestamp = block.timestamp;

        // initialize lastAlive for all participants to start time
        for (uint256 i = 0; i < g.participants.length; ++i) {
            address paddr = g.participants[i].addr;
            lastAlive[groupId][paddr] = g.startTimestamp;
            emit LivenessPinged(groupId, paddr, g.startTimestamp);
        }

        emit Started(groupId, g.startTimestamp);
    }

    /// @notice Participant marks themselves completed (must be participant and session started)
    function markCompleted(uint256 groupId) external {
        Group storage g = groups[groupId];
        require(g.id != 0, "no group");
        require(g.participantIndex[msg.sender] != 0, "not participant");
        uint256 idx = g.participantIndex[msg.sender] - 1;
        Participant storage p = g.participants[idx];
        require(p.status == ParticipantStatus.JOINED, "cannot complete");
        require(g.started, "not started");

        p.status = ParticipantStatus.COMPLETED;
        g.totalCompleted += 1;

        emit MarkedCompleted(groupId, msg.sender);
    }

    /// @notice Participant can voluntarily leave (before start). If they leave after start -> considered dropout/AFK (bot mark).
    function leaveGroupBeforeStart(uint256 groupId) external nonReentrant {
        Group storage g = groups[groupId];
        require(g.id != 0, "no group");
        require(!g.started, "already started");
        require(g.participantIndex[msg.sender] != 0, "not participant");
        uint256 idx = g.participantIndex[msg.sender] - 1;
        Participant storage p = g.participants[idx];
        require(p.status == ParticipantStatus.JOINED, "cannot leave");

        // remove participant by swapping with last and pop
        uint256 lastIdx = g.participants.length - 1;
        if (idx != lastIdx) {
            Participant storage lastP = g.participants[lastIdx];
            g.participants[idx] = lastP;
            g.participantIndex[lastP.addr] = idx + 1;
        }
        g.participants.pop();
        delete g.participantIndex[msg.sender];

        g.totalCollected -= p.stake;

        // return stake immediately
        if (g.tokenType == TokenType.NATIVE) {
            (bool sent,) = msg.sender.call{value: p.stake}("");
            require(sent, "native refund failed");
        } else {
            bool ok = IERC20(g.tokenAddr).transfer(msg.sender, p.stake);
            require(ok, "erc20 refund failed");
        }

        emit Left(groupId, msg.sender);
    }

    // ---------- Liveness: userPing (by user) and markAFK (by bot) ----------
    /// @notice Called by participant when they respond to the bot's liveness ping.
    function userPing(uint256 groupId) external {
        Group storage g = groups[groupId];
        require(g.id != 0, "no group");
        require(g.started, "not started");
        require(g.participantIndex[msg.sender] != 0, "not participant");

        // only participants in JOINED status can ping (COMPLETED or FAILED or WITHDRAWN cannot)
        uint256 idx = g.participantIndex[msg.sender] - 1;
        Participant storage p = g.participants[idx];
        require(p.status == ParticipantStatus.JOINED, "not eligible to ping");

        lastAlive[groupId][msg.sender] = block.timestamp;
        emit LivenessPinged(groupId, msg.sender, block.timestamp);
    }

    /// @notice Bot marks one user as AFK (call when bot decides user failed to respond in time).
    function markAFK(uint256 groupId, address user) external onlyBot {
        Group storage g = groups[groupId];
        require(g.id != 0, "no group");
        require(g.started, "not started");
        require(g.participantIndex[user] != 0, "not participant");

        uint256 idx = g.participantIndex[user] - 1;
        Participant storage p = g.participants[idx];
        // Only mark if they were still JOINED and not already COMPLETED/FAILED/WITHDRAWN
        require(p.status == ParticipantStatus.JOINED, "cannot mark AFK");
        p.status = ParticipantStatus.FAILED;

        emit UserFailedLiveness(groupId, user);
    }

    /// @notice Bot can batch mark multiple users as AFK.
    function markAFKBatch(uint256 groupId, address[] calldata users) external onlyBot {
        Group storage g = groups[groupId];
        for (uint256 i = 0; i < users.length; ++i) {
            address u = users[i];
            if (g.id == 0) continue;
            if (!g.started) continue;
            if (g.participantIndex[u] == 0) continue;
            uint256 idx = g.participantIndex[u] - 1;
            Participant storage p = g.participants[idx];
            if (p.status == ParticipantStatus.JOINED) {
                p.status = ParticipantStatus.FAILED;
                emit UserFailedLiveness(groupId, u);
            }
        }
    }

    // ---------- Finalization & Payouts ----------
    /// @notice Finalize group after session duration has passed. Anyone can call.
    ///          Calculates totals, retains forfeited stakes in contract vault,
    ///          and makes per-participant withdrawable amounts.
    function finalizeGroup(uint256 groupId) external nonReentrant {
        Group storage g = groups[groupId];
        require(g.id != 0, "no group");
        require(g.started, "not started");
        require(!g.finalized, "already finalized");
        require(block.timestamp >= g.startTimestamp + g.sessionDuration, "session not ended");

        uint256 n = g.participants.length;
        uint256 totalCollected = g.totalCollected;
        uint256 totalCompleted = 0;
        uint256 dropouts = 0;

        // Count completed and dropouts
        for (uint256 i = 0; i < n; ++i) {
            Participant storage p = g.participants[i];
            if (p.status == ParticipantStatus.COMPLETED) {
                totalCompleted += 1;
            } else {
                dropouts += 1;
            }
        }

        g.totalCompleted = totalCompleted;

        uint256 forfeited = 0;
        if (totalCompleted == 0) {
            // All stakes forfeited
            forfeited = totalCollected;
            for (uint256 i = 0; i < n; ++i) {
                g.participants[i].stake = 0;
            }
        } else {
            forfeited = g.stakeAmount * dropouts;
            uint256 bonusPool = forfeited;
            uint256 share = bonusPool / totalCompleted;
            uint256 remainder = bonusPool % totalCompleted;
            uint256 lastCompletedIndex = type(uint256).max;

            for (uint256 i = 0; i < n; ++i) {
                Participant storage p = g.participants[i];
                if (p.status == ParticipantStatus.COMPLETED) {
                    p.stake = g.stakeAmount + share;
                    lastCompletedIndex = i;
                } else {
                    p.stake = 0;
                }
            }

            // Add remainder to the last completed participant's stake
            if (lastCompletedIndex != type(uint256).max) {
                g.participants[lastCompletedIndex].stake += remainder;
            }
        }


        g.finalized = true;
        emit Finalized(groupId, totalCollected, g.totalCompleted, forfeited);
    }

    /// @notice Emergency finalize by owner if session has been over for twice the duration and not finalized.
    ///         Marks all non-completed participants as FAILED, then proceeds with standard finalization.
    function emergencyFinalize(uint256 groupId) external onlyOwner nonReentrant {
        Group storage g = groups[groupId];
        require(g.id != 0, "no group");
        require(g.started, "not started");
        require(!g.finalized, "already finalized");
        require(block.timestamp > g.startTimestamp + g.sessionDuration * 2, "not emergency time");

        // Mark all non-completed as FAILED
        for (uint256 i = 0; i < g.participants.length; ++i) {
            if (g.participants[i].status == ParticipantStatus.JOINED) {
                g.participants[i].status = ParticipantStatus.FAILED;
                emit UserFailedLiveness(groupId, g.participants[i].addr);
            }
        }

        // Proceed with standard finalization logic
        uint256 n = g.participants.length;
        uint256 totalCollected = g.totalCollected;
        uint256 totalCompleted = 0;
        uint256 dropouts = 0;

        // Count completed and dropouts
        for (uint256 i = 0; i < n; ++i) {
            Participant storage p = g.participants[i];
            if (p.status == ParticipantStatus.COMPLETED) {
                totalCompleted += 1;
            } else {
                dropouts += 1;
            }
        }

        g.totalCompleted = totalCompleted;

        uint256 forfeited = 0;
        if (totalCompleted == 0) {
            // All stakes forfeited
            forfeited = totalCollected;
            for (uint256 i = 0; i < n; ++i) {
                g.participants[i].stake = 0;
            }
        } else {
            forfeited = g.stakeAmount * dropouts;
            uint256 bonusPool = forfeited;
            uint256 share = bonusPool / totalCompleted;
            uint256 remainder = bonusPool % totalCompleted;
            uint256 lastCompletedIndex = type(uint256).max;

            for (uint256 i = 0; i < n; ++i) {
                Participant storage p = g.participants[i];
                if (p.status == ParticipantStatus.COMPLETED) {
                    p.stake = g.stakeAmount + share;
                    lastCompletedIndex = i;
                } else {
                    p.stake = 0;
                }
            }

            // Add remainder to the last completed participant's stake
            if (lastCompletedIndex != type(uint256).max) {
                g.participants[lastCompletedIndex].stake += remainder;
            }
        }


        g.finalized = true;
        emit Finalized(groupId, totalCollected, g.totalCompleted, forfeited);
        emit EmergencyFinalized(groupId);
    }

    /// @notice Withdraw available amount after group is finalized (pull).
    function withdraw(uint256 groupId) external nonReentrant {
        Group storage g = groups[groupId];
        require(g.id != 0, "no group");
        require(g.finalized, "not finalized");
        require(g.participantIndex[msg.sender] != 0, "not participant");
        uint256 idx = g.participantIndex[msg.sender] - 1;
        Participant storage p = g.participants[idx];
        require(p.status != ParticipantStatus.WITHDRAWN, "already withdrawn");

        uint256 amount = p.stake;
        p.stake = 0;
        p.status = ParticipantStatus.WITHDRAWN;

        if (amount == 0) {
            emit Withdrawn(groupId, msg.sender, 0);
            return;
        }

        if (g.tokenType == TokenType.NATIVE) {
            (bool sent,) = msg.sender.call{value: amount}("");
            require(sent, "native send fail");
        } else {
            bool ok = IERC20(g.tokenAddr).transfer(msg.sender, amount);
            require(ok, "erc20 send fail");
        }

        emit Withdrawn(groupId, msg.sender, amount);
    }

    /// @notice Emergency withdraw excess tokens by owner. For native token, token=address(0).
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "amount >0");
        if (token == address(0)) {
            // native
            require(address(this).balance >= amount, "insufficient balance");
            (bool sent,) = payable(owner()).call{value: amount}("");
            require(sent, "send fail");
        } else {
            // ERC20
            require(IERC20(token).balanceOf(address(this)) >= amount, "insufficient balance");
            bool ok = IERC20(token).transfer(owner(), amount);
            require(ok, "transfer fail");
        }
        emit EmergencyWithdrawn(token, amount);
    }

    // ---------- View helpers ----------
    enum GroupState { Forming, Active, Ended }

    function getGroupState(uint256 groupId) public view returns (GroupState) {
        Group storage g = groups[groupId];
        require(g.id != 0, "no group");
        if (!g.started) return GroupState.Forming;
        if (!g.finalized) return GroupState.Active;
        return GroupState.Ended;
    }

    /// @notice Get basic group info
    function getGroupSummary(uint256 groupId) external view returns (
        uint256 id,
        TokenType tokenType,
        address tokenAddr,
        uint256 stakeAmount,
        uint256 maxSize,
        uint256 sessionDuration,
        uint256 maxInactivity,
        bool started,
        bool finalized,
        uint256 startTimestamp,
        uint256 totalCollected,
        uint256 totalCompleted,
        uint256 joinedCount,
        address creator
    ) {
        Group storage g = groups[groupId];
        require(g.id != 0, "no group");
        return (
            g.id,
            g.tokenType,
            g.tokenAddr,
            g.stakeAmount,
            g.maxSize,
            g.sessionDuration,
            g.maxInactivity,
            g.started,
            g.finalized,
            g.startTimestamp,
            g.totalCollected,
            g.totalCompleted,
            g.participants.length,
            g.creator
        );
    }

    /// @notice Get participant info for a group (index-based)
    function getParticipant(uint256 groupId, uint256 index) external view returns (address addr, uint256 stake, ParticipantStatus status, uint256 lastAliveTs) {
        Group storage g = groups[groupId];
        require(g.id != 0, "no group");
        require(index < g.participants.length, "idx OOB");
        Participant storage p = g.participants[index];
        return (p.addr, p.stake, p.status, lastAlive[groupId][p.addr]);
    }

    /// @notice Convenience: is participant considered "alive" according to lastAlive and group's maxInactivity
    function isAlive(uint256 groupId, address user) external view returns (bool) {
        Group storage g = groups[groupId];
        require(g.id != 0, "no group");
        if (!g.started) return false;
        uint256 last = lastAlive[groupId][user];
        if (last == 0) return false;
        return (block.timestamp - last) <= g.maxInactivity;
    }

    // ---------- Fallback to receive native tokens ----------
    receive() external payable {}
    fallback() external payable {}
}
