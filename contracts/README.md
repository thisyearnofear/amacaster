# Amacaster Smart Contracts

This directory contains the smart contracts for the Amacaster platform, deployed on Optimism Sepolia testnet.

## Contracts

### AMAMatcher (`0xa226c82f1b6983aBb7287Cd4d83C2aEC802A183F`)

- Handles Q&A match submissions
- Stores match data and rankings
- Manages submission state

### UserProfile (`0xbcb41ff65549D5d067C603768f1B94C9cd0D6031`)

- Links Farcaster IDs with wallet addresses
- Tracks user participation and scores
- Manages achievements system

## Development

```shell
# Install dependencies
yarn install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy contracts
npx hardhat run scripts/deploy-profile.ts --network optimism-sepolia

# Verify contracts
npx hardhat verify --network optimism-sepolia $CONTRACT_ADDRESS
```

## Environment Setup

Required environment variables in `.env`:

```env
# Network Configuration
OP_SEPOLIA_RPC=your_rpc_url
PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_key

# Optional
COINMARKETCAP_API_KEY=for_gas_reporting
REPORT_GAS=true
```

## Contract Verification

All contracts are verified on [Optimism Sepolia Etherscan](https://sepolia-optimism.etherscan.io/):

- [AMAMatcher Contract](https://sepolia-optimism.etherscan.io/address/0xa226c82f1b6983aBb7287Cd4d83C2aEC802A183F#code)
- [UserProfile Contract](https://sepolia-optimism.etherscan.io/address/0xbcb41ff65549D5d067C603768f1B94C9cd0D6031#code)

## Testing

The contracts include comprehensive tests for all functionality. Run tests with:

```shell
npx hardhat test
```

For gas reporting:

```shell
REPORT_GAS=true npx hardhat test
```
