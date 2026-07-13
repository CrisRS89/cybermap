# Security Policy

CyberMap is a cybersecurity project, so responsible reporting matters.

## Supported Versions

| Version | Supported |
|---|---:|
| 0.1.x | ✅ |
| < 0.1.0 | ❌ |

## Reporting a Vulnerability

Do not open public GitHub Issues for security vulnerabilities.

Please report privately with:

- A clear description of the issue
- Steps to reproduce
- Affected version or commit
- Potential impact
- Suggested remediation, if available

Until a dedicated security contact is configured for the repository, use GitHub private vulnerability reporting if enabled. If it is not enabled, open a non-sensitive GitHub Discussion asking for the security contact without disclosing technical details.

## Handling Expectations

- Initial acknowledgement target: 48 hours
- Triage target: 7 days
- Fix timeline depends on severity and exploitability

## Security Scope

In scope:

- Secret leakage
- Authentication or authorization bypass once auth is implemented
- Unsafe command execution
- Server-side request forgery
- Arbitrary file read/write
- Unsafe parsing of imported scan data

Out of scope:

- Vulnerabilities in unsupported dependency versions
- Denial of service requiring local machine access
- Findings that require modifying local source code before execution

## Current Security Notes

- CyberMap is currently local-first and intended for trusted local environments.
- Do not store real API keys or credentials in the repository.
- Do not expose the local API directly to the internet without additional hardening.
