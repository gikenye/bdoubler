require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// Load environment variables
// CELO_SEPOLIA_RPC_URL="https://sepolia.celoscan.io"
const CELO_SEPOLIA_RPC_URL="https://forno.celo-sepolia.celo-testnet.org"

// const CELO_SEPOLIA_RPC_URL = process.env.CELO_SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!CELO_SEPOLIA_RPC_URL || !PRIVATE_KEY) {
  console.error('Please set CELO_SEPOLIA_RPC_URL and PRIVATE_KEY in your .env file');
  process.exit(1);
}

// Load contract artifacts
const focusStakingArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, '../out/FocusStaking.sol/FocusStaking.json'), 'utf8'));
const erc1967ProxyArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, '../out/ERC1967Proxy.sol/ERC1967Proxy.json'), 'utf8'));

async function main() {
  console.log('Starting deployment to Celo Sepolia...');

  // Create provider and signer
  const provider = new ethers.JsonRpcProvider(CELO_SEPOLIA_RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log('Deployer address:', signer.address);

  // Deploy implementation contract
  console.log('Deploying FocusStaking implementation...');
  const FocusStakingFactory = new ethers.ContractFactory(
    focusStakingArtifact.abi,
    focusStakingArtifact.bytecode,
    signer
  );

  const implementation = await FocusStakingFactory.deploy();
  await implementation.waitForDeployment();

  const implementationAddress = await implementation.getAddress();
  console.log('FocusStaking implementation deployed at:', implementationAddress);

  // Prepare initialization data
  const stakingProtocol = ethers.ZeroAddress;
  const communityPool = ethers.ZeroAddress;

  const focusStakingInterface = new ethers.Interface(focusStakingArtifact.abi);
  const initData = focusStakingInterface.encodeFunctionData('initialize', [
    stakingProtocol,
    communityPool
  ]);

  console.log('Initialization data prepared');

  // Deploy ERC1967Proxy
  console.log('Deploying ERC1967Proxy...');
  const ERC1967ProxyFactory = new ethers.ContractFactory(
    erc1967ProxyArtifact.abi,
    erc1967ProxyArtifact.bytecode,
    signer
  );

  const proxy = await ERC1967ProxyFactory.deploy(implementationAddress, initData);
  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  console.log('ERC1967Proxy deployed at:', proxyAddress);

  // Verify deployment
  const deployedContract = new ethers.Contract(proxyAddress, focusStakingArtifact.abi, provider);
  const owner = await deployedContract.owner();
  console.log('Contract owner:', owner);
  console.log('Staking protocol:', await deployedContract.stakingProtocol());
  console.log('Community pool:', await deployedContract.communityPool());

  console.log('\nDeployment completed successfully!');
  console.log('Proxy address (use this for interactions):', proxyAddress);
  console.log('Implementation address:', implementationAddress);
}

main().catch(console.error);