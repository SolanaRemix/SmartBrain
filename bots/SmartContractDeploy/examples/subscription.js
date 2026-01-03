/**
 * Example 3: Subscribe to SmartContractDeploy Bot
 * 
 * This example demonstrates the complete subscription flow
 * using Stripe Checkout.
 */

const axios = require('axios');

async function createSubscription() {
  const API_PORT = process.env.DEPLOY_BOT_PORT || 3000;
  const API_BASE_URL = `http://localhost:${API_PORT}`;
  const USER_EMAIL = 'user@example.com';
  const USER_ID = 'user_123';

  try {
    console.log('Creating Stripe Checkout session...');

    const response = await axios.post(
      `${API_BASE_URL}/api/payment/deploy/create-checkout-session`,
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
  const API_PORT = process.env.DEPLOY_BOT_PORT || 3000;
  const API_BASE_URL = `http://localhost:${API_PORT}`;
  const USER_ID = 'user@example.com';

  try {
    console.log('Checking subscription status...');

    const response = await axios.get(
      `${API_BASE_URL}/api/payment/deploy/subscription-status`,
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
        console.log('Subscribe at: http://localhost:3000/subscribe/deploy');
      } else {
        console.log('✅ Subscription is active! You can use the bot.');
      }
      
      return response.data;
    }

  } catch (error) {
    console.error('❌ Status check failed:', error.response?.data || error.message);
  }
}

async function manageSubscription() {
  const API_PORT = process.env.DEPLOY_BOT_PORT || 3000;
  const API_BASE_URL = `http://localhost:${API_PORT}`;
  const CUSTOMER_ID = 'cus_xxxxxxxxxxxxx'; // Get from Stripe

  try {
    console.log('Creating customer portal session...');

    const response = await axios.post(
      `${API_BASE_URL}/api/payment/deploy/create-portal-session`,
      {
        customerId: CUSTOMER_ID
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('✅ Portal session created!');
      console.log('Portal URL:', response.data.url);
      console.log('\nVisit the URL above to manage your subscription:');
      console.log('- Update payment method');
      console.log('- View invoices');
      console.log('- Cancel subscription');
      
      return response.data;
    }

  } catch (error) {
    console.error('❌ Failed to create portal session:', error.response?.data || error.message);
  }
}

// Example usage
async function runSubscriptionExample() {
  console.log('=== SmartContractDeploy Bot Subscription Example ===\n');

  // Step 1: Check current subscription status
  console.log('Step 1: Check subscription status');
  await checkSubscriptionStatus();
  console.log('\n---\n');

  // Step 2: Create new subscription (if needed)
  console.log('Step 2: Create new subscription');
  await createSubscription();
  console.log('\n---\n');

  // Step 3: Manage existing subscription
  console.log('Step 3: Manage subscription (for existing customers)');
  // Uncomment to test:
  // await manageSubscription();
  
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
  manageSubscription
};
