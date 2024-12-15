# Amacaster

One-stop FC AMA shop

## Environment Variables

The following environment variables are required for deployment:

```bash
# WalletConnect Project ID (required for production)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# Neynar API Key (required for Farcaster integration)
NEXT_PUBLIC_NEYNAR_API_KEY=your_neynar_api_key_here

# Neynar Client ID (required for Sign in with Neynar)
NEXT_PUBLIC_NEYNAR_CLIENT_ID=your_neynar_client_id_here
```

### Getting the Required Keys

1. **WalletConnect Project ID**:

   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - Create an account and create a new project
   - Copy the Project ID

2. **Neynar API Key & Client ID**:
   - Visit [Neynar Developer Dashboard](https://neynar.com/)
   - Create an account and create a new project
   - Copy both the API Key and Client ID

## Development

```bash
# Install dependencies
yarn install

# Run the development server
yarn dev
```

## Deployment

When deploying to Netlify, make sure to:

1. Add all required environment variables in your Netlify project settings
2. Use the following build settings:
   - Build command: `yarn build`
   - Publish directory: `.next`
   - Node version: 18 or higher
