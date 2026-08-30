# Knissa Blueprint

> **Version:** 1.1
> **Status:** Active
> **Last Updated:** August 2026

---

# Table of Contents

1. Vision
2. Mission
3. Product Philosophy
4. Core Principles
5. Long-Term Goals
6. Target Markets
7. Supported Currencies
8. Core Products
9. Technical Architecture
10. Architecture Layers
11. Main Modules
12. Domain Boundaries
13. Financial Domain
14. Event Flow
15. API Principles
16. Security Principles
17. Compliance
18. Observability
19. Non-Functional Requirements
20. Future Integrations
21. Project Structure
22. Development Principles
23. Engineering Principles
24. Deployment Strategy
25. Roadmap
26. Vision Statement

---

# 1. Vision

Knissa is a financial infrastructure platform designed to power digital accounts, multi-currency wallets, payments, currency exchange, merchant services, notifications and future banking integrations.

The platform is built around an immutable ledger architecture, ensuring financial integrity, auditability and long-term scalability.

Knissa is designed from day one to support millions of users through secure, maintainable and modular software engineering.

---

# 2. Mission

Provide accessible, secure and innovative financial services that connect individuals, businesses and financial institutions through a single digital platform.

---

# 3. Product Philosophy

Knissa is designed as a financial platform rather than a collection of isolated features.

Every new capability must integrate naturally into the platform ecosystem while preserving consistency, security and financial integrity.

Long-term maintainability always takes priority over short-term convenience.

The backend is developed as a modular monolith, allowing business domains to evolve independently while maintaining a simple deployment model.

---

# 4. Core Principles

Every decision in Knissa must follow these principles:

- Security by Design
- Financial Integrity
- Scalability
- Transparency
- Auditability
- Reliability
- High Availability
- Performance
- Compliance First
- Simplicity
- Clean Architecture
- Separation of Concerns
- Backward Compatibility

---

# 5. Long-Term Goals

- Digital Accounts
- Multi-Currency Wallets
- International Transfers
- Money Exchange
- PIX Integration
- Open Finance
- QR Code Payments
- Merchant Accounts
- Business Accounts
- Payment Gateway
- Banking Integrations
- Public API
- API Key Platform
- Mobile Applications
- Administrative Dashboard
- Financial Analytics
- AI Financial Assistant
- Virtual and Physical Cards

---

# 6. Target Markets

## Phase 1

- Haiti

## Phase 2

- Brazil

## Phase 3

- Canada
- United States

## Phase 4

- Caribbean
- Latin America

## Phase 5

Global Expansion

---

# 7. Supported Currencies

| Currency | Code |
| --- | --- |
| Haitian Gourde | HTG |
| Brazilian Real | BRL |
| US Dollar | USD |
| Euro | EUR |
| Canadian Dollar | CAD |

The platform architecture must support adding new currencies without requiring application code changes.

---

# 8. Core Products

## Digital Accounts

Current capabilities include:

- User Registration
- Authentication
- Email Verification
- User Profiles
- Accounts
- Account Configuration
- Session Management
- Password Management

Future capabilities:

- Advanced Identity Verification
- Business Accounts
- Advanced KYC

---

## Wallet

Current architecture supports:

- Multi-Currency Wallets
- Account-Based Wallets
- Wallet Retrieval
- Wallet Details
- Balance Management
- Financial Transaction Integration

Future capabilities:

- Statements
- Reserved Balance
- Advanced Wallet Analytics

---

## Transactions

Current capabilities include:

- Transaction History
- Transaction Details
- Internal Transfers
- Administrative Test Deposits
- Financial Traceability

The transaction domain integrates with wallets and the financial ledger.

---

## Payments

Current capabilities include:

- Payment Creation
- Payment History
- Payment Details
- Payment Refunds
- Merchant Payment Architecture

Future capabilities:

- Bank Payment Integrations
- QR Payments
- PIX
- Advanced Payment Processing

---

## Payment Links

Current capabilities include:

- Payment Link Creation
- Payment Link Listing
- Payment Link Retrieval
- Payment Link Cancellation
- Payment Link Payment

Payment Links provide a foundation for merchant and external payment workflows.

---

## Money Exchange

