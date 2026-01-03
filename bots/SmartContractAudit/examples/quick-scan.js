/**
 * Example 2: Quick security scan
 * 
 * This example demonstrates using the quick scan feature
 * for rapid security checks.
 */

const axios = require('axios');

async function quickSecurityScan() {
  const API_PORT = process.env.AUDIT_BOT_PORT || 3001;
  const API_BASE_URL = `http://localhost:${API_PORT}`;
  const API_KEY = 'your_api_key_here';
  const USER_ID = 'user@example.com';

  const contractToScan = `
    pragma solidity ^0.8.0;

    contract QuickScanExample {
        mapping(address => uint) balances;
        
        function withdraw() public {
            uint amount = balances[msg.sender];
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success);
            balances[msg.sender] = 0;
        }
    }
  `;

  try {
    console.log('Running quick security scan...');

    const response = await axios.post(
      `${API_BASE_URL}/api/audit/quick-scan`,
      {
        userId: USER_ID,
        contract: {
          source: contractToScan
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
      console.log('✅ Quick scan completed!\n');
      
      const { criticalIssues, issueCount, recommendation } = response.data;
      
      console.log(`Critical Issues Found: ${issueCount}`);
      
      if (criticalIssues.length > 0) {
        console.log('\n⚠️  CRITICAL ISSUES:');
        criticalIssues.forEach((issue, index) => {
          console.log(`${index + 1}. ${issue.type}: ${issue.message}`);
        });
      } else {
        console.log('✅ No critical issues detected');
      }
      
      console.log(`\nRecommendation: ${recommendation}`);
      
      return response.data;
    }

  } catch (error) {
    console.error('❌ Quick scan failed:', error.response?.data || error.message);
  }
}

// Run the example
quickSecurityScan()
  .then(() => console.log('\nExample completed'))
  .catch(error => console.error('Example failed:', error));

module.exports = { quickSecurityScan };
