# @SmartContractAudit Bot

## Overview

The SmartContractAudit bot is an automated security analysis tool that helps developers identify vulnerabilities, optimize gas usage, and ensure best practices in smart contracts. With comprehensive security checks and detailed reporting, your contracts can be production-ready faster.

**Price:** $4/month subscription (managed via Stripe)

## Features

- 🔒 **Security Analysis:** Detect common vulnerabilities (reentrancy, overflow, etc.)
- ⚡ **Gas Optimization:** Identify gas-inefficient patterns and suggest improvements
- 📊 **Detailed Reports:** Comprehensive audit reports with severity ratings
- 🎯 **Best Practices:** Check compliance with industry standards
- 🔍 **Code Quality:** Static analysis for code quality issues
- ✅ **Automated Testing:** Generate test cases for edge cases
- 📈 **Trend Analysis:** Track security improvements over time
- 🚨 **Real-time Alerts:** Get notified of critical vulnerabilities

## Getting Started

### Prerequisites

- Active $4/month subscription (see Subscription section below)
- Node.js v16 or higher
- Smart contract source code (Solidity, Rust, etc.)

### Subscription

#### How to Subscribe

1. **Visit Stripe Checkout:**
   - Navigate to: `http://your-domain.com/subscribe/audit`
   - Or use the direct Stripe payment link (provided after setup)

2. **Complete Payment:**
   - Enter your payment information
   - Subscription: $4/month (billed monthly)
   - Cancel anytime

3. **Receive Credentials:**
   - API key sent to your email immediately
   - Customer portal link for subscription management

4. **Start Auditing:**
   - Use the API key in all audit requests
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
npm run audit-bot
```

## Usage

### Command Line Interface

```bash
# Audit a contract
node bots/SmartContractAudit/index.js audit \
  --contract ./contracts/MyContract.sol \
  --apikey YOUR_API_KEY

# Get audit report
node bots/SmartContractAudit/index.js report \
  --audit-id aud_123456 \
  --apikey YOUR_API_KEY

# List all audits
node bots/SmartContractAudit/index.js list \
  --apikey YOUR_API_KEY
```

### REST API

#### Audit Contract

**Endpoint:** `POST /api/audit/contract`

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
    "language": "solidity",
    "version": "0.8.19"
  },
  "options": {
    "checkSecurity": true,
    "checkGasOptimization": true,
    "checkBestPractices": true,
    "generateTests": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "auditId": "aud_abc123",
  "status": "completed",
  "summary": {
    "critical": 0,
    "high": 1,
    "medium": 3,
    "low": 5,
    "informational": 8
  },
  "findings": [
    {
      "severity": "high",
      "category": "security",
      "title": "Reentrancy vulnerability detected",
      "description": "Function withdraw() is vulnerable to reentrancy attacks",
      "line": 45,
      "recommendation": "Use ReentrancyGuard from OpenZeppelin",
      "codeSnippet": "function withdraw() public { ... }"
    }
  ],
  "gasOptimizations": [
    {
      "title": "Use uint256 instead of uint8",
      "potentialSavings": "2000 gas per transaction",
      "line": 23,
      "description": "Using uint256 is more gas-efficient than uint8"
    }
  ],
  "score": 7.5,
  "timestamp": "2024-01-15T10:30:00Z",
  "reportUrl": "https://reports.smartbrain.io/aud_abc123"
}
```

#### Get Audit Report

**Endpoint:** `GET /api/audit/report/:auditId`

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
  "auditId": "aud_abc123",
  "contractName": "MyToken",
  "status": "completed",
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:32:15Z",
  "summary": {
    "totalIssues": 17,
    "critical": 0,
    "high": 1,
    "medium": 3,
    "low": 5,
    "informational": 8
  },
  "overallScore": 7.5,
  "findings": [...],
  "gasOptimizations": [...],
  "recommendations": [...],
  "reportUrl": "https://reports.smartbrain.io/aud_abc123.pdf"
}
```

### GitHub Integration

Comment on a pull request or issue to trigger audits:

```
@SmartContractAudit audit this contract
```

The bot will:
1. Verify your subscription status
2. Extract contract from the PR
3. Perform comprehensive security audit
4. Comment back with audit results and findings

### JavaScript/Node.js SDK

```javascript
const SmartContractAudit = require('./bots/SmartContractAudit');

const auditor = new SmartContractAudit({
  apiKey: 'YOUR_API_KEY'
});

// Audit contract
const audit = await auditor.audit({
  contract: contractSource,
  options: {
    checkSecurity: true,
    checkGasOptimization: true
  }
});

console.log(`Audit Score: ${audit.score}/10`);
console.log(`Critical Issues: ${audit.summary.critical}`);
console.log(`High Issues: ${audit.summary.high}`);

