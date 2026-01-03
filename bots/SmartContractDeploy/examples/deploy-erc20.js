/**
 * Example 1: Deploy a simple ERC-20 token contract
 * 
 * This example demonstrates deploying a basic ERC-20 token
 * to Ethereum Sepolia testnet.
 */

const axios = require('axios');

async function deployERC20Token() {
  const API_PORT = process.env.DEPLOY_BOT_PORT || 3000;
  const API_BASE_URL = `http://localhost:${API_PORT}`;
  const API_KEY = 'your_api_key_here'; // Get from subscription email
  const USER_ID = 'user@example.com';

  // ERC-20 Token Contract (using OpenZeppelin)
  const contractSource = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;

    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

    contract MyToken is ERC20 {
        constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
            _mint(msg.sender, initialSupply * 10 ** decimals());
        }
    }
  `;

  try {
    console.log('Deploying ERC-20 Token...');

    const response = await axios.post(
      `${API_BASE_URL}/api/deploy/contract`,
      {
        userId: USER_ID,
        contract: {
          name: 'MyToken',
          source: contractSource,
          compiler: '0.8.19',
          optimization: true
        },
        network: 'ethereum-sepolia',
        constructorArgs: [1000000], // 1 million tokens
        verification: true
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('✅ Deployment successful!');
      console.log('Contract Address:', response.data.contractAddress);
      console.log('Transaction Hash:', response.data.transactionHash);
      console.log('Gas Used:', response.data.gasUsed);
      console.log('Estimated Cost:', response.data.estimatedCost);
      console.log('Verification URL:', response.data.verificationUrl);
      
      return response.data;
    } else {
      console.error('❌ Deployment failed:', response.data.message);
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.data.message);
      
      if (error.response.data.error === 'SUBSCRIPTION_REQUIRED') {
        console.log('Subscribe at:', error.response.data.subscriptionUrl);
      }
    } else {
      console.error('❌ Network error:', error.message);
    }
  }
}

// Run the example
deployERC20Token()
  .then(() => console.log('Example completed'))
  .catch(error => console.error('Example failed:', error));

module.exports = { deployERC20Token };
