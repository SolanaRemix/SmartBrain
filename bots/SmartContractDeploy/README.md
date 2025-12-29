# @SmartContractDeploy Bot

## Overview

The SmartContractDeploy bot is a premium automation tool that streamlines smart contract deployment across multiple blockchain platforms. With built-in security checks, best practices, and automated configuration management, deploying contracts has never been easier.

**Price:** $9/month subscription (managed via Stripe)

## Features

- 🚀 **Multi-Chain Support:** Deploy to Ethereum, Polygon, Binance Smart Chain, Solana, and more
- 🔒 **Security First:** Automatic security checks before deployment
- ⚡ **Gas Optimization:** Intelligent gas price estimation and optimization
- 📊 **Deployment Analytics:** Track all your deployments with detailed logs
- 🔄 **Version Control:** Manage multiple contract versions
- ✅ **Verification:** Automatic contract verification on block explorers
- 🎯 **Testing Integration:** Run tests before deployment
- 📝 **Documentation Generation:** Auto-generate deployment documentation

## Getting Started

### Prerequisites

- Active $9/month subscription (see Subscription section below)
- Node.js v16 or higher
- Supported blockchain wallet with deployment permissions
- Smart contract source code

### Subscription

#### How to Subscribe

1. **Visit Stripe Checkout:**
   - Navigate to: `http://your-domain.com/subscribe/deploy`
   - Or use the direct Stripe payment link (provided after setup)

2. **Complete Payment:**
   - Enter your payment information
   - Subscription: $9/month (billed monthly)
   - Cancel anytime

3. **Receive Credentials:**
   - API key sent to your email immediately
   - Customer portal link for subscription management

4. **Start Deploying:**
   - Use the API key in all deployment requests
   - The bot verifies your subscription status on each request

#### Managing Your Subscription

