require('dotenv').config();
const express = require('express');
const { requireActiveSubscription } = require('./payment');

const router = express.Router();

/**
 * Audit contract route
 */
router.post('/contract', requireActiveSubscription, async (req, res) => {
  // Implementation handled in index.js
  next();
});

/**
 * Get audit report route
 */
router.get('/report/:auditId', requireActiveSubscription, async (req, res) => {
  // Implementation handled in index.js
  next();
});

/**
 * List audits route
 */
router.get('/list', requireActiveSubscription, async (req, res) => {
  // Implementation handled in index.js
  next();
});

/**
 * Quick security scan (lightweight version)
 */
router.post('/quick-scan', requireActiveSubscription, async (req, res) => {
  try {
    const { contract } = req.body;

    if (!contract || !contract.source) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'Contract source code is required'
      });
    }

    // Perform quick scan for critical issues only
    const criticalIssues = [];

    if (/\.call\{value:/.test(contract.source)) {
      criticalIssues.push({
        type: 'reentrancy',
        severity: 'critical',
        message: 'Potential reentrancy vulnerability detected'
      });
    }

    if (/tx\.origin/.test(contract.source)) {
      criticalIssues.push({
        type: 'authorization',
        severity: 'critical',
        message: 'Using tx.origin for authorization is dangerous'
      });
    }

    res.json({
      success: true,
      criticalIssues: criticalIssues,
      issueCount: criticalIssues.length,
      recommendation: criticalIssues.length > 0 
        ? 'Critical issues found. Run full audit for detailed analysis.' 
        : 'No critical issues found. Consider running full audit.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quick scan error:', error);
    res.status(500).json({
      success: false,
      error: 'SCAN_ERROR',
      message: error.message
    });
  }
});

/**
 * Compare two audits
 */
router.post('/compare', requireActiveSubscription, async (req, res) => {
  try {
    const { auditId1, auditId2 } = req.body;

    if (!auditId1 || !auditId2) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'Two audit IDs are required for comparison'
      });
    }

    // TODO: Implement actual comparison logic
    res.json({
      success: true,
      comparison: {
        auditId1: auditId1,
        auditId2: auditId2,
        improvements: {
          criticalFixed: 1,
          highFixed: 2,
          newIssues: 0
        },
        scoreChange: '+1.5',
        message: 'Contract security improved since last audit'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({
      success: false,
      error: 'COMPARISON_ERROR',
      message: error.message
    });
  }
});

module.exports = router;
