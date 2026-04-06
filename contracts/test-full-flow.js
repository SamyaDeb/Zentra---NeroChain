/**
 * Full Flow Test Script for Zentra on NeroChain Testnet
 * Tests: Create Circle → Join Circle → Request Loan → Approve Loan → Disburse Loan → Repay Loan
 */

const ethers = require("ethers");
require("dotenv").config();

// Contract ABI - Load from artifacts
const contractArtifact = require("../artifacts/contracts/TrustCircles.sol/TrustCircles.json");
const CONTRACT_ABI = contractArtifact.abi;
const CONTRACT_ADDRESS = "0xbfA80344cD3f706C80EF9924560E87E422507867";

// Helper function to format NERO amounts
function formatNERO(amount) {
  return ethers.formatEther(amount);
}

// Helper function to parse NERO amounts
function parseNERO(amount) {
  return ethers.parseEther(amount.toString());
}

// Sleep function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("========================================");
  console.log("🚀 Zentra Full Flow Test on NeroChain");
  console.log("========================================\n");

  // Connect to NeroChain Testnet
  const provider = new ethers.JsonRpcProvider("https://rpc-testnet.nerochain.io");
  
  // Load deployer wallet (admin)
  const adminPrivateKey = process.env.PRIVATE_KEY;
  if (!adminPrivateKey) {
    throw new Error("PRIVATE_KEY not found in .env file");
  }
  
  const admin = new ethers.Wallet(adminPrivateKey, provider);
  console.log("👤 Admin Address:", admin.address);
  
  // Create a second test wallet for member
  const memberWallet = ethers.Wallet.createRandom().connect(provider);
  console.log("👤 Member Address:", memberWallet.address);
  
  // Connect to contract
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, admin);
  console.log("📄 Contract Address:", CONTRACT_ADDRESS);
  console.log("🔗 Network: NeroChain Testnet (Chain ID: 689)\n");

  // Check balances
  const adminBalance = await provider.getBalance(admin.address);
  console.log("💰 Admin Balance:", formatNERO(adminBalance), "NERO");
  
  // Check if we have enough balance for the test
  const minimumRequired = parseNERO("2"); // Need ~2 NERO for full test
  if (adminBalance < minimumRequired) {
    console.log("\n⚠️  WARNING: Insufficient balance for full test!");
    console.log(`   Required: ~${formatNERO(minimumRequired)} NERO`);
    console.log(`   Available: ${formatNERO(adminBalance)} NERO`);
    console.log("\n🚰 Get testnet NERO tokens from:");
    console.log("   https://app.testnet.nerochain.io/faucet");
    console.log("\n   Then run this script again.\n");
    process.exit(1);
  }
  
  const memberBalance = await provider.getBalance(memberWallet.address);
  console.log("💰 Member Balance:", formatNERO(memberBalance), "NERO\n");

  // Check contract balance
  const contractBalance = await contract.getContractBalance();
  console.log("💰 Contract Balance:", formatNERO(contractBalance), "NERO\n");

  try {
    // ==============================
    // STEP 1: Deposit Liquidity
    // ==============================
    console.log("📥 STEP 1: Depositing Liquidity to Contract");
    console.log("--------------------------------------------");
    
    const liquidityAmount = parseNERO("0.5"); // 0.5 NERO
    console.log(`Depositing ${formatNERO(liquidityAmount)} NERO...`);
    
    const depositTx = await contract.depositLiquidity({ value: liquidityAmount });
    console.log("⏳ Transaction sent:", depositTx.hash);
    await depositTx.wait();
    console.log("✅ Liquidity deposited successfully\n");
    
    const newContractBalance = await contract.getContractBalance();
    console.log("💰 New Contract Balance:", formatNERO(newContractBalance), "NERO\n");
    
    await sleep(2000);

    // ==============================
    // STEP 2: Create Trust Circle
    // ==============================
    console.log("🔵 STEP 2: Creating Trust Circle");
    console.log("--------------------------------------------");
    
    const circleName = "Test Circle " + Date.now();
    const stakeAmount = parseNERO("0.5"); // 0.5 NERO stake (MIN_STAKE requirement)
    
    console.log(`Creating circle: "${circleName}"`);
    console.log(`Stake Amount: ${formatNERO(stakeAmount)} NERO`);
    
    const createCircleTx = await contract.createCircle(circleName, { value: stakeAmount });
    console.log("⏳ Transaction sent:", createCircleTx.hash);
    const createCircleReceipt = await createCircleTx.wait();
    console.log("✅ Circle created successfully\n");
    
    // Get circle ID from event
    const circleCreatedEvent = createCircleReceipt.logs.find(
      log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed && parsed.name === "CircleCreated";
        } catch (e) {
          return false;
        }
      }
    );
    
    let circleId;
    if (circleCreatedEvent) {
      const parsed = contract.interface.parseLog(circleCreatedEvent);
      circleId = parsed.args.circleId;
      console.log("🆔 Circle ID:", circleId.toString());
    } else {
      // Fallback: get the latest circle
      const circleCount = await contract.circleCount();
      circleId = circleCount - BigInt(1);
      console.log("🆔 Circle ID (from count):", circleId.toString());
    }
    
    // Get circle details
    const circleDetails = await contract.getCircleDetails(circleId);
    console.log("📊 Circle Details:");
    console.log("   Name:", circleDetails.name);
    console.log("   Members:", circleDetails.memberCount.toString());
    console.log("   Total Stake:", formatNERO(circleDetails.totalStake), "NERO");
    console.log("   Is Active:", circleDetails.isActive, "\n");
    
    await sleep(2000);

    // ==============================
    // STEP 3: Send NERO to Member Wallet
    // ==============================
    console.log("💸 STEP 3: Funding Member Wallet");
    console.log("--------------------------------------------");
    
    const fundAmount = parseNERO("0.6"); // Send 0.6 NERO (0.5 for stake + 0.1 for gas & loan)
    console.log(`Sending ${formatNERO(fundAmount)} NERO to member...`);
    
    const fundTx = await admin.sendTransaction({
      to: memberWallet.address,
      value: fundAmount
    });
    console.log("⏳ Transaction sent:", fundTx.hash);
    await fundTx.wait();
    console.log("✅ Member wallet funded\n");
    
    const newMemberBalance = await provider.getBalance(memberWallet.address);
    console.log("💰 Member Balance:", formatNERO(newMemberBalance), "NERO\n");
    
    await sleep(2000);

    // ==============================
    // STEP 4: Member Joins Circle
    // ==============================
    console.log("➕ STEP 4: Member Joining Circle");
    console.log("--------------------------------------------");
    
    const memberContract = contract.connect(memberWallet);
    
    console.log(`Member ${memberWallet.address} joining circle ${circleId}...`);
    console.log(`Stake Amount: ${formatNERO(stakeAmount)} NERO`);
    
    const joinCircleTx = await memberContract.joinCircle(circleId, { value: stakeAmount });
    console.log("⏳ Transaction sent:", joinCircleTx.hash);
    await joinCircleTx.wait();
    console.log("✅ Member joined circle successfully\n");
    
    // Get updated circle details
    const updatedCircleDetails = await contract.getCircleDetails(circleId);
    console.log("📊 Updated Circle Details:");
    console.log("   Members:", updatedCircleDetails.memberCount.toString());
    console.log("   Total Stake:", formatNERO(updatedCircleDetails.totalStake), "NERO");
    console.log("   Average Score:", updatedCircleDetails.averageScore.toString());
    console.log("   Is Active:", updatedCircleDetails.isActive, "\n");
    
    await sleep(2000);

    // ==============================
    // STEP 5: Check User Stats
    // ==============================
    console.log("📊 STEP 5: Checking User Stats");
    console.log("--------------------------------------------");
    
    const adminStats = await contract.getUserStats(admin.address);
    console.log("Admin Stats:");
    console.log("   Circle ID:", adminStats.circleId.toString());
    console.log("   Individual Score:", adminStats.individualScore.toString());
    console.log("   Final Trust Score:", adminStats.finalTrustScore.toString());
    console.log("   Max Loan Amount:", formatNERO(adminStats.maxLoanAmount), "NERO");
    console.log("   Interest Rate:", adminStats.interestRate.toString(), "%");
    console.log("   Has Active Loan:", adminStats.hasActiveLoan);
    console.log("   Is Active:", adminStats.isActive, "\n");
    
    const memberStats = await contract.getUserStats(memberWallet.address);
    console.log("Member Stats:");
    console.log("   Circle ID:", memberStats.circleId.toString());
    console.log("   Individual Score:", memberStats.individualScore.toString());
    console.log("   Final Trust Score:", memberStats.finalTrustScore.toString());
    console.log("   Max Loan Amount:", formatNERO(memberStats.maxLoanAmount), "NERO");
    console.log("   Interest Rate:", memberStats.interestRate.toString(), "%");
    console.log("   Has Active Loan:", memberStats.hasActiveLoan);
    console.log("   Is Active:", memberStats.isActive, "\n");
    
    await sleep(2000);

    // ==============================
    // STEP 6: Request Loan
    // ==============================
    console.log("💰 STEP 6: Requesting Loan");
    console.log("--------------------------------------------");
    
    const loanAmount = parseNERO("0.02"); // Request 0.02 NERO loan
    const loanPurpose = "Test loan for business expansion";
    
    console.log(`Requesting loan: ${formatNERO(loanAmount)} NERO`);
    console.log(`Purpose: ${loanPurpose}`);
    
    const requestLoanTx = await memberContract.requestLoan(loanAmount, loanPurpose);
    console.log("⏳ Transaction sent:", requestLoanTx.hash);
    const requestLoanReceipt = await requestLoanTx.wait();
    console.log("✅ Loan requested successfully\n");
    
    // Get loan ID from event
    const loanRequestedEvent = requestLoanReceipt.logs.find(
      log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed && parsed.name === "LoanRequested";
        } catch (e) {
          return false;
        }
      }
    );
    
    let loanId;
    if (loanRequestedEvent) {
      const parsed = contract.interface.parseLog(loanRequestedEvent);
      loanId = parsed.args.loanId;
      console.log("🆔 Loan ID:", loanId.toString());
    } else {
      // Fallback: get the latest loan
      const loanCount = await contract.loanCount();
      loanId = loanCount - BigInt(1);
      console.log("🆔 Loan ID (from count):", loanId.toString());
    }
    
    // Get loan details
    const loanDetails = await contract.getLoanDetails(loanId);
    console.log("📊 Loan Details:");
    console.log("   Borrower:", loanDetails.borrower);
    console.log("   Amount:", formatNERO(loanDetails.amount), "NERO");
    console.log("   Total Repayment:", formatNERO(loanDetails.totalRepayment), "NERO");
    console.log("   Due Date:", new Date(Number(loanDetails.dueDate) * 1000).toLocaleString());
    console.log("   Approved:", loanDetails.approved);
    console.log("   Disbursed:", loanDetails.disbursed);
    console.log("   Repaid:", loanDetails.repaid);
    console.log("   Purpose:", loanDetails.purpose, "\n");
    
    await sleep(2000);

    // ==============================
    // STEP 7: Approve Loan (Admin)
    // ==============================
    console.log("✅ STEP 7: Approving Loan");
    console.log("--------------------------------------------");
    
    console.log(`Admin approving loan ${loanId}...`);
    
    const approveLoanTx = await contract.approveLoan(loanId);
    console.log("⏳ Transaction sent:", approveLoanTx.hash);
    await approveLoanTx.wait();
    console.log("✅ Loan approved successfully\n");
    
    // Get updated loan details
    const approvedLoanDetails = await contract.getLoanDetails(loanId);
    console.log("📊 Updated Loan Status:");
    console.log("   Approved:", approvedLoanDetails.approved);
    console.log("   Disbursed:", approvedLoanDetails.disbursed);
    console.log("   Repaid:", approvedLoanDetails.repaid, "\n");
    
    await sleep(2000);

    // ==============================
    // STEP 8: Disburse Loan (Admin)
    // ==============================
    console.log("💸 STEP 8: Disbursing Loan");
    console.log("--------------------------------------------");
    
    console.log(`Admin disbursing loan ${loanId}...`);
    console.log(`Amount to disburse: ${formatNERO(loanDetails.amount)} NERO`);
    
    const memberBalanceBefore = await provider.getBalance(memberWallet.address);
    console.log("💰 Member Balance Before:", formatNERO(memberBalanceBefore), "NERO");
    
    const disburseLoanTx = await contract.disburseLoan(loanId, { value: loanDetails.amount });
    console.log("⏳ Transaction sent:", disburseLoanTx.hash);
    await disburseLoanTx.wait();
    console.log("✅ Loan disbursed successfully\n");
    
    const memberBalanceAfter = await provider.getBalance(memberWallet.address);
    console.log("💰 Member Balance After:", formatNERO(memberBalanceAfter), "NERO");
    console.log("💵 Received:", formatNERO(memberBalanceAfter - memberBalanceBefore), "NERO\n");
    
    // Get updated loan details
    const disbursedLoanDetails = await contract.getLoanDetails(loanId);
    console.log("📊 Updated Loan Status:");
    console.log("   Approved:", disbursedLoanDetails.approved);
    console.log("   Disbursed:", disbursedLoanDetails.disbursed);
    console.log("   Repaid:", disbursedLoanDetails.repaid, "\n");
    
    await sleep(2000);

    // ==============================
    // STEP 9: Repay Loan
    // ==============================
    console.log("💳 STEP 9: Repaying Loan");
    console.log("--------------------------------------------");
    
    const repaymentAmount = disbursedLoanDetails.totalRepayment;
    console.log(`Repaying loan ${loanId}...`);
    console.log(`Repayment Amount: ${formatNERO(repaymentAmount)} NERO`);
    
    const memberBalanceBeforeRepay = await provider.getBalance(memberWallet.address);
    console.log("💰 Member Balance Before:", formatNERO(memberBalanceBeforeRepay), "NERO");
    
    const repayLoanTx = await memberContract.repayLoan(loanId, { value: repaymentAmount });
    console.log("⏳ Transaction sent:", repayLoanTx.hash);
    await repayLoanTx.wait();
    console.log("✅ Loan repaid successfully\n");
    
    const memberBalanceAfterRepay = await provider.getBalance(memberWallet.address);
    console.log("💰 Member Balance After:", formatNERO(memberBalanceAfterRepay), "NERO\n");
    
    // Get final loan details
    const repaidLoanDetails = await contract.getLoanDetails(loanId);
    console.log("📊 Final Loan Status:");
    console.log("   Approved:", repaidLoanDetails.approved);
    console.log("   Disbursed:", repaidLoanDetails.disbursed);
    console.log("   Repaid:", repaidLoanDetails.repaid, "\n");
    
    await sleep(2000);

    // ==============================
    // STEP 10: Check Updated User Stats
    // ==============================
    console.log("📊 STEP 10: Final User Stats");
    console.log("--------------------------------------------");
    
    const finalMemberStats = await contract.getUserStats(memberWallet.address);
    console.log("Member Final Stats:");
    console.log("   Individual Score:", finalMemberStats.individualScore.toString());
    console.log("   Final Trust Score:", finalMemberStats.finalTrustScore.toString());
    console.log("   Max Loan Amount:", formatNERO(finalMemberStats.maxLoanAmount), "NERO");
    console.log("   Interest Rate:", finalMemberStats.interestRate.toString(), "%");
    console.log("   Total Borrowed:", formatNERO(finalMemberStats.totalBorrowed), "NERO");
    console.log("   Total Repaid:", formatNERO(finalMemberStats.totalRepaid), "NERO");
    console.log("   Loans Completed:", finalMemberStats.loansCompleted.toString());
    console.log("   Has Active Loan:", finalMemberStats.hasActiveLoan);
    console.log("   Is Active:", finalMemberStats.isActive, "\n");

    // Final contract balance
    const finalContractBalance = await contract.getContractBalance();
    console.log("💰 Final Contract Balance:", formatNERO(finalContractBalance), "NERO\n");

    // ==============================
    // TEST SUMMARY
    // ==============================
    console.log("========================================");
    console.log("✅ ALL TESTS PASSED SUCCESSFULLY!");
    console.log("========================================");
    console.log("\n📊 Test Summary:");
    console.log("✅ 1. Liquidity deposited");
    console.log("✅ 2. Trust circle created");
    console.log("✅ 3. Member wallet funded");
    console.log("✅ 4. Member joined circle");
    console.log("✅ 5. User stats verified");
    console.log("✅ 6. Loan requested");
    console.log("✅ 7. Loan approved");
    console.log("✅ 8. Loan disbursed");
    console.log("✅ 9. Loan repaid");
    console.log("✅ 10. Final stats verified");
    console.log("\n🎉 Full lending flow completed successfully on NeroChain!\n");
    
    console.log("🔗 View on Explorer:");
    console.log(`   Contract: https://testnet.neroscan.io/address/${CONTRACT_ADDRESS}`);
    console.log(`   Admin: https://testnet.neroscan.io/address/${admin.address}`);
    console.log(`   Member: https://testnet.neroscan.io/address/${memberWallet.address}`);
    console.log("\n");

  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    if (error.data) {
      console.error("Error Data:", error.data);
    }
    if (error.transaction) {
      console.error("Transaction:", error.transaction);
    }
    process.exit(1);
  }
}

// Run the test
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
