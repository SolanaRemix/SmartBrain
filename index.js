require('dotenv').config();

/**
 * SmartBrain Bots - Main Entry Point
 * 
 * This file allows running both bots simultaneously or individually.
 * Each bot runs on a different port to avoid conflicts.
 */

const deployBot = require('./bots/SmartContractDeploy');
const auditBot = require('./bots/SmartContractAudit');

const DEPLOY_PORT = process.env.DEPLOY_BOT_PORT || 3000;
const AUDIT_PORT = process.env.AUDIT_BOT_PORT || 3001;

console.log('=== SmartBrain Bots Starting ===\n');

// Start SmartContractDeploy Bot
deployBot.listen(DEPLOY_PORT, () => {
  console.log(`✅ SmartContractDeploy Bot running on port ${DEPLOY_PORT}`);
  console.log(`   Price: $9/month`);
  console.log(`   Health: http://localhost:${DEPLOY_PORT}/health`);
  console.log(`   Info: http://localhost:${DEPLOY_PORT}/api/deploy/info`);
});

// Start SmartContractAudit Bot
auditBot.listen(AUDIT_PORT, () => {
  console.log(`✅ SmartContractAudit Bot running on port ${AUDIT_PORT}`);
  console.log(`   Price: $4/month`);
  console.log(`   Health: http://localhost:${AUDIT_PORT}/health`);
  console.log(`   Info: http://localhost:${AUDIT_PORT}/api/audit/info`);
});

console.log('\n=== Both bots are now operational ===');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP servers');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP servers');
  process.exit(0);
});
