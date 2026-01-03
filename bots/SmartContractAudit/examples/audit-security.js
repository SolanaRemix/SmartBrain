/**
 * Example 1: Audit a smart contract for security vulnerabilities
 * 
 * This example demonstrates auditing a contract for common
 * security issues like reentrancy, overflow, and access control.
 */

const axios = require('axios');

async function auditContract() {
  const API_HOST = process.env.AUDIT_BOT_HOST || 'localhost';
  const API_PORT = process.env.AUDIT_BOT_PORT || 3001;
  const API_BASE_URL = `http://${API_HOST}:${API_PORT}`;
  const API_KEY = 'your_api_key_here'; // Get from subscription email
  const USER_ID = 'user@example.com';

  // Sample vulnerable contract for demonstration
  const vulnerableContract = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;

    contract VulnerableWallet {
        mapping(address => uint256) public balances;

        function deposit() public payable {
            balances[msg.sender] += msg.value;
        }

        function withdraw() public {
            uint256 amount = balances[msg.sender];
            // Vulnerable: external call before state update
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "Transfer failed");
            balances[msg.sender] = 0;
        }

        function authorize(address user) public {
            // Vulnerable: using tx.origin for authorization
            require(tx.origin == owner, "Not authorized");
            // grant access to user
        }

        address public owner;
    }
  `;

  try {
    console.log('Starting security audit...');

    const response = await axios.post(
      `${API_BASE_URL}/api/audit/contract`,
      {
        userId: USER_ID,
        contract: {
          name: 'VulnerableWallet',
          source: vulnerableContract,
          language: 'solidity',
          version: '0.8.0'
        },
        options: {
          checkSecurity: true,
          checkGasOptimization: true,
          checkBestPractices: true
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
      console.log('✅ Audit completed!\n');
      
      const { summary, findings, gasOptimizations, score } = response.data;
      
      console.log('=== AUDIT SUMMARY ===');
      console.log(`Overall Score: ${score}/10`);
      console.log(`Critical Issues: ${summary.critical}`);
      console.log(`High Issues: ${summary.high}`);
      console.log(`Medium Issues: ${summary.medium}`);
      console.log(`Low Issues: ${summary.low}`);
      console.log(`Informational: ${summary.informational}`);
      console.log();

      if (findings.length > 0) {
        console.log('=== SECURITY FINDINGS ===');
        findings.forEach((finding, index) => {
          console.log(`\n${index + 1}. ${finding.title}`);
          console.log(`   Severity: ${finding.severity.toUpperCase()}`);
          console.log(`   Line: ${finding.line}`);
          console.log(`   Description: ${finding.description}`);
          console.log(`   Recommendation: ${finding.recommendation}`);
          if (finding.codeSnippet) {
            console.log(`   Code: ${finding.codeSnippet}`);
          }
        });
      }

      if (gasOptimizations.length > 0) {
        console.log('\n=== GAS OPTIMIZATIONS ===');
        gasOptimizations.forEach((opt, index) => {
          console.log(`\n${index + 1}. ${opt.title}`);
          console.log(`   Savings: ${opt.potentialSavings}`);
          console.log(`   Description: ${opt.description}`);
          console.log(`   Recommendation: ${opt.recommendation}`);
        });
      }

      console.log('\n=== REPORT ===');
      console.log(`Report URL: ${response.data.reportUrl}`);
      console.log(`Audit ID: ${response.data.auditId}`);
      
      return response.data;
    } else {
      console.error('❌ Audit failed:', response.data.message);
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
auditContract()
  .then(() => console.log('\nExample completed'))
  .catch(error => console.error('Example failed:', error));

module.exports = { auditContract };
