# SmartBrain Troubleshooting Guide

This guide covers common issues and how to resolve them when working with the SmartBrain platform.

---

## Table of Contents

1. [Installation Issues](#1-installation-issues)
2. [Environment Variable Configuration](#2-environment-variable-configuration)
3. [Build and CI Failures](#3-build-and-ci-failures)
4. [Bot Subscription and Payment Issues](#4-bot-subscription-and-payment-issues)
5. [Multi-Chain Deployment Errors](#5-multi-chain-deployment-errors)
6. [Model Training and Inference Errors](#6-model-training-and-inference-errors)
7. [Dataset Validation Failures](#7-dataset-validation-failures)
8. [Network Connectivity Issues](#8-network-connectivity-issues)
9. [Permission and Access Control Problems](#9-permission-and-access-control-problems)
10. [Quick-Fix Command Reference](#10-quick-fix-command-reference)

---

## 1. Installation Issues

### Node.js Version Mismatches

**Symptom:** `Error: The engine "node" is incompatible with this module` or unexpected syntax errors during `npm install`.

**Cause:** SmartBrain requires Node.js **v16 or higher**.

**Fix:**
```bash
# Check your current Node.js version
node --version

# If below v16, install via nvm (recommended)
nvm install 20
nvm use 20

# Or download from https://nodejs.org
```

---

### npm Errors During Install

**Symptom:** `npm ERR! peer dep missing` or `npm ERR! ERESOLVE`.

**Fix:**
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# If peer dependency conflicts persist, use legacy resolution
npm install --legacy-peer-deps
```

---

### Missing Dependencies

**Symptom:** `Cannot find module 'express'` or similar at runtime.

**Fix:**
```bash
npm install
```

If specific packages are missing after install, reinstall them explicitly:
```bash
npm install express stripe dotenv body-parser axios
```

---

## 2. Environment Variable Configuration

### Stripe Keys Not Set

**Symptom:** `Error: Stripe API key not configured` or `401 Unauthorized` from Stripe.

**Fix:**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Stripe keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Note:** Use `sk_test_...` and `pk_test_...` keys for development.

---

### GitHub Token Not Set

**Symptom:** `Error: Bad credentials` or `401` when calling GitHub API.

**Fix:**
```bash
export GITHUB_TOKEN="ghp_your_token_here"
# Or add to .env:
GITHUB_TOKEN=ghp_your_token_here
```

Required token scopes:
- `repo` (full control of private repositories)
- `admin:repo_hook` (webhook management)
- `workflow` (update GitHub Actions)

---

### RPC URL Configuration Problems

**Symptom:** `Error: Invalid JSON-RPC response` or connection timeouts on blockchain calls.

**Fix:**
```bash
# Ethereum
INFURA_KEY=your_infura_project_id
# or
ALCHEMY_KEY=your_alchemy_api_key

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# For devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
```

---

### .env File Not Loaded

**Symptom:** Environment variables are undefined even though `.env` exists.

**Fix:** Ensure your entry point calls `require('dotenv').config()` at the very top:
```javascript
require('dotenv').config();
// ... rest of the file
```

---

## 3. Build and CI Failures

### ESLint Errors

**Symptom:** `npm run lint` fails with rule violations.

**Diagnostic:**
```bash
npm run lint
```

**Common fixes:**

| Error | Fix |
|-------|-----|
| `Expected indentation of 2 spaces` | Use 2-space indentation |
| `Strings must use singlequote` | Replace `"..."` with `'...'` |
| `Missing semicolon` | Add `;` at end of statements |
| `Unexpected var, use let/const` | Replace `var` with `const` or `let` |

**Auto-fix:**
```bash
npm run lint:fix
```

---

### Prettier Formatting Failures

**Symptom:** CI fails with `Formatting issues found`.

**Fix:**
```bash
npm run format
```

---

### Test Failures in CI

**Symptom:** CI pipeline fails at the `Run tests` step.

**Diagnostic:**
```bash
npm test
```

**Common causes:**
- Missing test dependencies
- Hardcoded file paths that differ between environments
- Time-sensitive tests that are flaky

---

### Workflow Step Failures

**Symptom:** GitHub Actions workflow fails with `Process completed with exit code 1`.

**Steps to diagnose:**
1. Click on the failed workflow run in the Actions tab
2. Expand the failed step to see full output
3. Check for environment-specific issues (missing secrets, wrong Node version)

**Common fixes:**
- Ensure all required secrets are set in GitHub repository settings
- Verify the workflow is using a supported Node.js version (16, 18, or 20)

---

## 4. Bot Subscription and Payment Issues

### Subscription Not Active

**Symptom:** Bot returns `403 Forbidden: Active subscription required`.

**Fix:**
1. Verify your Stripe subscription is active in the [Stripe Dashboard](https://dashboard.stripe.com)
2. Ensure the webhook endpoint is configured and receiving events
3. Check that `customer.subscription.created` event was processed

---

### Webhook Signature Validation Failure

**Symptom:** `Error: No signatures found matching the expected signature for payload`.

**Fix:**
```bash
# Verify the webhook secret matches what's in Stripe Dashboard
# Developers → Webhooks → Your endpoint → Signing secret
STRIPE_WEBHOOK_SECRET=whsec_correct_secret_here
```

**Important:** The webhook route must receive the raw request body (before JSON parsing):
```javascript
app.use('/webhook', express.raw({ type: 'application/json' }), webhookHandler);
```

---

### Payment Processing Errors

**Symptom:** `StripeCardError` or `StripeInvalidRequestError`.

**Fix:**
- In test mode, use Stripe test cards (e.g., `4242 4242 4242 4242`)
- Verify the Price ID in `.env` matches the one in your Stripe Dashboard
- Check that your Stripe account is fully activated for live payments

---

## 5. Multi-Chain Deployment Errors

### Ethereum Deployment Failures

**Symptom:** `Error: insufficient funds for gas * price + value` or `nonce too low`.

**Fix:**
```bash
# Check wallet balance
# Ensure PRIVATE_KEY is set correctly (without 0x prefix for some tools)
PRIVATE_KEY=your_private_key_without_0x_prefix

# For Sepolia testnet, get test ETH from a faucet:
# https://sepoliafaucet.com
```

---

### Solana Deployment Failures

**Symptom:** `Error: failed to send transaction: Transaction simulation failed`.

**Fix:**
```bash
# Switch to devnet for testing
SOLANA_RPC_URL=https://api.devnet.solana.com

# Get test SOL
solana airdrop 2

# Check program size (BPF programs have size limits)
ls -la target/deploy/*.so
```

---

### Polygon / L2 Issues

**Symptom:** Transaction stuck or `replacement fee too low`.

**Fix:**
```bash
# Use a reliable Polygon RPC
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your_key

# For zkEVM
POLYGON_ZKEVM_RPC_URL=https://zkevm-rpc.com
```

---

## 6. Model Training and Inference Errors

### Training Configuration Not Found

**Symptom:** `Error: Configuration file not found`.

**Fix:**
```bash
# Generate a default config
node training/cli/index.js config --output training/configs/my-model.json
```

---

### Out of Memory During Training

**Symptom:** `FATAL ERROR: Reached heap limit` or process killed.

**Fix:**
```bash
# Increase Node.js heap size
NODE_OPTIONS="--max-old-space-size=4096" node training/cli/index.js train ...

# Reduce batch size in your training config
```

---

### Inference Model Not Found

**Symptom:** `Error: Model directory does not exist`.

**Fix:**
```bash
# List available models
ls models/

# Validate model metadata
./scripts/validate-model.sh models/your-model
```

---

## 7. Dataset Validation Failures

### Schema Validation Error

**Symptom:** `ValidationError: data/metadata must have required property 'name'`.

**Fix:** Ensure your dataset JSON includes required metadata fields:
```json
{
  "metadata": {
    "name": "my-dataset",
    "version": "1.0.0",
    "description": "...",
    "size": 1000,
    "split": { "train": 0.7, "validation": 0.15, "test": 0.15 }
  },
  "data": []
}
```

---

### Dataset Size Mismatch

**Symptom:** `Warning: Declared size (1000) does not match actual record count (950)`.

**Fix:**
```bash
# Validate dataset with verbose output
node datasets/validation/validate.js --dataset data/my-dataset.json --verbose
```

---

## 8. Network Connectivity Issues

### API Rate Limiting

**Symptom:** `429 Too Many Requests` from GitHub or blockchain RPC providers.

**Fix:**
- Add exponential backoff to API calls
- Use a paid tier for higher rate limits
- Cache responses where appropriate

---

### Proxy / Firewall Blocking Requests

**Symptom:** `ECONNREFUSED` or `ETIMEDOUT`.

**Fix:**
```bash
# Set proxy environment variables if behind a corporate proxy
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
export NO_PROXY=localhost,127.0.0.1
```

---

## 9. Permission and Access Control Problems

### Script Not Executable

**Symptom:** `Permission denied` when running `./scripts/bootstrap.sh`.

**Fix:**
```bash
chmod +x scripts/bootstrap.sh scripts/audit.sh scripts/validate-model.sh sync_deploy.sh
```

---

### GitHub Actions Permission Denied

**Symptom:** `Error: Resource not accessible by integration` in CI.

**Fix:** Add the required permissions to your workflow:
```yaml
permissions:
  contents: read
  pull-requests: write
```

---

### Repository Access Denied

**Symptom:** `HttpError: Not Found` when accessing a private repository.

**Fix:** Verify your GitHub token has `repo` scope and is not expired.

---

## 10. Quick-Fix Command Reference

| Problem | Command |
|---------|---------|
| Fix all lint errors (auto) | `npm run lint:fix` |
| Fix formatting | `npm run format` |
| Reinstall dependencies | `rm -rf node_modules && npm install` |
| Validate all models | `npm run validate:models` |
| Check system status | `node src/orval-db/index.js --status` |
| Scan documentation | `npm run docs:scan` |
| Run smart contract analysis | `npm run smart:analyze` |
| Bootstrap infrastructure | `./scripts/bootstrap.sh` |
| Run security audit | `./scripts/audit.sh` |

---

## Getting Help

If none of the above resolves your issue:

- **GitHub Issues**: [Open an issue](https://github.com/SolanaRemix/SmartBrain/issues)
- **GitHub Discussions**: [Ask the community](https://github.com/SolanaRemix/SmartBrain/discussions)
- **Security Issues**: Email `security@smartbrain.dev` (do not open public issues)

---

*See also: [FAQ](FAQ.md) | [Complete Documentation](index.md)*
