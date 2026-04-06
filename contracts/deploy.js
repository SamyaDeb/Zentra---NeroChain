const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
  console.log("🚀 Deploying TrustCircles contract to NERO Chain Testnet...");
  
  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider("https://rpc-testnet.nerochain.io");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log("📍 Deploying from address:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "NERO");

  if (balance === 0n) {
    console.log("❌ No NERO tokens! Get testnet tokens from: https://app.testnet.nerochain.io/faucet");
    process.exit(1);
  }

  // Read contract
  const contractPath = "./contracts/TrustCircles.sol";
  const contractSource = fs.readFileSync(contractPath, "utf8");
  
  // Compile using hardhat
  const hre = require("hardhat");
  await hre.run("compile");
  
  const artifact = require("../artifacts/contracts/TrustCircles.sol/TrustCircles.json");
  
  // Deploy
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  console.log("⏳ Deploying contract...");
  
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log("\n✅ TrustCircles deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Admin Address:", wallet.address);
  console.log("🔗 View on NeroScan:", `https://testnet.neroscan.io/address/${contractAddress}`);
  console.log("\n💾 Update this address in lib/contract.ts!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
