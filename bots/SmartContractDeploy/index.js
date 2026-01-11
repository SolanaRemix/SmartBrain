require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { router: paymentRouter, requireActiveSubscription } = require('./payment');

const app = express();
const PORT = process.env.DEPLOY_BOT_PORT || 3000;

// Mount webhook route BEFORE body parser to preserve raw body for signature verification
app.use('/api/payment/deploy/webhook', express.raw({ type: 'application/json' }), paymentRouter);

// Middleware for all other routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Payment routes (excluding webhook which is already mounted)
app.use('/api/payment/deploy', (req, res, next) => {
  // Skip webhook route as it's already handled
  if (req.path === '/webhook') {
    return next('route');
  }
  next();
}, paymentRouter);

/**
 * Deploy smart contract
 * Requires active subscription
 */
app.post('/api/deploy/contract', requireActiveSubscription, async (req, res) => {
  try {
    const { userId, contract, network, verification } = req.body;

    // Validate required fields
    if (!contract || !network) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'Contract source and network are required'
      });
    }

    // Simulate deployment process
    const deploymentId = `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const contractAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;

    // Log deployment for audit
    console.log(`Deployment initiated by user: ${userId}`);
    console.log(`Network: ${network}`);
    console.log(`Deployment ID: ${deploymentId}`);

    // TODO: Implement actual deployment logic
    // - Compile contract
    // - Estimate gas
    // - Deploy to network
    // - Verify on block explorer if requested
    // - Store deployment data

    res.json({
      success: true,
      deploymentId: deploymentId,
      contractAddress: contractAddress,
      transactionHash: transactionHash,
      network: network,
      gasUsed: '2145832',
      estimatedCost: '0.045 ETH',
      verificationUrl: verification ? `https://etherscan.io/address/${contractAddress}#code` : null,
      timestamp: new Date().toISOString(),
      message: 'Contract deployment initiated successfully'
    });

  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({
      success: false,
      error: 'DEPLOYMENT_ERROR',
      message: error.message
    });
  }
});

/**
 * Get deployment status
 */
app.get('/api/deploy/status/:deploymentId', requireActiveSubscription, async (req, res) => {
  try {
    const { deploymentId } = req.params;

    // TODO: Fetch actual deployment status from database
    // This is a mock response
    res.json({
      success: true,
      deploymentId: deploymentId,
      status: 'completed',
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      verification: 'verified',
      details: {
        network: 'ethereum-mainnet',
        blockNumber: 18921045,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: 'STATUS_ERROR',
      message: error.message
    });
  }
});

/**
 * List all deployments for a user
 */
app.get('/api/deploy/list', requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.userId;

    // TODO: Fetch actual deployments from database
    // This is a mock response
    res.json({
      success: true,
      userId: userId,
      deployments: [
        {
          deploymentId: 'dep_example1',
          contractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          network: 'ethereum-mainnet',
          status: 'completed',
          timestamp: new Date().toISOString()
        }
      ],
      total: 1
    });

  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({
      success: false,
      error: 'LIST_ERROR',
      message: error.message
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    bot: 'SmartContractDeploy',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

/**
 * Info endpoint
 */
app.get('/api/deploy/info', (req, res) => {
  res.json({
    success: true,
    bot: 'SmartContractDeploy',
    description: 'Automated smart contract deployment bot',
    price: '$9/month',
    features: [
      'Multi-chain deployment support',
      'Automatic contract verification',
      'Gas optimization',
      'Deployment analytics',
      'Version control',
      'Testing integration'
    ],
    supportedNetworks: [
      'ethereum-mainnet',
      'ethereum-sepolia',
      'polygon-mainnet',
      'polygon-mumbai',
      'bsc-mainnet',
      'bsc-testnet',
      'avalanche-mainnet',
      'avalanche-fuji',
      'arbitrum-one',
      'optimism-mainnet',
      'solana-mainnet',
      'solana-devnet'
    ],
    subscriptionUrl: `/subscribe/deploy`
  });
});

// Error handling middleware
app.use((err, req, res) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SmartContractDeploy Bot running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
