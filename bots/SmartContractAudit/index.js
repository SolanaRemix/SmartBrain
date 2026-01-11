require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { router: paymentRouter, requireActiveSubscription } = require('./payment');

const app = express();
const PORT = process.env.AUDIT_BOT_PORT || 3001;

// Mount webhook route BEFORE body parser to preserve raw body for signature verification
app.use('/api/payment/audit/webhook', express.raw({ type: 'application/json' }), paymentRouter);

// Middleware for all other routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Payment routes (excluding webhook which is already handled)
app.use('/api/payment/audit', (req, res, next) => {
  // Skip webhook route as it's already handled
  if (req.path === '/webhook') {
    return next('route');
  }
  next();
}, paymentRouter);

/**
 * Mock vulnerability database for demonstration
 */
const vulnerabilityPatterns = {
  reentrancy: {
    pattern: /\.call\{value:/,
    severity: 'high',
    title: 'Potential reentrancy vulnerability',
    description: 'External call before state update can lead to reentrancy attacks',
    recommendation: 'Use ReentrancyGuard or checks-effects-interactions pattern'
  },
  uncheckedReturn: {
    pattern: /\.call\(/,
    severity: 'medium',
    title: 'Unchecked return value',
    description: 'Return value of low-level call not checked',
    recommendation: 'Always check return values of external calls'
  },
  txOrigin: {
    pattern: /tx\.origin/,
    severity: 'high',
    title: 'Use of tx.origin for authorization',
    description: 'Using tx.origin for authorization is vulnerable to phishing attacks',
    recommendation: 'Use msg.sender instead of tx.origin'
  }
};

/**
 * Audit smart contract
 * Requires active subscription
 */
app.post('/api/audit/contract', requireActiveSubscription, async (req, res) => {
  try {
    const { userId, contract, options = {} } = req.body;

    // Validate required fields
    if (!contract || !contract.source) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'Contract source code is required'
      });
    }

    const auditId = `aud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Perform audit analysis
    const findings = [];
    const gasOptimizations = [];

    // Security checks
    if (options.checkSecurity !== false) {
      for (const vuln of Object.values(vulnerabilityPatterns)) {
        if (vuln.pattern.test(contract.source)) {
          const lines = contract.source.split('\n');
          const lineNumber = lines.findIndex(line => vuln.pattern.test(line)) + 1;
          
          findings.push({
            severity: vuln.severity,
            category: 'security',
            title: vuln.title,
            description: vuln.description,
            line: lineNumber,
            recommendation: vuln.recommendation,
            codeSnippet: lines[lineNumber - 1]?.trim()
          });
        }
      }
    }

    // Gas optimization checks
    if (options.checkGasOptimization !== false) {
      if (/uint8|uint16|uint32|uint64|uint128/.test(contract.source)) {
        gasOptimizations.push({
          title: 'Use uint256 for gas efficiency',
          potentialSavings: '2000 gas per transaction',
          description: 'uint256 is more gas-efficient than smaller uint types',
          recommendation: 'Replace uint8/uint16/etc with uint256 unless packing storage'
        });
      }

      if (/string\s+public/.test(contract.source)) {
        gasOptimizations.push({
          title: 'Public string variables are expensive',
          potentialSavings: '5000 gas per read',
          description: 'Public string getters are gas-intensive',
          recommendation: 'Consider using bytes32 or storing strings off-chain'
        });
      }
    }

    // Calculate summary
    const summary = {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
      informational: findings.filter(f => f.severity === 'informational').length
    };

    // Calculate score (10 - deductions based on severity)
    const score = Math.max(0, 10 - 
      (summary.critical * 3) - 
      (summary.high * 2) - 
      (summary.medium * 1) - 
      (summary.low * 0.5)
    );

    // Log audit for audit trail
    console.log(`Audit initiated by user: ${userId}`);
    console.log(`Audit ID: ${auditId}`);
    console.log(`Findings: ${findings.length}`);
    console.log(`Gas Optimizations: ${gasOptimizations.length}`);

    res.json({
      success: true,
      auditId: auditId,
      status: 'completed',
      summary: summary,
      findings: findings,
      gasOptimizations: gasOptimizations,
      score: parseFloat(score.toFixed(1)),
      timestamp: new Date().toISOString(),
      reportUrl: `https://reports.smartbrain.io/${auditId}`,
      message: 'Contract audit completed successfully'
    });

  } catch (error) {
    console.error('Audit error:', error);
    res.status(500).json({
      success: false,
      error: 'AUDIT_ERROR',
      message: error.message
    });
  }
});

/**
 * Get audit report
 */
app.get('/api/audit/report/:auditId', requireActiveSubscription, async (req, res) => {
  try {
    const { auditId } = req.params;

    // TODO: Fetch actual audit report from database
    // This is a mock response
    res.json({
      success: true,
      auditId: auditId,
      contractName: 'ExampleContract',
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      summary: {
        totalIssues: 5,
        critical: 0,
        high: 1,
        medium: 2,
        low: 2,
        informational: 0
      },
      overallScore: 7.5,
      findings: [],
      gasOptimizations: [],
      recommendations: [
        'Implement reentrancy guards on external calls',
        'Add input validation for all public functions',
        'Consider using SafeMath library for arithmetic operations'
      ],
      reportUrl: `https://reports.smartbrain.io/${auditId}.pdf`
    });

  } catch (error) {
    console.error('Report fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'REPORT_ERROR',
      message: error.message
    });
  }
});

/**
 * List all audits for a user
 */
app.get('/api/audit/list', requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.userId;

    // TODO: Fetch actual audits from database
    // This is a mock response
    res.json({
      success: true,
      userId: userId,
      audits: [
        {
          auditId: 'aud_example1',
          contractName: 'MyToken',
          status: 'completed',
          score: 8.5,
          findings: 3,
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
    bot: 'SmartContractAudit',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

/**
 * Info endpoint
 */
app.get('/api/audit/info', (req, res) => {
  res.json({
    success: true,
    bot: 'SmartContractAudit',
    description: 'Automated smart contract security auditing bot',
    price: '$4/month',
    features: [
      'Security vulnerability detection',
      'Gas optimization analysis',
      'Best practices checking',
      'Detailed PDF reports',
      'Code quality analysis',
      'Automated test generation'
    ],
    supportedLanguages: [
      'Solidity',
      'Vyper',
      'Rust',
      'Move'
    ],
    subscriptionUrl: `/subscribe/audit`
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
    console.log(`SmartContractAudit Bot running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
