# SmartBrain FAQ

Frequently asked questions about the SmartBrain platform.

---

## Table of Contents

- [General](#general)
- [Installation & Setup](#installation--setup)
- [Smart Functions](#smart-functions)
- [Orval DB](#orval-db)
- [Documentation Engine](#documentation-engine)
- [Bots & Subscriptions](#bots--subscriptions)
- [Multi-Chain Support](#multi-chain-support)
- [CI/CD & Workflows](#cicd--workflows)
- [Security](#security)

---

## General

### What is SmartBrain?

SmartBrain is an AI/ML engine and automation platform for smart contract development. It combines model training, inference, automated auditing, multi-chain deployment, and an AI brain memory system (Orval DB) into one cohesive platform.

---

### What blockchains does SmartBrain support?

SmartBrain supports: Ethereum (Mainnet, Sepolia, Goerli), Polygon (PoS, zkEVM), Solana (Mainnet-beta, Devnet, Testnet), Binance Smart Chain, Avalanche (C-Chain), Arbitrum, Optimism, Base, and Cosmos SDK chains (Beta).

---

### Is SmartBrain open source?

Yes. SmartBrain is licensed under the [Apache License 2.0](../LICENSE).

---

### What Node.js version is required?

Node.js **v16 or higher** is required. Node.js v20 is recommended for best compatibility.

---

## Installation & Setup

### How do I install SmartBrain?

```bash
git clone https://github.com/SolanaRemix/SmartBrain.git
cd SmartBrain
npm install
cp .env.example .env
# Edit .env with your configuration
./scripts/bootstrap.sh
```

---

### What environment variables are required?

The minimum required variables are:
- `STRIPE_SECRET_KEY` — Stripe secret API key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret

Optional but recommended:
- `GITHUB_TOKEN` — For GitHub API access
- `INFURA_KEY` or `ALCHEMY_KEY` — For Ethereum deployments
- `SOLANA_RPC_URL` — For Solana deployments

See `.env.example` for the full list.

---

### How do I run the bootstrap script?

```bash
chmod +x scripts/bootstrap.sh
./scripts/bootstrap.sh
```

---

## Smart Functions

### What are Smart Functions?

Smart Functions are AI helper modules (`src/smart-functions/`) that provide:
- **AutoAnalyzer** — Analyzes smart contracts for patterns and complexity
- **AutoFixer** — Suggests and applies automated fixes
- **AutoTestGenerator** — Generates test scaffolding from ABIs
- **AutoSync** — Syncs configs and documentation across the ecosystem
- **SmartSuggest** — AI-powered contextual code recommendations

---

### How do I run the smart contract analyzer?

```bash
npm run smart:analyze
```

Or use it programmatically:
```javascript
const { AutoAnalyzer } = require('./src/smart-functions');
const analyzer = new AutoAnalyzer();
const result = analyzer.analyze(contractSourceCode, 'MyContract');
console.log(result);
```

---

### How do I generate tests for a smart contract?

```javascript
const { AutoTestGenerator } = require('./src/smart-functions');
const generator = new AutoTestGenerator({ framework: 'jest' });
const result = generator.generateTests(abi, 'MyContract');
console.log(result.data.testCode);
```

---

## Orval DB

### What is Orval DB?

Orval DB is a virtual in-memory database system (`src/orval-db/`) that powers SmartBrain's AI memory. It stores learned patterns from contract analysis, maintains a knowledge graph, tracks audit history, and supports snapshot/restore persistence.

---

### How do I check the Orval DB status?

```bash
npm run brain:status
```

---

### Does Orval DB persist data between restarts?

By default, Orval DB is in-memory only. Use the `Persistence` class to save and load state:
```javascript
const { createOrvalDb } = require('./src/orval-db');
const { brain, persistence } = createOrvalDb({
  persistence: { filePath: './orval-db.json', autoSaveIntervalMs: 60000 }
});
// Load on startup
const loaded = persistence.load();
if (loaded.data) brain.restore(loaded.data);
// Save on shutdown
persistence.save(brain.snapshot());
```

---

### What is memory decay?

Memory decay is an optional TTL (time-to-live) setting that automatically expires old memories. Set `memoryDecayMs` when creating a `VirtualBrain`:
```javascript
const brain = new VirtualBrain({ memoryDecayMs: 86400000 }); // 24 hours
```

---

## Documentation Engine

### What is the Documentation Engine?

The docs engine (`src/docs-engine/auto-updater.js`) automatically scans the codebase for JSDoc comments and documentation files, then reports freshness scores to help keep documentation up to date.

---

### How do I scan documentation freshness?

```bash
npm run docs:scan
```

---

### How do I configure the docs engine?

Create a `docs-engine.config.json` at the project root:
```json
{
  "includeDirs": ["src", "bots", "docs"],
  "docExtensions": [".md"],
  "codeExtensions": [".js"],
  "stalenessThresholdDays": 30
}
```

See [SELF_UPDATING_DOCS.md](SELF_UPDATING_DOCS.md) for full configuration options.

---

## Bots & Subscriptions

### What bots are available?

1. **@SmartContractDeploy** ($9/month) — Multi-chain smart contract deployment
2. **@SmartContractAudit** ($4/month) — Automated security auditing

---

### How do I subscribe to a bot?

1. Set up your Stripe account and create subscription products
2. Configure `.env` with your Stripe keys and Price IDs
3. Start the bots with `npm start` or `npm run deploy-bot` / `npm run audit-bot`
4. Use the bot's subscription endpoint to create customer subscriptions

---

### Can I cancel my subscription?

Yes, subscriptions can be cancelled at any time through the Stripe customer portal. Access is revoked at the end of the billing period.

---

### Is there a free trial?

Yes — configure a 14-day free trial in your Stripe Dashboard when setting up the subscription products.

---

## Multi-Chain Support

### How do I deploy to Solana?

```bash
# Set the RPC URL
SOLANA_RPC_URL=https://api.devnet.solana.com

# Deploy using the deploy bot or sync script
./sync_deploy.sh deploy-bot "@SmartContractDeploy" "deploy"
```

---

### How do I verify contracts on Etherscan?

Set the `ETHERSCAN_API_KEY` environment variable and use the deploy bot's verification feature. The bot will automatically submit source code for verification after deployment.

---

## CI/CD & Workflows

### Which GitHub Actions workflows are included?

- **CI** (`ci.yml`) — Runs tests on Node.js 16, 18, and 20
- **Lint** (`lint.yml`) — Runs ESLint and Prettier checks
- **CodeQL** (`codeql.yml`) — Security analysis
- **Model Validate** (`model-validate.yml`) — Validates model metadata
- **Release** (`release.yml`) — Semantic release automation

---

### Why is my lint CI failing?

Run `npm run lint` locally to see the errors, then fix them manually or with `npm run lint:fix`. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md#3-build-and-ci-failures) for details.

---

### How do I add repository secrets for CI?

Go to **GitHub Repository → Settings → Secrets and variables → Actions** and add:
- `CODECOV_TOKEN` — For coverage reporting (optional)
- `STRIPE_SECRET_KEY` — If running integration tests
- Any other secrets referenced in workflows

---

## Security

### How do I report a security vulnerability?

Email **security@smartbrain.dev** directly. Do **not** open a public GitHub issue for security vulnerabilities. See [SECURITY.md](../SECURITY.md) for our full security policy.

---

### Is my Stripe API key stored securely?

Yes. API keys are stored only in environment variables and never committed to source control. Use `.env` locally and GitHub Secrets for CI/CD.

---

### Does SmartBrain scan for private key leaks?

Yes. The `@SmartBrain` automation bot includes a private key leak scanner that flags accidental exposure of wallet credentials in code.

---

*See also: [Troubleshooting Guide](TROUBLESHOOTING.md) | [Complete Documentation](index.md)*
