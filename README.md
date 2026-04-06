<img width="1470" height="832" alt="Screenshot 2026-04-07 at 1 57 39 AM" src="https://github.com/user-attachments/assets/253557fb-328a-4185-8a6c-ca09b44b6631" />

# Zentra - Decentralized Lending Platform on NERO Chain

A trust-based decentralized lending platform built on NERO Chain, enabling peer-to-peer lending through trust circles and on-chain credit scoring.

## Overview

Zentra revolutionizes lending by replacing traditional credit scores with blockchain-based trust circles. Users form groups, stake collateral together, and build collective trust that unlocks better borrowing terms.

**Key Features:**
- No banks, no paperwork - fully decentralized
- Trust-based lending with on-chain credit scoring
- Form trust circles with friends/community
- Instant loan disbursement
- Transparent interest rates based on trust score

## Deployed Contract

| Property | Value |
|----------|-------|
| **Contract Address** | `0xbfA80344cD3f706C80EF9924560E87E422507867` |
| **Network** | NERO Chain Testnet |
| **Admin Address** | `0x74E36d4A7b33057e3928CE4bf4C8C53A93361C34` |
| **Explorer** | [View on NeroScan](https://testnet.neroscan.io/address/0xbfA80344cD3f706C80EF9924560E87E422507867) |

## NERO Chain Network Details

| Property | Testnet | Mainnet |
|----------|---------|---------|
| **Chain ID** | 689 | 1689 |
| **RPC URL** | https://rpc-testnet.nerochain.io | https://rpc.nerochain.io |
| **Explorer** | https://testnet.neroscan.io | https://neroscan.io |
| **Currency** | NERO | NERO |
| **Faucet** | https://app.testnet.nerochain.io/faucet | - |

## Project Architecture

```
Zentra/
├── package.json              # Root package with workspaces
├── README.md                 # This file
├── .gitignore               
│
├── frontend/                 # Next.js 14 Application
│   ├── package.json          
│   ├── .env.local            # Environment variables
│   ├── next.config.js        
│   ├── tailwind.config.ts    
│   ├── tsconfig.json         
│   │
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout with providers
│   │   ├── page.tsx          # Landing page
│   │   ├── providers.tsx     # Wagmi + React Query providers
│   │   ├── globals.css       # Global styles
│   │   ├── user/
│   │   │   └── page.tsx      # User dashboard
│   │   └── admin/
│   │       └── page.tsx      # Admin dashboard
│   │
│   ├── components/           
│   │   ├── Navbar.tsx        # Navigation with wallet connect
│   │   ├── ConnectButton.tsx # Wallet connection button
│   │   └── CustomCursor.tsx  # Custom cursor effect
│   │
│   ├── config/               
│   │   ├── chains.ts         # NERO Chain definitions
│   │   └── wagmiConfig.ts    # Wagmi v2 configuration
│   │
│   ├── hooks/                
│   │   └── useContract.ts    # Contract interaction hooks
│   │
│   ├── lib/                  
│   │   ├── contract.ts       # Contract address export
│   │   ├── TrustCircles.json # Full contract ABI
│   │   └── TrustCirclesABI.json
│   │
│   └── public/
│       └── images/           # Static assets
│
└── contracts/                # Smart Contract Package
    ├── package.json          
    ├── .env                  # Private keys (gitignored)
    ├── .env.example          # Environment template
    ├── hardhat.config.js     # Hardhat config for NERO Chain
    │
    ├── TrustCircles.sol      # Main lending contract
    ├── deploy.js             # Deployment script
    ├── test-connection.js    # Connectivity test
    ├── test-full-flow.js     # Full lending flow test
    │
    └── artifacts/            # Compiled contracts
        └── contracts/
            └── TrustCircles.sol/
                └── TrustCircles.json

```

## Smart Contract: TrustCircles.sol

### Contract Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `MIN_STAKE` | 0.5 NERO | Minimum stake to join a circle |
| `STARTING_SCORE` | 50 | Initial trust score for new users |
| `MAX_SCORE` | 100 | Maximum achievable trust score |
| `LOAN_DURATION` | 7 days | Standard loan repayment period |
| `MIN_CIRCLE_MEMBERS` | 3 | Minimum members to activate a circle |

### Trust Score Calculation

```
Final Trust Score = (Individual Score * 0.6) + (Circle Average * 0.4)
```

- **Individual Score (60%):** Based on loan repayment history
  - +10 points for on-time repayment
  - -15 points for defaults
  
- **Circle Score (40%):** Average score of all circle members

### Interest Rates

| Trust Score | Interest Rate |
|-------------|---------------|
| 90-100 | 4% |
| 80-89 | 5% |
| 70-79 | 6% |
| 60-69 | 7% |
| 50-59 | 8% |
| 40-49 | 9% |
| < 40 | 10% |

### Max Loan Amount

```
Max Loan = (Trust Score / 100) * 20 NERO
```

Example: Score 75 = 15 NERO max loan

### Key Functions

#### For Users
- `createCircle(name)` - Create a new trust circle
- `joinCircle(circleId)` - Join existing circle (requires MIN_STAKE)
- `requestLoan(amount, purpose)` - Request a loan
- `repayLoan(loanId)` - Repay an active loan
- `getUserStats(address)` - Get user's trust score and stats

#### For Admin
- `approveLoan(loanId)` - Approve a pending loan
- `disburseLoan(loanId)` - Disburse approved loan
- `addLiquidity()` - Add NERO to lending pool
- `withdrawLiquidity(amount)` - Withdraw from pool
- `toggleDemoMode()` - Enable/disable demo mode

## Quick Start

### Prerequisites

- Node.js >= 18
- npm or yarn
- MetaMask wallet with NERO Chain configured

### Installation

```bash
# Clone and navigate to project
cd Zentra

# Install all dependencies (from root)
npm install
cd frontend && npm install
cd ../contracts && npm install
```

### Environment Setup

**Frontend (.env.local):**
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xbfA80344cD3f706C80EF9924560E87E422507867
NEXT_PUBLIC_CHAIN_ID=689
NEXT_PUBLIC_RPC_URL=https://rpc-testnet.nerochain.io
```

**Contracts (.env):**
```env
PRIVATE_KEY=your_private_key_here
DEPLOYER_ADDRESS=your_address_here
CONTRACT_ADDRESS=0xbfA80344cD3f706C80EF9924560E87E422507867
NERO_TESTNET_RPC=https://rpc-testnet.nerochain.io
```

### Development

```bash
# Start frontend (from frontend/ folder)
npm run dev

# Open http://localhost:3000
```

### Contract Testing

```bash
# From contracts/ folder

# Test connectivity to deployed contract
npm run test:connection

# Run full lending flow test (requires NERO tokens)
npm run test:flow
```

### Deploy New Contract

```bash
# From contracts/ folder
npm run deploy
```

## Frontend Pages

### Home Page (`/`)
- Platform overview and value proposition
- How it works guide
- Connect wallet CTA

### User Dashboard (`/user`)
- View trust score and stats
- Create/join trust circles
- Request loans
- View active loans
- Repay loans
- Circle member management

### Admin Dashboard (`/admin`)
- View all pending loans
- Approve/reject loan requests
- Disburse approved loans
- Manage liquidity pool
- View platform statistics
- Toggle demo mode

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| React | 18.x | UI library |
| Wagmi | 2.x | Ethereum React hooks |
| Viem | 2.x | Ethereum utilities |
| TailwindCSS | 3.x | Styling |
| TypeScript | 5.x | Type safety |

### Smart Contracts
| Technology | Version | Purpose |
|------------|---------|---------|
| Solidity | 0.8.20 | Smart contract language |
| Hardhat | 2.x | Development framework |
| Ethers.js | 6.x | Ethereum library |
| OpenZeppelin | 5.x | Security patterns |

## MetaMask Setup

1. Open MetaMask
2. Click network dropdown → Add Network → Add network manually
3. Enter details:

| Field | Value |
|-------|-------|
| Network Name | NERO Chain Testnet |
| RPC URL | https://rpc-testnet.nerochain.io |
| Chain ID | 689 |
| Currency Symbol | NERO |
| Block Explorer | https://testnet.neroscan.io |

4. Save and switch to NERO Chain Testnet

## Get Test Tokens

Visit the NERO Chain Faucet: **https://app.testnet.nerochain.io/faucet**

## User Flow

```
1. Connect Wallet
   └── User connects MetaMask
   └── Auto-detects NERO Chain
   └── Creates on-chain identity

2. Join/Create Circle
   └── Create new circle (become admin)
   └── Or join existing circle
   └── Stake minimum 0.5 NERO
   └── Circle activates at 3 members

3. Request Loan
   └── Enter amount (up to max based on score)
   └── Provide loan purpose
   └── Submit on-chain request

4. Admin Approval
   └── Admin reviews request
   └── Approves loan
   └── Disburses funds

5. Repay & Earn
   └── Repay within 7 days
   └── Earn +10 trust points
   └── Unlock better terms
```

## API Reference

### Contract Read Functions

```typescript
// Get user statistics
const stats = await contract.getUserStats(address);
// Returns: [circleId, individualScore, finalScore, maxLoan, interestRate, ...]

// Get circle details
const circle = await contract.getCircleDetails(circleId);
// Returns: [name, admin, memberCount, avgScore, totalStake, isActive]

// Get loan details
const loan = await contract.getLoanDetails(loanId);
// Returns: [borrower, amount, repayment, deadline, approved, disbursed, repaid, purpose]
```

### Contract Write Functions

```typescript
// Create circle
await contract.createCircle("My Circle");

// Join circle with stake
await contract.joinCircle(circleId, { value: parseEther("0.5") });

// Request loan
await contract.requestLoan(parseEther("5"), "Business expansion");

// Repay loan
await contract.repayLoan(loanId, { value: repaymentAmount });
```

## Security Considerations

- Contract uses OpenZeppelin's ReentrancyGuard
- Admin-only functions protected by modifier
- Minimum stake requirement prevents spam
- Circle activation requires minimum members
- Loan amounts capped by trust score

## Troubleshooting

### Wallet Won't Connect
- Ensure MetaMask is installed
- Check you're on NERO Chain Testnet (Chain ID: 689)
- Try refreshing the page

### Transaction Fails
- Check you have enough NERO for gas
- Ensure you meet minimum requirements (stake, loan amount)
- Check contract has sufficient liquidity

### Page Shows "Loading..."
- Wait for hydration to complete
- Check browser console for errors
- Ensure RPC endpoint is accessible

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Links

- **NERO Chain:** https://nerochain.io
- **Testnet Explorer:** https://testnet.neroscan.io
- **Faucet:** https://app.testnet.nerochain.io/faucet
- **Contract:** https://testnet.neroscan.io/address/0xbfA80344cD3f706C80EF9924560E87E422507867
