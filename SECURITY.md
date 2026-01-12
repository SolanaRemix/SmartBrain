# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The SmartBrain team takes security seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:

**security@smartbrain.dev**

Include the following information:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- We will acknowledge your email within 48 hours
- We will provide a detailed response within 7 days
- We will work with you to understand and validate the issue
- We will develop and test a fix
- We will publicly disclose the issue after a fix is released

### Bug Bounty

We do not currently have a bug bounty program. However, we deeply appreciate security researchers who report vulnerabilities responsibly.

## Security Best Practices

### For ML Models

1. **Model Integrity**
   - Always validate model checksums before loading
   - Use the provided `validate-model.sh` script
   - Never load models from untrusted sources

2. **Data Sanitization**
   - Sanitize all input data before inference
   - Validate data against schemas
   - Use the dataset validation scripts

3. **Access Control**
   - Restrict access to model files and metadata
   - Use environment variables for sensitive configuration
   - Never commit API keys or secrets to the repository

4. **Dependency Management**
   - Keep dependencies up to date
   - Review Dependabot alerts regularly
   - Use `npm audit` to check for vulnerabilities

### For Development

1. **Environment Variables**
   - Never commit `.env` files
   - Use `.env.example` as a template
   - Rotate API keys regularly

2. **Code Review**
   - All changes require code review
   - Run security scans before merging
   - Use GitHub Advanced Security features

3. **Secrets Management**
   - Use GitHub Secrets for CI/CD
   - Never hardcode credentials
   - Use secret scanning tools

### For Deployment

1. **Network Security**
   - Use HTTPS for all API endpoints
   - Implement rate limiting
   - Use firewall rules appropriately

2. **Authentication & Authorization**
   - Implement proper authentication
   - Use JWT tokens with expiration
   - Validate all user inputs

3. **Monitoring**
   - Enable security monitoring
   - Set up alerts for suspicious activity
   - Regularly review audit logs

## Security Features

SmartBrain implements several security features:

- **CodeQL Analysis**: Automated security scanning on every PR
- **Dependency Review**: Automatic review of new dependencies
- **Secret Scanning**: Detection of accidentally committed secrets
- **Model Validation**: Validation of ML model integrity
- **Input Sanitization**: Validation of inference inputs

## Vulnerability Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new security versions as soon as possible

## Security Updates

Security updates will be released as patch versions (e.g., 1.0.1, 1.0.2).

Subscribe to release notifications on GitHub to stay informed about security updates.

## Compliance

SmartBrain follows security best practices aligned with:

- OWASP Top 10
- CWE/SANS Top 25
- NIST Cybersecurity Framework

## Contact

For security concerns, please use one of the following methods:
- Open a [Security Advisory](https://github.com/SolanaRemix/SmartBrain/security/advisories/new) (preferred)
- Email: security@smartbrain.dev (if configured)

For general support: [GitHub Issues](https://github.com/SolanaRemix/SmartBrain/issues)

## Acknowledgments

We thank the security research community for their valuable contributions to making SmartBrain more secure.
