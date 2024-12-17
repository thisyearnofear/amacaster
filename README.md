# Amacaster

One-stop Farcaster AMA platform with gamified Q&A matching and Web3 integration.

## Current Testing Phase

The application is currently in testing phase on Optimism Sepolia testnet. The smart contract for Q&A matching is deployed at:
`0xa226c82f1b6983aBb7287Cd4d83C2aEC802A183F`

### Testing Requirements

1. **Network**: Optimism Sepolia Testnet
2. **Test ETH**: Required for submitting matches
   - Get test ETH from the [Optimism Sepolia PoW Faucet](https://www.ethereum-ecosystem.com/faucets/optimism-sepolia)
   - This faucet requires mining work to prevent spam and ensure fair distribution
3. **Wallet**: Any Web3 wallet (MetaMask, Rainbow, etc.)

### Current Features in Testing

- [x] Q&A Matching Interface
- [x] On-chain Match Submission
- [x] Answer Stacking (up to 3 answers)
- [x] Mobile-responsive Design
- [x] Farcaster Authentication
- [x] Web3 Wallet Integration

## Features

### Authentication

- **Farcaster Login (via Neynar)**
  - Create and submit questions to AMAs
  - Submit responses as the AMA host
  - Participate in Q&A matching game
  - Vote on question rankings
- **Web3 Wallet Login**
  - Submit contributions on-chain
  - Mint Proof of Participation (POAP) for answered questions
  - Earn share allocation for final AMA NFT mint
  - Access exclusive Web3 features

## Environment Variables

```bash
# WalletConnect Project ID (required for Web3 wallet integration)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# Neynar API Keys (required for Farcaster integration)
NEXT_PUBLIC_NEYNAR_API_KEY=your_neynar_api_key_here
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_neynar_client_id_here

# Supabase Configuration (for backend storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# POAP API Key (for minting proof of participation)
NEXT_PUBLIC_POAP_API_KEY=your_poap_api_key

# Optional: Analytics
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_amplitude_key

# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0xa226c82f1b6983aBb7287Cd4d83C2aEC802A183F
```

### Infrastructure Recommendations

#### Backend & Storage

- **Supabase** (Free Tier)
  - User profiles and authentication
  - AMA session storage
  - Q&A pairs and matching data
  - Leaderboards and rankings
- **IPFS via Web3.Storage** (Free Tier)
  - Store AMA content and metadata
  - NFT metadata storage
- **Railway** (Free Tier)
  - Optional: Deploy backend services
  - Scheduled jobs and processing

#### Analytics & Monitoring

- **Amplitude** (Free Tier)
  - User engagement tracking
  - Feature usage analytics
- **Sentry** (Free Tier)
  - Error tracking
  - Performance monitoring

## Development Roadmap

### Phase 1: Core Matching Game (✓ Completed)

- ✓ Basic Q&A pairing interface
- ✓ Drag and drop functionality
- ✓ Answer stacking for multiple responses
- ✓ Mobile-responsive design
- ✓ Smart contract deployment
- ✓ On-chain submission

### Phase 2: Consensus & Scoring (Current)

1. **Match Validation**

   - [ ] Compare user matches with correct pairings
   - [ ] Visual feedback for correct/incorrect matches
   - [ ] Score calculation based on accuracy

2. **Leaderboard System**
   - [ ] User rankings
   - [ ] Score history
   - [ ] Achievement badges

### Phase 3: Crowdsourced Consensus

1. **Matching Consensus System**

   - Store user match submissions
   - Weight-based consensus algorithm
   - Confidence scoring based on:
     - Number of matching submissions
     - User reputation/history
     - Time decay factor

2. **Analytics Dashboard**
   - Match agreement percentages
   - Confidence levels per pairing
   - User participation metrics

### Phase 4: Ranking & Engagement

1. **Question Ranking System**

   - Individual user rankings
   - Global leaderboard
   - Weighted voting system
   - Categories/tags for organization

2. **Community Contribution Layer**
   - Resource submission interface
   - Upvote/downvote system
   - Resource categorization
   - Quality control mechanisms

### Phase 5: Web3 Integration

1. **Basic Web3 Features**

   - Connect wallet functionality
   - Draft saving on-chain
   - Simple contribution tracking
   - Basic proof of participation (POAP)

2. **Smart Contract Development**
   - Answer submission contract
   - Contribution tracking
   - Basic reputation system

### Phase 6: Gamification & Rewards

1. **Point System**

   - Matching participation points
   - Ranking contribution points
   - Resource submission points
   - Quality of contribution multipliers

2. **Achievement System**
   - Badges for different activities
   - Milestone rewards
   - Special recognition for key contributors

### Phase 7: NFT & Ownership

1. **NFT Infrastructure**

   - Smart contract for NFT minting
   - Ownership distribution logic
   - Revenue sharing mechanism

2. **Contribution Tracking**
   - Detailed contribution history
   - Ownership share calculation
   - Automated distribution system

## Initial MVP Implementation

### Off-chain Components (Supabase)

- User profiles and authentication
- Match submissions storage
- Basic agreement percentage tracking
- Preliminary confidence scoring
- Leaderboard data

### On-chain Components (Optimism)

- Basic proof of participation
- User participation records
- Final match storage
- Simple contribution tracking

## Development

```bash
# Install dependencies
yarn install

# Run the development server
yarn dev
```

## Deployment

When deploying to Netlify, ensure:

1. Add all required environment variables
2. Use these build settings:
   - Build command: `yarn build`
   - Publish directory: `.next`
   - Node version: 18+

## Key Considerations

### Scalability

- Design for growing user base
- Efficient consensus mechanisms
- Optimized on-chain operations

### User Experience

- Smooth Web2/Web3 transition
- Clear reward mechanisms
- Intuitive interface

### Security

- Sybil resistance
- Spam prevention
- Smart contract safety

### Economics

- Sustainable reward structure
- Fair contribution valuation
- Balanced incentives

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