Access your [Stripe Customer Portal](https://billing.stripe.com/p/login/test_xxx) to:
- View subscription status
- Update payment method
- View invoice history
- Cancel subscription

### Installation

The bot is pre-installed with the main SmartBrain repository:

```bash
cd SmartBrain
npm install
npm run deploy-bot
```

## Usage

### Command Line Interface

```bash
# Deploy a contract
node bots/SmartContractDeploy/index.js deploy \
  --contract ./contracts/MyContract.sol \
  --network ethereum-mainnet \
  --apikey YOUR_API_KEY

# Verify deployment status
node bots/SmartContractDeploy/index.js status \
  --deployment-id dep_123456 \
  --apikey YOUR_API_KEY

# List all deployments
node bots/SmartContractDeploy/index.js list \
  --apikey YOUR_API_KEY
```

### REST API

#### Deploy Contract

**Endpoint:** `POST /api/deploy/contract`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_API_KEY",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "userId": "user_123",
  "contract": {
    "name": "MyToken",
    "source": "pragma solidity ^0.8.0; contract MyToken { ... }",
    "compiler": "0.8.19",
    "optimization": true
  },
  "network": "ethereum-mainnet",
  "constructorArgs": ["TokenName", "TKN", 1000000],
  "verification": true
}
```

**Response:**
```json
{
  "success": true,
  "deploymentId": "dep_abc123",
  "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "transactionHash": "0x123...",
  "network": "ethereum-mainnet",
  "gasUsed": "2145832",
  "estimatedCost": "0.045 ETH",
  "verificationUrl": "https://etherscan.io/address/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb#code",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Check Deployment Status

**Endpoint:** `GET /api/deploy/status/:deploymentId`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_API_KEY"
}
```

**Response:**
```json
{
  "success": true,
  "deploymentId": "dep_abc123",
  "status": "completed",
  "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "verification": "verified",
  "details": {
    "network": "ethereum-mainnet",
    "blockNumber": 18921045,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### GitHub Integration

Comment on a pull request or issue to trigger deployments:

```
@SmartContractDeploy deploy to ethereum-testnet
```

The bot will:
1. Verify your subscription status
2. Extract contract from the PR
3. Deploy to the specified network
4. Comment back with deployment details

### JavaScript/Node.js SDK

```javascript
const SmartContractDeploy = require('./bots/SmartContractDeploy');

const deployer = new SmartContractDeploy({
  apiKey: 'YOUR_API_KEY'
});

// Deploy contract
const deployment = await deployer.deploy({
  contract: contractSource,
  network: 'ethereum-mainnet',
  constructorArgs: ['TokenName', 'TKN', 1000000]
});

console.log(`Contract deployed at: ${deployment.contractAddress}`);

// Check status
const status = await deployer.getStatus(deployment.deploymentId);
console.log(`Deployment status: ${status.status}`);
```

## Supported Networks

### EVM-Compatible Chains
- Ethereum (Mainnet, Sepolia, Goerli)
- Polygon (Mainnet, Mumbai)
- Binance Smart Chain (Mainnet, Testnet)
- Avalanche (C-Chain, Fuji)
- Arbitrum (One, Goerli)
- Optimism (Mainnet, Goerli)

### Non-EVM Chains
- Solana (Mainnet Beta, Devnet, Testnet)
- Near (Mainnet, Testnet)

## Configuration Options

### Network Configuration

```json
{
  "network": "ethereum-mainnet",
  "rpcUrl": "https://mainnet.infura.io/v3/YOUR_KEY",
  "gasPrice": "auto",
  "gasLimit": 5000000,
  "confirmations": 2
}
```

### Deployment Options

```json
{
  "verification": true,
  "waitForConfirmation": true,
  "runTests": true,
  "generateDocs": true,
  "notifyOnCompletion": true,
  "notificationEmail": "user@example.com"
}
```

## Payment Verification

Every deployment request includes automatic subscription verification:

1. **API Key Validation:** Bot validates the API key
2. **Subscription Check:** Queries Stripe API for active subscription
3. **Status Verification:** Ensures subscription is not cancelled or past due
4. **Action Authorization:** Only processes requests with valid, active subscriptions

If subscription is invalid:
```json
{
  "success": false,
  "error": "SUBSCRIPTION_REQUIRED",
  "message": "Active subscription required. Please subscribe at: http://your-domain.com/subscribe/deploy",
  "subscriptionUrl": "http://your-domain.com/subscribe/deploy"
}
```

## Security Features

- **Encrypted API Keys:** All API keys are encrypted at rest
- **Rate Limiting:** 100 deployments per month per subscription
- **IP Whitelisting:** Optional IP restriction for added security
- **Audit Logs:** Complete audit trail of all deployments
- **Secure Wallet Management:** Private keys never stored or transmitted
- **Contract Scanning:** Pre-deployment security scan included

## Examples

### Example 1: Deploy ERC-20 Token

```javascript
const deployment = await deployer.deploy({
  contract: `
    pragma solidity ^0.8.0;
    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    
    contract MyToken is ERC20 {
      constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
        _mint(msg.sender, initialSupply);
      }
    }
  `,
  network: 'ethereum-sepolia',
  constructorArgs: [1000000],
  verification: true
});
```

### Example 2: Deploy NFT Contract

```javascript
const deployment = await deployer.deploy({
  contract: require('./contracts/MyNFT.sol'),
  network: 'polygon-mainnet',
  constructorArgs: ['MyNFT', 'MNFT', 'https://api.mynft.com/metadata/'],
  verification: true,
  options: {
    gasPrice: 'fast',
    notifyOnCompletion: true
  }
});
```

### Example 3: Batch Deployment

```javascript
const contracts = [
  { name: 'Token', source: tokenSource },
  { name: 'Sale', source: saleSource },
  { name: 'Governance', source: govSource }
];

const deployments = await deployer.batchDeploy({
  contracts: contracts,
  network: 'ethereum-mainnet',
  sequential: true
});
```

## Troubleshooting

### Common Issues

**Insufficient Funds:**
```
Error: Insufficient funds for gas
Solution: Ensure your wallet has enough funds for deployment + gas fees
```

**Network Congestion:**
```
Error: Transaction timeout
Solution: Increase gas price or retry during off-peak hours
```

**Subscription Expired:**
```
Error: SUBSCRIPTION_REQUIRED
Solution: Renew subscription in Stripe customer portal
```

### Getting Help

- Check the [FAQ](./FAQ.md)
- View [troubleshooting guide](./TROUBLESHOOTING.md)
- Contact support: support@smartbrain.io
- Open an issue: [GitHub Issues](https://github.com/SolanaRemix/SmartBrain/issues)

## API Reference

Complete API documentation available at: [API.md](./API.md)

## Pricing

**Monthly Subscription:** $9/month

Includes:
- ✅ Unlimited deployments to testnets
- ✅ Up to 100 mainnet deployments per month
- ✅ All supported networks
- ✅ Automatic verification
- ✅ Email support
- ✅ Deployment analytics dashboard

**Additional mainnet deployments:** $0.50 per deployment

## License

This bot is part of the SmartBrain project, licensed under Apache License 2.0.

## Changelog

### v1.0.0 (Initial Release)
- Multi-chain deployment support
- Stripe payment integration
- Automatic contract verification
- GitHub bot integration
- REST API
- CLI tool
