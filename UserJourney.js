require('dotenv').config();
const { ethers } = require('ethers');

// Read Celo Sepolia RPC URL from .env
const RPC_URL = process.env.CELO_SEPOLIA_RPC_URL;
if (!RPC_URL) {
  console.error('CELO_SEPOLIA_RPC_URL not found in .env file');
  process.exit(1);
}

// Read deployer's private key from .env
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error('PRIVATE_KEY not found in .env file');
  process.exit(1);
}


// Contract ABI - minimal for the functions we need
const CONTRACT_ABI = [
  // createGroup
  "function createGroup(uint8 tokenType, address tokenAddr, uint256 stakeAmount, uint256 maxSize, uint256 sessionDuration, uint256 maxInactivity) returns (uint256)",
  // joinGroup
  "function joinGroup(uint256 groupId) payable",
  // startSession
  "function startSession(uint256 groupId)",
  // userPing
  "function userPing(uint256 groupId)",
  // markAFK
  "function markAFK(uint256 groupId, address user)",
  // finalizeGroup
  "function finalizeGroup(uint256 groupId)",
  // withdraw
  "function withdraw(uint256 groupId)",
  // getGroupSummary
  "function getGroupSummary(uint256 groupId) view returns (uint256, uint8, address, uint256, uint256, uint256, uint256, bool, bool, uint256, uint256, uint256, uint256, address)",
  // getParticipant
  "function getParticipant(uint256 groupId, uint256 index) view returns (address, uint256, uint8, uint256)",
  // setBot
  "function setBot(address newBot)",
  // nextGroupId
  "function nextGroupId() view returns (uint256)",
  // initialize
  "function initialize(address _stakingProtocol, address _communityPool)"
];

