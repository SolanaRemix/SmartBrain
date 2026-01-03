/**
 * Example 3: Subscribe to SmartContractAudit Bot
 * 
 * This example demonstrates the complete subscription flow
 * using Stripe Checkout.
 */

const axios = require('axios');

async function createSubscription() {
  const API_PORT = process.env.AUDIT_BOT_PORT || 3001;
  const API_BASE_URL = `http://localhost:${API_PORT}`;
  const USER_EMAIL = 'user@example.com';
  const USER_ID = 'user_123';

  try {
    console.log('Creating Stripe Checkout session...');

    const response = await axios.post(
      `${API_BASE_URL}/api/payment/audit/create-checkout-session`,
      {
        userEmail: USER_EMAIL,
        userId: USER_ID
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('✅ Checkout session created!');
      console.log('Session ID:', response.data.sessionId);
      console.log('Checkout URL:', response.data.url);
      console.log('\nPlease visit the URL above to complete your subscription.');
      console.log('After payment, you will receive an API key via email.');
      
      return response.data;
    }

  } catch (error) {
    console.error('❌ Failed to create checkout session:', error.response?.data || error.message);
  }
}

async function checkSubscriptionStatus() {
  const API_PORT = process.env.AUDIT_BOT_PORT || 3001;
  const API_BASE_URL = `http://localhost:${API_PORT}`;
  const USER_ID = 'user@example.com';

  try {
    console.log('Checking subscription status...');

    const response = await axios.get(
      `${API_BASE_URL}/api/payment/audit/subscription-status`,
      {
        params: {
          userId: USER_ID
        }
      }
    );

    if (response.data.success) {
      console.log('Bot:', response.data.botName);
      console.log('Price:', response.data.price);
      console.log('Subscription Active:', response.data.subscriptionActive);
      
      if (!response.data.subscriptionActive) {
        console.log('\n⚠️  No active subscription found.');
        console.log('Subscribe at: http://localhost:3001/subscribe/audit');
      } else {
        console.log('✅ Subscription is active! You can use the bot.');
      }
      
      return response.data;
    }

  } catch (error) {
    console.error('❌ Status check failed:', error.response?.data || error.message);
  }
}

async function getAuditHistory() {
  const API_PORT = process.env.AUDIT_BOT_PORT || 3001;
  const API_BASE_URL = `http://localhost:${API_PORT}`;
  const API_KEY = 'your_api_key_here';
  const USER_ID = 'user@example.com';

  try {
    console.log('Fetching audit history...');

    const response = await axios.get(
      `${API_BASE_URL}/api/audit/list`,
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
      console.log(`\nTotal Audits: ${response.data.total}`);
      
      if (response.data.audits.length > 0) {
        console.log('\n=== AUDIT HISTORY ===');
        response.data.audits.forEach((audit, index) => {
          console.log(`\n${index + 1}. ${audit.contractName}`);
          console.log(`   Audit ID: ${audit.auditId}`);
          console.log(`   Status: ${audit.status}`);
          console.log(`   Score: ${audit.score}/10`);
          console.log(`   Findings: ${audit.findings}`);
          console.log(`   Date: ${new Date(audit.timestamp).toLocaleString()}`);
        });
      } else {
        console.log('No audits found yet.');
      }
      
      return response.data;
    }

  } catch (error) {
    console.error('❌ Failed to fetch audit history:', error.response?.data || error.message);
  }
}

// Example usage
async function runSubscriptionExample() {
  console.log('=== SmartContractAudit Bot Subscription Example ===\n');

  // Step 1: Check current subscription status
  console.log('Step 1: Check subscription status');
  await checkSubscriptionStatus();
  console.log('\n---\n');

  // Step 2: Create new subscription (if needed)
  console.log('Step 2: Create new subscription');
  await createSubscription();
  console.log('\n---\n');

  // Step 3: View audit history (requires active subscription)
  console.log('Step 3: View audit history');
  // Uncomment to test:
  // await getAuditHistory();
  
  console.log('\nExample completed!');
}

// Run the example
if (require.main === module) {
  runSubscriptionExample()
    .catch(error => console.error('Example failed:', error));
}

module.exports = {
  createSubscription,
  checkSubscriptionStatus,
  getAuditHistory
};