// Get detailed report
const report = await auditor.getReport(audit.auditId);
console.log(`Report URL: ${report.reportUrl}`);
```

## Audit Categories

### Security Vulnerabilities

The bot checks for:
- **Reentrancy attacks**
- **Integer overflow/underflow**
- **Unchecked external calls**
- **Access control issues**
- **Front-running vulnerabilities**
- **Denial of Service vectors**
- **Logic errors**
- **Timestamp dependence**
- **Randomness manipulation**

### Gas Optimization

Identifies opportunities to:
- Optimize storage usage
- Reduce function call gas costs
- Improve loop efficiency
- Use appropriate data types
- Minimize storage writes
- Pack storage variables
- Use events instead of storage

### Best Practices

Checks for:
- Proper use of modifiers
- Event emission
- Error handling
- Code documentation
- Naming conventions
- Function visibility
- State variable initialization
- Use of established patterns

## Severity Levels

- **Critical:** Immediate fix required, exploitable vulnerabilities
- **High:** Important issues that could lead to loss of funds
- **Medium:** Issues that should be addressed but lower risk
- **Low:** Minor issues or code quality improvements
- **Informational:** Suggestions and best practices

## Payment Verification

Every audit request includes automatic subscription verification:

1. **API Key Validation:** Bot validates the API key
2. **Subscription Check:** Queries Stripe API for active subscription
3. **Status Verification:** Ensures subscription is not cancelled or past due
4. **Action Authorization:** Only processes requests with valid, active subscriptions

If subscription is invalid:
```json
{
  "success": false,
  "error": "SUBSCRIPTION_REQUIRED",
  "message": "Active subscription required. Please subscribe at: http://your-domain.com/subscribe/audit",
  "subscriptionUrl": "http://your-domain.com/subscribe/audit"
}
```

## Report Features

### Detailed Findings

Each finding includes:
- Severity level and category
- Clear description of the issue
- Exact location (file and line number)
- Code snippet showing the problem
- Detailed explanation of the risk
- Step-by-step fix recommendations
- References to documentation

### Visual Reports

- PDF export with charts and graphs
- HTML interactive reports
- JSON format for automation
- Integration with CI/CD pipelines

### Comparison Reports

- Compare audits over time
- Track security improvements
- Identify regression issues
- Monitor gas optimization progress

## Examples

### Example 1: Basic Security Audit

```javascript
const audit = await auditor.audit({
  contract: `
    pragma solidity ^0.8.0;
    
    contract Wallet {
      mapping(address => uint) balances;
      
      function deposit() public payable {
        balances[msg.sender] += msg.value;
      }
      
      function withdraw() public {
        uint amount = balances[msg.sender];
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        balances[msg.sender] = 0;
      }
    }
  `,
  options: {
    checkSecurity: true
  }
});

console.log('Audit Results:', audit.summary);
// Will detect: Reentrancy vulnerability in withdraw()
```

### Example 2: Gas Optimization Analysis

```javascript
const audit = await auditor.audit({
  contract: contractSource,
  options: {
    checkGasOptimization: true
  }
});

console.log('Gas Optimizations Found:', audit.gasOptimizations.length);
audit.gasOptimizations.forEach(opt => {
  console.log(`- ${opt.title}: Save ${opt.potentialSavings}`);
});
```

### Example 3: Full Audit with Report

```javascript
const audit = await auditor.audit({
  contract: contractSource,
  options: {
    checkSecurity: true,
    checkGasOptimization: true,
    checkBestPractices: true,
    generateTests: true
  }
});

// Get detailed report
const report = await auditor.getReport(audit.auditId);

// Download PDF
const pdf = await auditor.downloadPDF(audit.auditId);
console.log(`Report saved to: ${pdf.path}`);
```

## Supported Languages

- **Solidity** (all versions)
- **Vyper**
- **Rust** (for Solana contracts)
- **Move** (for Aptos/Sui)

## Integration with CI/CD

### GitHub Actions

```yaml
name: Contract Audit
on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Audit Contracts
        run: |
          npm install
          node bots/SmartContractAudit/index.js audit \
            --contract ./contracts/*.sol \
            --apikey ${{ secrets.AUDIT_API_KEY }}
```

### GitLab CI

```yaml
audit:
  stage: test
  script:
    - npm install
    - node bots/SmartContractAudit/index.js audit --contract ./contracts/*.sol --apikey $AUDIT_API_KEY
  only:
    - merge_requests
```

## Troubleshooting

### Common Issues

**False Positives:**
```
Some findings may be false positives depending on context.
Review each finding and use your judgment.
```

**Subscription Expired:**
```
Error: SUBSCRIPTION_REQUIRED
Solution: Renew subscription in Stripe customer portal
```

**Large Contract Timeout:**
```
Error: Audit timeout
Solution: Split large contracts or increase timeout limit
```

### Getting Help

- Check the [FAQ](./FAQ.md)
- View [audit examples](./examples/)
- Contact support: support@smartbrain.io
- Open an issue: [GitHub Issues](https://github.com/SolanaRemix/SmartBrain/issues)

## API Reference

Complete API documentation available at: [API.md](./API.md)

## Pricing

**Monthly Subscription:** $4/month

Includes:
- ✅ Unlimited contract audits
- ✅ Security vulnerability detection
- ✅ Gas optimization analysis
- ✅ Best practices checking
- ✅ Detailed PDF reports
- ✅ Email support
- ✅ Audit history and tracking

**No additional fees or limits**

## License

This bot is part of the SmartBrain project, licensed under Apache License 2.0.

## Changelog

### v1.0.0 (Initial Release)
- Security vulnerability detection
- Gas optimization analysis
- Best practices checking
- Stripe payment integration
- PDF report generation
- GitHub bot integration
- REST API
- CLI tool