Current capabilities include:

- Exchange Quotes
- Quote Acceptance
- Currency Conversion
- Exchange History
- Exchange Rates
- Exchange Rate Management
- Exchange Rate Expiration

Future capabilities:

- Advanced Exchange Fees
- External Liquidity Providers
- International Settlement

---

## Merchant Platform

Current capabilities include:

- Merchant Accounts
- Merchant Profile
- Merchant Settings
- Merchant Members
- Member Activation
- Member Deactivation
- Member Role Management
- Merchant Ownership Transfer

Supported merchant roles include:

- OWNER
- ADMIN
- MANAGER

Future capabilities:

- Merchant Dashboard
- QR Payments
- POS Integration
- Tap to Pay
- Advanced Merchant Analytics

---

## Notifications

Current capabilities include:

- In-App Notifications
- Notification History
- Notification Details
- Unread Notification Count
- Mark Notification as Read
- Notification Types
- Notification Channels
- Notification Priorities

Current API channel architecture includes:

- IN_APP

The notification architecture is designed to support additional providers and channels including:

- Email
- SMS
- Push Notifications
- WhatsApp

Notifications can be associated with financial and platform events.

---

## API Platform

API Keys provide the foundation for future external integrations and public API access.

Current capabilities include:

- API Key Creation
- API Key Listing
- API Key Retrieval
- API Key Revocation
- API Key Deletion
- API Key Prefixes
- API Key Hash Storage
- Environment Classification
- Scope Architecture

API keys follow a lifecycle model:

```text
Created
   ↓
Active
   ↓
Revoked
   ↓
Deleted
```

Raw API key secrets are returned during creation and are not intended to be stored as plaintext.

---

## Compliance

Current compliance foundation includes:

- Compliance Profiles
- Compliance Documents
- Compliance Document Retrieval
- Compliance Reviews
- Administrative Review Authorization

Future capabilities include:

- Advanced KYC
- AML Automation
- Fraud Detection
- Risk Analysis
- Customer Verification
- Transaction Monitoring

---

## Administration

The platform architecture provides foundations for:

- User Management
- Role-Based Authorization
- Exchange Rate Management
- Compliance Reviews
- Administrative Operations

Future capabilities include:

- Administrative Dashboard
- Audit Dashboard
- Operational Monitoring
- Reports
- Financial Analytics

---

# 9. Technical Architecture

## Architecture Style

Knissa uses a **Modular Monolith Architecture**.

Each business capability is isolated into its own module while sharing common infrastructure and platform services.

Future migration to Microservices will be considered only when justified by:

- Business growth
- Operational requirements
- Scaling requirements
- Domain independence
- Infrastructure maturity

Microservices are not a requirement of the current architecture.

---

## Technology Stack

### Backend

- Node.js
- TypeScript
- Express

### Database

- PostgreSQL

### ORM

- Prisma

### Cache

- Redis

### Authentication

- JWT
- Refresh Tokens
- Multi-Factor Authentication

### Validation

- Zod

### Password Hashing

- Argon2

### Infrastructure

- Docker

### Testing

- Vitest
- Supertest

### Logging

- Pino

---

# 10. Architecture Layers

```text
Clients
   │
   ▼
REST API
   │
   ▼
Routes
   │
   ▼
Controllers
   │
   ▼
Services
   │
   ▼
Repositories
   │
   ├──────────────► PostgreSQL
   │
   └──────────────► Redis
```

Business rules must remain inside Services.

Controllers are responsible for HTTP concerns.

Repositories are responsible for persistence.

Routes define the HTTP API contract.

Shared middleware handles cross-cutting concerns such as:

- Authentication
- Authorization
- Error handling
- Request processing

---

# 11. Main Modules

## Current Backend Modules

```text
Authentication
Users
Profiles
Accounts
Wallets
Transactions
Recipients
Payments
Payment Links
Exchange
Exchange Rates
Merchants
Notifications
API Keys
Compliance
```

## Financial Architecture Domains

```text
Identity
Localization
Accounts
Wallets
Ledger
Transactions
Payments
Exchange
Recipients
Merchant
Notifications
Compliance
```

## Future Modules

```text
Cards
Administration
Audit
Open Finance
Banking Integrations
```

