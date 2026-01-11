require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

/**
 * Verify user has an active subscription for SmartContractAudit bot
 * @param {string} userId - User ID or customer ID
 * @returns {Promise<boolean>} - True if subscription is active
 */
async function verifySubscription(userId) {
  try {
    // Search for customer by metadata or email
    const customers = await stripe.customers.list({
      limit: 1,
      email: userId // or use metadata to match userId
    });

    if (customers.data.length === 0) {
      return false;
    }

    const customer = customers.data[0];

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      price: process.env.SMARTCONTRACT_AUDIT_PRICE_ID,
      limit: 1
    });

    return subscriptions.data.length > 0;
  } catch (error) {
    console.error('Error verifying subscription:', error);
    return false;
  }
}

/**
 * Middleware to verify payment status before processing bot requests
 */
async function requireActiveSubscription(req, res, next) {
  const userId = req.body.userId || req.query.userId || req.headers['x-user-id'];

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'USER_ID_REQUIRED',
      message: 'User ID is required for authentication'
    });
  }

  const isActive = await verifySubscription(userId);

  if (!isActive) {
    return res.status(402).json({
      success: false,
      error: 'SUBSCRIPTION_REQUIRED',
      message: 'Active SmartContractAudit subscription required ($4/month)',
      subscriptionUrl: `${req.protocol}://${req.get('host')}/subscribe/audit`,
      price: '$4/month'
    });
  }

  req.userId = userId;
  next();
}

/**
 * Create checkout session for new subscription
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { userEmail, userId } = req.body;

    // Validate input parameters
    if (!userEmail || typeof userEmail !== 'string' || !userEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_EMAIL',
        message: 'A valid email address is required'
      });
    }

    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_USER_ID',
        message: 'A valid user ID is required'
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.SMARTCONTRACT_AUDIT_PRICE_ID,
          quantity: 1
        }
      ],
      success_url: `${req.protocol}://${req.get('host')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        botType: 'SmartContractAudit'
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      error: 'CHECKOUT_ERROR',
      message: 'Failed to create checkout session. Please try again later.'
    });
  }
});

/**
 * Create customer portal session for subscription management
 */
router.post('/create-portal-session', async (req, res) => {
  try {
    const { customerId } = req.body;

    // Validate customerId input
    if (!customerId || typeof customerId !== 'string' || customerId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'CUSTOMER_ID_REQUIRED',
        message: 'A valid Stripe customer ID is required'
      });
    }

    const sanitizedCustomerId = customerId.trim();

    // Basic Stripe customer ID format check (e.g., "cus_XXXXXXXX")
    const customerIdPattern = /^cus_[A-Za-z0-9]+$/;
    if (!customerIdPattern.test(sanitizedCustomerId)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CUSTOMER_ID_FORMAT',
        message: 'Customer ID must be a valid Stripe customer identifier'
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sanitizedCustomerId,
      return_url: `${req.protocol}://${req.get('host')}/dashboard`
    });

    res.json({
      success: true,
      url: session.url
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({
      success: false,
      error: 'PORTAL_ERROR',
      message: 'Failed to create portal session. Please try again later.'
    });
  }
});

/**
 * Webhook handler for Stripe events
 * Note: Raw body middleware is applied at app level before this route
 */
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle specific events
  switch (event.type) {
  case 'customer.subscription.created':
    console.log('New subscription created:', event.data.object.id);
    // TODO: Store subscription data in database
    // TODO: Send welcome email with API credentials
    break;

  case 'customer.subscription.updated':
    console.log('Subscription updated:', event.data.object.id);
    // TODO: Update subscription status in database
    break;

  case 'customer.subscription.deleted':
    console.log('Subscription cancelled:', event.data.object.id);
    // TODO: Revoke API access
    // TODO: Send cancellation confirmation email
    break;

  case 'invoice.payment_succeeded':
    console.log('Payment succeeded:', event.data.object.id);
    // TODO: Extend subscription period
    break;

  case 'invoice.payment_failed':
    console.log('Payment failed:', event.data.object.id);
    // TODO: Send payment failure notification
    // TODO: Suspend access if multiple failures
    break;

  default:
    console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * Get subscription status
 */
router.get('/subscription-status', async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'USER_ID_REQUIRED'
      });
    }

    const isActive = await verifySubscription(userId);

    res.json({
      success: true,
      subscriptionActive: isActive,
      botName: 'SmartContractAudit',
      price: '$4/month'
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({
      success: false,
      error: 'STATUS_CHECK_ERROR',
      message: 'Failed to check subscription status. Please try again later.'
    });
  }
});

module.exports = {
  router,
  verifySubscription,
  requireActiveSubscription
};
