/**
 * Quick Contract Connection Test
 * Verifies that the frontend can read from the deployed contract
 */

const ethers = require("ethers");
require("dotenv").config();

const contractArtifact = require("./artifacts/contracts/TrustCircles.sol/TrustCircles.json");
const CONTRACT_ABI = contractArtifact.abi;
const CONTRACT_ADDRESS = "0xbfA80344cD3f706C80EF9924560E87E422507867";

async function testContractConnection() {
  console.log("🔍 Testing Contract Connection\n");
  console.log("Contract Address:", CONTRACT_ADDRESS);
  console.log("Network: NeroChain Testnet\n");

  try {
    // Connect to NeroChain Testnet
    const provider = new ethers.JsonRpcProvider("https://rpc-testnet.nerochain.io");
    
    // Create contract instance (read-only)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    // Test 1: Read admin address
    console.log("✅ Test 1: Reading admin address...");
    const admin = await contract.admin();
    console.log("   Admin:", admin);
    
    // Test 2: Read contract balance
    console.log("\n✅ Test 2: Reading contract balance...");
    const balance = await contract.getContractBalance();
    console.log("   Balance:", ethers.formatEther(balance), "NERO");
    
    // Test 3: Read circle count
    console.log("\n✅ Test 3: Reading circle count...");
    const circleCount = await contract.circleCount();
    console.log("   Total Circles:", circleCount.toString());
    
    // Test 4: Read loan count
    console.log("\n✅ Test 4: Reading loan count...");
    const loanCount = await contract.loanCount();
    console.log("   Total Loans:", loanCount.toString());
    
    // Test 5: Read constants
    console.log("\n✅ Test 5: Reading contract constants...");
    const minStake = await contract.MIN_STAKE();
    console.log("   MIN_STAKE:", ethers.formatEther(minStake), "NERO");
    
    const maxScore = await contract.MAX_SCORE();
    console.log("   MAX_SCORE:", maxScore.toString());
    
    const startingScore = await contract.STARTING_SCORE();
    console.log("   STARTING_SCORE:", startingScore.toString());
    
    const loanDuration = await contract.LOAN_DURATION();
    console.log("   LOAN_DURATION:", (Number(loanDuration) / 86400).toFixed(0), "days");
    
    // Test 6: Check if demo mode is enabled
    console.log("\n✅ Test 6: Checking demo mode...");
    const isDemoMode = await contract.isDemoMode();
    console.log("   Demo Mode:", isDemoMode ? "Enabled" : "Disabled");
    
    if (isDemoMode) {
      const demoLoanDuration = await contract.demoLoanDuration();
      console.log("   Demo Loan Duration:", (Number(demoLoanDuration) / 60).toFixed(0), "minutes");
    }
    
    // Test 7: Get user stats for admin
    console.log("\n✅ Test 7: Reading admin user stats...");
    const adminStats = await contract.getUserStats(admin);
    console.log("   Circle ID:", adminStats[0].toString());
    console.log("   Individual Score:", adminStats[1].toString());
    console.log("   Final Trust Score:", adminStats[2].toString());
    console.log("   Max Loan Amount:", ethers.formatEther(adminStats[3]), "NERO");
    console.log("   Interest Rate:", adminStats[4].toString(), "%");
    console.log("   Is Active:", adminStats[9]);
    
    // Test 8: If there are circles, get details of the first one
    if (Number(circleCount) > 0) {
      console.log("\n✅ Test 8: Reading first circle details...");
      const circleDetails = await contract.getCircleDetails(0);
      console.log("   Name:", circleDetails[0]);
      console.log("   Members:", circleDetails[2].toString());
      console.log("   Average Score:", circleDetails[3].toString());
      console.log("   Total Stake:", ethers.formatEther(circleDetails[4]), "NERO");
      console.log("   Is Active:", circleDetails[5]);
    }
    
    // Test 9: If there are loans, get details of the first one
    if (Number(loanCount) > 0) {
      console.log("\n✅ Test 9: Reading first loan details...");
      const loanDetails = await contract.getLoanDetails(0);
      console.log("   Borrower:", loanDetails[0]);
      console.log("   Amount:", ethers.formatEther(loanDetails[1]), "NERO");
      console.log("   Total Repayment:", ethers.formatEther(loanDetails[2]), "NERO");
      console.log("   Approved:", loanDetails[4]);
      console.log("   Disbursed:", loanDetails[5]);
      console.log("   Repaid:", loanDetails[6]);
      console.log("   Purpose:", loanDetails[7]);
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ ALL CONNECTION TESTS PASSED!");
    console.log("=".repeat(50));
    console.log("\n🎉 Contract is accessible and working correctly!");
    console.log("🌐 Explorer: https://testnet.neroscan.io/address/" + CONTRACT_ADDRESS);
    console.log("\n");
    
  } catch (error) {
    console.error("\n❌ CONNECTION TEST FAILED");
    console.error("Error:", error.message);
    if (error.code) {
      console.error("Error Code:", error.code);
    }
    process.exit(1);
  }
}

testContractConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
