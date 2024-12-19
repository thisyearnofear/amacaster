# Amacaster

One-stop Farcaster AMA platform with gamified Q&A matching and Web3 integration.

## Current Testing Phase

The application is currently in testing phase on Optimism Sepolia testnet. The smart contracts are deployed at:

- AMA Matcher: `0xa226c82f1b6983aBb7287Cd4d83C2aEC802A183F`
- User Profile: `0xbcb41ff65549D5d067C603768f1B94C9cd0D6031`

### Testing Requirements

1. **Network**: Optimism Sepolia Testnet
2. **Test ETH**: Required for submitting matches and creating profiles
   - Get test ETH from the [Optimism Sepolia PoW Faucet](https://www.ethereum-ecosystem.com/faucets/optimism-sepolia)
   - This faucet requires mining work to prevent spam and ensure fair distribution
3. **Wallet**: Any Web3 wallet (MetaMask, Rainbow, etc.)
4. **Farcaster Account**: Required for profile creation and AMA participation

### Current Features in Testing

- [x] Q&A Matching Interface
- [x] On-chain Match Submission
- [x] Answer Stacking (up to 3 answers)
- [x] Mobile-responsive Design
- [x] Farcaster Authentication
- [x] Web3 Wallet Integration
- [x] On-chain User Profiles
- [x] Achievement System
- [x] Profile Pages with Web3.bio Integration

## Features

### Authentication

- **Farcaster Login (via Neynar)**
  - Create and submit questions to AMAs
  - Submit responses as the AMA host
  - Participate in Q&A matching game
  - Vote on question rankings
  - Create on-chain profile
- **Web3 Wallet Login**
  - Submit contributions on-chain
  - Mint Proof of Participation (POAP) for answered questions
  - Earn share allocation for final AMA NFT mint
  - Access exclusive Web3 features

### Profile System

- **On-chain Profiles**
  - Link Farcaster ID with wallet address
  - Track match submissions and scores
  - Unlock achievements
  - View participation history
- **Web3.bio Integration**
  - Display social links
  - Show Farcaster stats
  - Cross-platform profile data

## Environment Variables

```bash
# WalletConnect Project ID (required for Web3 wallet integration)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# Neynar API Keys (required for Farcaster integration)
NEXT_PUBLIC_NEYNAR_API_KEY=your_neynar_api_key
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_neynar_client_id_here

# Supabase Configuration (for backend storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Contract Addresses
NEXT_PUBLIC_PROFILE_CONTRACT_ADDRESS=your_profile_contract_address
```

## Testing the Profile System

1. **Create Profile**

   - Connect your Web3 wallet
   - Sign in with Farcaster
   - Click "Create Profile" to link your FID with your wallet

2. **View Profile**

   - Navigate to `/profile` to see your own profile
   - Visit `/profile/[fid]` to view other users' profiles

3. **Achievements**
   - Submit matches to earn achievements
   - Track your progress in the profile page
   - Unlock special badges for participation

## Development

```bash
# Install dependencies
yarn install

# Run the development server
yarn dev

# Deploy contracts (from contracts directory)
cd contracts
yarn install
npx hardhat compile
npx hardhat run scripts/deploy-profile.ts --network optimism-sepolia
```

## Deployment

When deploying to Netlify, ensure:

1. Add all required environment variables
2. Use these build settings:
   - Build command: `yarn build`
   - Publish directory: `.next`
   - Node version: 18+

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