The distinction between current modules and future domains is intentional.

The Blueprint describes both the current backend implementation and the long-term platform architecture.

---

# 12. Domain Boundaries

```text
Identity
   ↓
Accounts
   ↓
Wallets
   ↓
Ledger
   ↓
Transactions
   ↓
Payments
   ↓
Exchange
   ↓
Merchant
   ↓
Notifications
   ↓
Compliance
   ↓
API Platform
```

Every module owns its own business rules.

Cross-module communication must remain explicit and controlled.

Modules must not directly manipulate another module's persistence layer.

---

# 13. Financial Domain

```text
Country
   ↓
Currency
   ↓
ExchangeRate
   ↓
User
   ↓
Account
   ↓
Wallet
   ↓
LedgerEntry
   ↓
Transaction
   ↓
Exchange
   ↓
Payment
   ↓
Fee
   ↓
Notification
   ↓
AuditLog
```

## Financial Rules

- Ledger entries are immutable.
- Every financial operation must be traceable.
- Financial operations should generate the appropriate ledger records.
- Wallet balances are derived from financial records according to the ledger architecture.
- Financial history must remain auditable.
- Financial records must not be physically deleted when regulatory or accounting retention requires preservation.

---

# 14. Event Flow

## Example: Internal Transfer

```text
Transfer Request
      ↓
Authentication
      ↓
Authorization
      ↓
Validation
      ↓
Wallet Service
      ↓
Ledger Entry
      ↓
Transaction
      ↓
Notification
      ↓
Audit Log
```

The same architectural approach applies to:

- Deposits
- Withdrawals
- Payments
- Currency Exchange
- Merchant Payments

Financial events must maintain traceability across the affected domains.

---

# 15. API Principles

The API follows these principles:

- RESTful
- Stateless
- JSON-based
- Contract-oriented
- OpenAPI documented
- Predictable Error Responses
- Resource-oriented URLs
- Authentication-aware
- Role-aware
- Account-scoped access
- Backward Compatibility

Future capabilities:

- API Versioning
- Idempotency Support
- Webhooks
- Public API
- Developer Portal

---

# 16. Security Principles

Knissa follows a Security First approach.

Security includes:

- Password Hashing
- JWT Authentication
- Refresh Tokens
- Multi-Factor Authentication
- MFA Enrollment
- MFA Verification
- MFA Login Verification
- Session Management
- Session Revocation
- Role-Based Access Control
- Ownership Checks
- Input Validation
- Rate Limiting
- Secure Headers
- HTTPS in production
- API Key Hashing
- Account-Scoped Resource Access
- Compliance Controls

Sensitive credentials and secrets must never be stored in plaintext.

---

# 17. Compliance

## Current Compliance Foundation

Knissa currently provides a compliance foundation for:

- Compliance Profiles
- Compliance Documents
- Compliance Document Retrieval
- Compliance Reviews
- Administrative Review Authorization

## Future Compliance Capabilities

- KYC Automation
- AML Automation
- Fraud Detection
- Risk Analysis
- Customer Verification
- Transaction Monitoring
- Regulatory Reporting

Compliance capabilities must evolve according to the regulatory requirements of each target market.

---

# 18. Observability

Production environments must include:

- Structured Logging
- Metrics
- Distributed Tracing
- Health Checks
- Monitoring
- Alerting
- Error Tracking

The current development environment already provides Docker-based service execution and centralized API logs.

Production observability will be expanded as the platform approaches deployment.

---

# 19. Non-Functional Requirements

Knissa must prioritize:

- High Performance
- High Availability
- Horizontal Scalability
- Fault Tolerance
- Automated Backups
- Disaster Recovery
- Maintainability
- Extensibility
- Security
- Auditability
- Data Integrity

---

# 20. Future Integrations

## Brazil

- PIX
- Open Finance
- Brazilian Banking APIs

## United States

- ACH
- Banking APIs

## Europe

- SEPA
- Banking APIs

## Canada

- Interac
- Banking APIs

## International

- SWIFT
- International Banking APIs
- Liquidity Providers

---

# 21. Project Structure

