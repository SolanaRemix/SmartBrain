/**
 * Example 2: Deploy an NFT (ERC-721) contract
 * 
 * This example shows how to deploy an NFT contract
 * with metadata URI configuration.
 */

const axios = require('axios');

async function deployNFTContract() {
  const API_PORT = process.env.DEPLOY_BOT_PORT || 3000;
  const API_BASE_URL = `http://localhost:${API_PORT}`;
  const API_KEY = 'your_api_key_here';
  const USER_ID = 'user@example.com';

  const nftContractSource = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;

    import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
    import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";

    contract MyNFT is ERC721URIStorage, Ownable {
        uint256 private _tokenIdCounter;

        constructor() ERC721("MyNFT", "MNFT") {}

        function safeMint(address to, string memory uri) public onlyOwner {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter += 1;
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uri);
        }
    }
  `;

  try {
    console.log('Deploying NFT Contract...');

    const response = await axios.post(
      `${API_BASE_URL}/api/deploy/contract`,
      {
        userId: USER_ID,
        contract: {
          name: 'MyNFT',
          source: nftContractSource,
          compiler: '0.8.19',
          optimization: true
        },
        network: 'polygon-mumbai',
        constructorArgs: [], // No constructor arguments
        verification: true,
        options: {
          gasPrice: 'fast',
          notifyOnCompletion: true,
          notificationEmail: USER_ID
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('✅ NFT Contract deployed!');
      console.log('Contract Address:', response.data.contractAddress);
      console.log('Transaction Hash:', response.data.transactionHash);
      console.log('Network:', response.data.network);
      console.log('Verification URL:', response.data.verificationUrl);
      
      // Check deployment status
      await checkDeploymentStatus(response.data.deploymentId);
      
      return response.data;
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error.response?.data || error.message);
  }
}

async function checkDeploymentStatus(deploymentId) {
  const API_PORT = process.env.DEPLOY_BOT_PORT || 3000;
  const API_BASE_URL = `http://localhost:${API_PORT}`;
  const API_KEY = 'your_api_key_here';
  const USER_ID = 'user@example.com';

  try {
    console.log('\nChecking deployment status...');

    const response = await axios.get(
      `${API_BASE_URL}/api/deploy/status/${deploymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        },
        params: {
          userId: USER_ID
        }
      }
    );

    if (response.data.success) {
      console.log('Status:', response.data.status);
      console.log('Verification:', response.data.verification);
      console.log('Block Number:', response.data.details.blockNumber);
    }

  } catch (error) {
    console.error('❌ Status check failed:', error.response?.data || error.message);
  }
}

// Run the example
deployNFTContract()
  .then(() => console.log('Example completed'))
  .catch(error => console.error('Example failed:', error));

module.exports = { deployNFTContract };
