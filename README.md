# SmartBrain Bots

Stripe-powered plugin bots for smart contract deployment and auditing on blockchain platforms.

## 🤖 Available Bots

### 1. @SmartContractDeploy Bot
**Price:** $9/month subscription

A powerful bot that automates smart contract deployment across multiple blockchain platforms with built-in best practices and security checks.

[→ Full Documentation](./bots/SmartContractDeploy/README.md)

### 2. @SmartContractAudit Bot
**Price:** $4/month subscription

An automated smart contract auditing bot that performs security analysis, gas optimization recommendations, and vulnerability detection.

[→ Full Documentation](./bots/SmartContractAudit/README.md)

## 🚀 Quick Start

### Prerequisites

- Node.js v16 or higher
- npm v8 or higher
- A Stripe account ([Sign up here](https://dashboard.stripe.com/register))
- GitHub account for bot integration

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SolanaRemix/SmartBrain.git
   cd SmartBrain
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Stripe API keys and other configuration values.

4. **Set up Stripe products:**
   - Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
   - Create two subscription products:
     - SmartContractDeploy: $9/month
     - SmartContractAudit: $4/month
   - Copy the Price IDs and update your `.env` file

5. **Configure webhooks:**
   - In Stripe Dashboard, go to Developers → Webhooks
   - Add endpoint URL: `https://your-domain.com/webhook`
   - Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
   - Copy the webhook signing secret to `.env`

### Running the Bots

**Start all bots:**
```bash
npm start
```

**Run specific bot:**
```bash
npm run deploy-bot    # SmartContractDeploy bot
npm run audit-bot      # SmartContractAudit bot
```

**Development mode with auto-reload:**
```bash
npm run dev
```

## 📋 Environment Variables

See [.env.example](./.env.example) for all required environment variables.

Key variables:
- `STRIPE_SECRET_KEY` - Your Stripe secret API key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable API key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret from Stripe
- `SMARTCONTRACT_DEPLOY_PRICE_ID` - Stripe Price ID for Deploy bot
- `SMARTCONTRACT_AUDIT_PRICE_ID` - Stripe Price ID for Audit bot

## 🔒 Security

Both bots implement robust security measures:

- **Payment Verification:** All bot actions verify active Stripe subscriptions before execution
- **Webhook Signature Validation:** All Stripe webhooks are validated using signing secrets
- **Environment Variable Security:** Sensitive data stored in environment variables, never in code
- **API Key Rotation:** Support for regular API key rotation without downtime
- **Rate Limiting:** Built-in rate limiting to prevent abuse
- **Audit Logging:** All bot actions are logged for security auditing

## 📖 Documentation

- [SmartContractDeploy Bot Documentation](./bots/SmartContractDeploy/README.md)
- [SmartContractAudit Bot Documentation](./bots/SmartContractAudit/README.md)
- [API Reference](./docs/API.md) (coming soon)
- [Webhook Integration Guide](./docs/WEBHOOKS.md) (coming soon)

## 🛠️ Bot Architecture

Each bot is isolated in its own directory under `/bots/`:

```
SmartBrain/
├── bots/
│   ├── SmartContractDeploy/
│   │   ├── index.js           # Bot implementation
│   │   ├── README.md          # Bot-specific docs
│   │   ├── routes.js          # API routes
│   │   ├── payment.js         # Stripe integration
│   │   └── examples/          # Usage examples
│   └── SmartContractAudit/
│       ├── index.js           # Bot implementation
│       ├── README.md          # Bot-specific docs
│       ├── routes.js          # API routes
│       ├── payment.js         # Stripe integration
│       └── examples/          # Usage examples
├── .env.example               # Environment template
├── package.json               # Dependencies
└── README.md                  # This file
```

## 💳 Subscription Management

### How to Subscribe

1. Visit the subscription page for your desired bot
2. Enter your payment information (powered by Stripe)
3. Complete the subscription checkout
4. Receive your API credentials via email
5. Start using the bot immediately

### Managing Your Subscription

- **View Subscription:** Check status in your Stripe customer portal
- **Update Payment Method:** Update cards directly through Stripe
- **Cancel Subscription:** Cancel anytime, no questions asked
- **Upgrade/Downgrade:** Switch between plans seamlessly

### Payment Methods Accepted

- Credit Cards (Visa, Mastercard, American Express, Discover)
- Debit Cards
- Additional methods via Stripe (varies by region)

## 🔗 Integration Examples

### REST API Integration
```javascript
const axios = require('axios');

// Deploy a smart contract
const response = await axios.post('http://localhost:3000/api/deploy', {
  userId: 'user_123',
  contract: contractCode,
  network: 'ethereum-mainnet'
}, {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
```

### GitHub Bot Integration
Comment `@SmartContractDeploy` or `@SmartContractAudit` on a pull request to trigger bot actions.

## 🧪 Testing

```bash
npm test
```

## 📜 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

- **Email:** support@smartbrain.io
- **Documentation:** [https://docs.smartbrain.io](https://docs.smartbrain.io)
- **Issues:** [GitHub Issues](https://github.com/SolanaRemix/SmartBrain/issues)

## ⚠️ Important Notes

- Both bots require active paid subscriptions to function
- Payment verification happens on every bot action request
- Subscriptions are managed entirely through Stripe
- No refunds for partial months (Stripe standard policy)
- Free trial available for 14 days (configure in Stripe)