async function main() {
  const contractAddress = process.argv[2];
  if (!contractAddress) {
    console.error('Usage: node simulateUserJourney.js <contractAddress>');
    process.exit(1);
  }

  console.log('Starting simulation with contract:', contractAddress);

  // Create provider
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Create deployer for owner functions
  const deployer = new ethers.Wallet(PRIVATE_KEY, provider);
  
  // Log deployer balance
  const deployerBalance = await provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(deployerBalance)} CELO`);

  // Create 3 random wallets
  const wallets = [];
  for (let i = 0; i < 3; i++) {
    const wallet = ethers.Wallet.createRandom().connect(provider);
    wallets.push(wallet);
    console.log(`Wallet ${i + 1}: ${wallet.address}`);
  }

  // Fund the wallets
  console.log('Funding wallets...');
  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    const fundTx = await deployer.sendTransaction({
      to: wallet.address,
      value: ethers.parseEther('0.05') // Fund with 0.05 CELO each
    });
    await fundTx.wait();
    console.log(`Fund wallet: Transaction hash: ${fundTx.hash}, Wallet: ${wallet.address}, Amount: 0.05 CELO`);
  }
  console.log('Wallets funded');

  // Log initial balances
  console.log('\n=== Initial Balances ===');
  for (let i = 0; i < wallets.length; i++) {
    const balance = await provider.getBalance(wallets[i].address);
    console.log(`Wallet ${i + 1} balance: ${ethers.formatEther(balance)} CELO`);
  }

 // Connect to contract
  const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);

  // Use deployer for owner-only functions
  const contractWithDeployer = contract.connect(deployer);

  // Set bot to wallet 0 for simplicity
  const setBotTx = await contractWithDeployer.setBot(wallets[0].address);
  await setBotTx.wait();
  console.log(`Set bot: Transaction hash: ${setBotTx.hash}, Bot address: ${wallets[0].address}`);
  console.log('Bot set to:', wallets[0].address);

  // Use wallet 0 as the signer for other operations
  const signer = wallets[0];
  const contractWithSigner = contract.connect(signer);

  // Create group
  const stakeAmount = ethers.parseEther('0.0001'); // 0.0001 CELO
  const maxSize = 3;
  const sessionDuration = 60; // 1 minute for faster simulation
  const maxInactivity = 30; // 30 seconds

  console.log('Creating group...');
  const groupId = await contract.nextGroupId();
  const tx = await contractWithSigner.createGroup(0, ethers.ZeroAddress, stakeAmount, maxSize, sessionDuration, maxInactivity);
  await tx.wait();
  console.log(`Create group: Transaction hash: ${tx.hash}, Group ID: ${groupId}, Token type: 0, Token addr: ${ethers.ZeroAddress}, Stake amount: ${stakeAmount}, Max size: ${maxSize}, Session duration: ${sessionDuration}, Max inactivity: ${maxInactivity}`);
  console.log('Group created with ID:', Number(groupId));

  //  groupId to number Convertfor contract calls
  const groupIdNum = Number(groupId);

  // All 3 join
  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    const contractWithWallet = contract.connect(wallet);
    console.log(`Wallet ${i + 1} joining group...`);
    const joinTx = await contractWithWallet.joinGroup(groupIdNum, { value: stakeAmount });
    await joinTx.wait();
    console.log(`Join group ${groupIdNum}: Transaction hash: ${joinTx.hash}, Wallet: ${wallet.address}, Stake: ${stakeAmount}`);
    console.log(`Wallet ${i + 1} joined`);
  }

  // Log balances after joining
  console.log('\n=== Balances After Joining ===');
  for (let i = 0; i < wallets.length; i++) {
    const balance = await provider.getBalance(wallets[i].address);
    console.log(`Wallet ${i + 1} balance: ${ethers.formatEther(balance)} CELO`);
  }

  // Start session
  console.log('Starting session...');
  const startTx = await contractWithSigner.startSession(groupIdNum);
  await startTx.wait();
  console.log(`Start session: Transaction hash: ${startTx.hash}, Group ID: ${groupIdNum}`);
  console.log('Session started');

  // Get start time
  const summary = await contract.getGroupSummary(groupIdNum);
  const startTimestamp = summary[9]; // startTimestamp
  console.log('Start timestamp:', new Date(Number(startTimestamp) * 1000));

  // Simulate pings over time
  // Ping every 10 seconds for 50 seconds (session is 60 sec)
  const pingInterval = 10; // seconds
  const totalPings = Math.floor(sessionDuration / pingInterval) - 1; // leave last 10 sec for AFK

  for (let ping = 0; ping < totalPings; ping++) {
    console.log(`Ping round ${ping + 1}/${totalPings}`);
    for (let i = 0; i < wallets.length; i++) {
      if (i === 2 && ping >= totalPings - 1) { // Mark wallet 3 as AFK in last ping
        continue;
      }
      const wallet = wallets[i];
      const contractWithWallet = contract.connect(wallet);
      try {
        const pingTx = await contractWithWallet.userPing(groupIdNum);
        await pingTx.wait();
        console.log(`User ping: Transaction hash: ${pingTx.hash}, Group ID: ${groupIdNum}, Wallet: ${wallet.address}`);
        console.log(`Wallet ${i + 1} pinged`);
      } catch (e) {
        console.log(`Wallet ${i + 1} ping failed:`, e.message);
      }
    }
    // Wait for next ping
    await delay(pingInterval * 1000);
  }

  // Mark one as AFK (wallet 3)
  console.log('Marking wallet 3 as AFK...');
  const markTx = await contractWithSigner.markAFK(groupIdNum, wallets[2].address);
  await markTx.wait();
  console.log(`Mark AFK: Transaction hash: ${markTx.hash}, Group ID: ${groupIdNum}, User: ${wallets[2].address}`);
  console.log('Wallet 3 marked as AFK');

  // Wait for session to end
  const now = Math.floor(Date.now() / 1000);
  const endTime = Number(startTimestamp) + sessionDuration;
  const waitTime = endTime - now;
  if (waitTime > 0) {
    console.log(`Waiting ${waitTime} seconds for session to end...`);
    await delay(waitTime * 1000);
  }

  // Finalize
  console.log('Finalizing group...');
  const finalizeTx = await contractWithSigner.finalizeGroup(groupIdNum);
  await finalizeTx.wait();
  console.log(`Finalize group: Transaction hash: ${finalizeTx.hash}, Group ID: ${groupIdNum}`);
  console.log('Group finalized');

  // Withdraw for all
  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    const contractWithWallet = contract.connect(wallet);
    console.log(`Wallet ${i + 1} withdrawing...`);
    try {
      const withdrawTx = await contractWithWallet.withdraw(groupIdNum);
      await withdrawTx.wait();
      console.log(`Withdraw: Transaction hash: ${withdrawTx.hash}, Group ID: ${groupIdNum}, Wallet: ${wallet.address}`);
      console.log(`Wallet ${i + 1} withdrawn`);
    } catch (e) {
      console.log(`Wallet ${i + 1} withdraw failed:`, e.message);
    }
  }

  // Log final balances
  console.log('\n=== Final Balances ===');
  for (let i = 0; i < wallets.length; i++) {
    const balance = await provider.getBalance(wallets[i].address);
    console.log(`Wallet ${i + 1} balance: ${ethers.formatEther(balance)} CELO`);
  }

  // Transfer excess CELO back to deployer to avoid insufficient gas
  console.log('\n=== Transferring Excess CELO ===');
  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    const balance = await provider.getBalance(wallet.address);
    const gasReserve = ethers.parseEther('0.005'); // keep 0.005 for gas
    if (balance > gasReserve) {
      const excess = balance - gasReserve;
      const transferTx = await wallet.sendTransaction({
        to: deployer.address,
        value: excess
      });
      await transferTx.wait();
      console.log(`Transfer excess: Transaction hash: ${transferTx.hash}, From: ${wallet.address}, To: ${deployer.address}, Amount: ${ethers.formatEther(excess)} CELO`);
    } else {
      console.log(`Wallet ${i + 1} has insufficient balance for transfer: ${ethers.formatEther(balance)} CELO`);
    }
  }

  console.log('Simulation complete');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);