```text
knissa-api/
│
├── src/
│   ├── modules/
│   │   ├── accounts/
│   │   ├── api-keys/
│   │   ├── auth/
│   │   ├── compliance/
│   │   ├── exchange/
│   │   ├── exchange-rates/
│   │   ├── merchants/
│   │   ├── notifications/
│   │   ├── payment-links/
│   │   ├── payments/
│   │   ├── profiles/
│   │   ├── recipients/
│   │   ├── transactions/
│   │   ├── users/
│   │   └── wallets/
│   │
│   ├── shared/
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── docs/
│   ├── adr/
│   ├── api/
│   ├── architecture/
│   ├── blueprint/
│   ├── compliance/
│   ├── database/
│   ├── decisions/
│   ├── diagrams/
│   ├── domains/
│   ├── openapi/
│   ├── roadmap/
│   ├── security/
│   └── standards/
│
└── Docker configuration
```

---

# 22. Development Principles

Development must follow:

- Clean Code
- SOLID
- Separation of Concerns
- Domain-Driven Design concepts
- Modular Architecture
- Testable Code
- Documentation First
- Code Reviews
- Performance Optimization
- Security by Default
- Explicit Module Boundaries
- Consistent API Contracts

---

# 23. Engineering Principles

Every engineering decision must follow these rules:

- Ledger is the financial source of truth.
- Financial records must remain auditable.
- Every operation must be traceable.
- Security over convenience.
- APIs are contract-first.
- Every public endpoint must be documented.
- Every feature should have automated tests.
- Authorization must be enforced at the appropriate domain boundary.
- Account ownership must be respected.
- Sensitive secrets must never be stored in plaintext.
- Backward compatibility is preferred whenever possible.
- Simplicity is preferred over unnecessary complexity.
- Documentation must evolve with the implementation.

---

# 24. Deployment Strategy

## Development

```text
Developer
   ↓
Git
   ↓
Docker Compose
   ↓
Knissa API
   ↓
PostgreSQL
   ↓
Redis
```

## Future Production

```text
Developer
   ↓
GitHub
   ↓
CI/CD
   ↓
Docker
   ↓
Production
   ↓
Monitoring
   ↓
Alerting
```

Production deployments must be automated, repeatable and observable.

---

# 25. Roadmap

## Version 1 — Core Financial Platform

Completed foundation:

- Authentication
- User Registration
- Email Verification
- Session Management
- MFA
- Profiles
- Accounts
- Wallets
- Transactions
- Transfers
- Recipients
- Payments
- Payment Links
- Currency Exchange
- Exchange Rates
- Merchant Platform
- Compliance Foundation
- Notifications
- API Keys
- PostgreSQL
- Redis
- Docker Development Environment

---

## Version 2 — Platform Expansion

Planned:

- Webhooks
- Public API
- Developer Documentation Portal
- API Versioning
- Idempotency
- Advanced Notifications
- Administrative Dashboard
- Audit Dashboard
- Advanced Compliance
- Monitoring
- CI/CD
- Expanded Automated Test Coverage

---

## Version 3 — Financial Integrations

Planned:

- PIX
- Open Finance
- Banking Integrations
- QR Code Payments
- Merchant Dashboard
- Advanced Merchant Payments
- External Payment Providers
- International Transfer Infrastructure

---

## Version 4 — Client Applications

Planned:

- Knissa Web Application
- Administrative Web Application
- Merchant Dashboard
- Mobile Applications
- Financial Analytics
- Customer Notifications Center

---

## Version 5 — Advanced Financial Platform

Planned:

- Virtual Cards
- Physical Cards
- Tap to Pay
- International Banking Connections
- Investment Products
- Merchant Lending
- Business Intelligence
- AI Financial Assistant

---

# 26. Vision Statement

Knissa is being built to become a secure, scalable and globally connected financial infrastructure platform.

Every architectural decision must prioritize:

- Security
- Financial Integrity
- Reliability
- Auditability
- Scalability
- Long-Term Maintainability

The platform should remain simple to use while being powerful enough to support millions of users, businesses and financial transactions worldwide.

Knissa's long-term objective is to provide a unified financial infrastructure capable of connecting digital accounts, wallets, payments, merchants, currency exchange, notifications and external financial institutions through a secure and extensible platform.