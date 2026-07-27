# Knissa Blueprint

> **Version:** 1.0
> **Status:** Draft
> **Last Updated:** July 2026

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

Knissa is a financial infrastructure platform designed to power digital wallets, payments, currency exchange, merchant services and future banking integrations.

The platform is built around an immutable ledger architecture, ensuring financial integrity, auditability and long-term scalability.

Knissa is designed from day one to support millions of users through secure and maintainable software engineering.

---

# 2. Mission

Provide accessible, secure and innovative financial services that connect individuals, businesses and financial institutions through a single digital platform.

---

# 3. Product Philosophy

Knissa is designed as a financial platform rather than a collection of isolated features.

Every new capability must integrate naturally into the platform ecosystem while preserving consistency, security and financial integrity.

Long-term maintainability always takes priority over short-term convenience.

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
- Mobile Applications
- Administrative Dashboard
- Financial Analytics
- AI Financial Assistant

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
|----------|------|
| Haitian Gourde | HTG |
| Brazilian Real | BRL |
| US Dollar | USD |
| Euro | EUR |
| Canadian Dollar | CAD |

The platform architecture must support adding new currencies without requiring application code changes.

---

# 8. Core Products

## Digital Accounts

- Registration
- Authentication
- User Profile
- Identity Verification (Future)

## Wallet

- Multiple Wallets
- Multiple Currencies
- Available Balance
- Reserved Balance
- Statements
- Transaction History

## Payments

- Internal Transfers
- Bank Transfers
- PIX
- QR Code
- Payment Links
- Merchant Payments

## Money Exchange

- Exchange Quotes
- Currency Conversion
- Exchange Rates
- Exchange Fees
- Exchange History

## Merchant Platform

- Merchant Accounts
- Business Dashboard
- Payment Links
- QR Payments
- POS Integration
- Tap to Pay (Future)

## Open Finance

- Bank Connections
- Consent Management
- Account Aggregation

## Notifications

- Email
- SMS
- Push Notifications
- Transaction Alerts

## Administration

- User Management
- Currency Management
- Exchange Rates
- Audit Dashboard
- Monitoring
- Reports

---

# 9. Technical Architecture

## Architecture Style

Modular Monolith

Future migration to Microservices will be considered only when justified by business growth and operational needs.

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

### Validation

- Zod

### Logging

- Pino

### Testing

- Vitest
- Supertest

### Infrastructure

- Docker

---

# 10. Architecture Layers

```text
Clients

↓

REST API

↓

Controllers

↓

Services

↓

Repositories

↓

PostgreSQL

↓

Redis
```

Business rules must remain inside Services.

Repositories are responsible only for persistence.

---

# 11. Main Modules

```text
Authentication

Users

Countries

Currencies

Wallets

Ledger

Transactions

Payments

Exchange

Exchange Rates

Merchant

Notifications

Compliance

Audit

Cards

Administration
```

---

# 12. Domain Boundaries

```text
Identity

↓

Wallet

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
```

Every module owns its own business rules.

Cross-module communication must remain explicit and controlled.

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

Rules:

- Ledger entries are immutable.
- Every financial operation creates ledger entries.
- Wallet balances are derived from the ledger.
- Financial data is never physically deleted.

---

# 14. Event Flow

Example: Internal Transfer

```text
Transfer Request

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

The same architecture applies to deposits, withdrawals, payments and currency exchange.

---

# 15. API Principles

The API follows these principles:

- RESTful
- Stateless
- OpenAPI First
- JSON Only
- Versioned
- Predictable Error Responses
- Idempotency Support (Future)

---

# 16. Security Principles

Knissa follows a Security First approach.

Security includes:

- Password Hashing
- JWT Authentication
- Refresh Tokens
- HTTPS Only
- RBAC
- Audit Logs
- Input Validation
- Rate Limiting
- Secure Headers
- MFA (Future)

---

# 17. Compliance

Future compliance modules:

- KYC
- AML
- Fraud Detection
- Risk Analysis
- Customer Verification
- Transaction Monitoring

---

# 18. Observability

Production environments must include:

- Structured Logging
- Metrics
- Distributed Tracing
- Health Checks
- Monitoring
- Alerting

---

# 19. Non-Functional Requirements

- High Performance
- High Availability
- Horizontal Scalability
- Fault Tolerance
- Automated Backups
- Disaster Recovery
- Maintainability
- Extensibility

---

# 20. Future Integrations

Brazil

- PIX
- Open Finance

United States

- ACH

Europe

- SEPA

Canada

- Interac

International

- SWIFT
- Banking APIs

---

# 21. Project Structure

```text
src/

core/

shared/

modules/

tests/

docs/

prisma/
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

---

# 23. Engineering Principles

Every engineering decision must follow these rules:

- Ledger is the single source of truth.
- Every financial operation is immutable.
- Every operation is auditable.
- Security over convenience.
- APIs are contract-first.
- Every feature requires automated tests.
- Every public endpoint must be documented.
- Backward compatibility is preferred whenever possible.
- Simplicity is preferred over unnecessary complexity.

---

# 24. Deployment Strategy

```text
Developer

↓

GitHub

↓

GitHub Actions

↓

Docker

↓

Production

↓

Monitoring
```

Production deployments must be automated and repeatable.

---

# 25. Roadmap

## Version 1

- Authentication
- Users
- Countries
- Currencies
- Wallets
- Ledger
- Transactions
- Payments
- Exchange
- Exchange Rates

## Version 2

- Merchant Accounts
- QR Code Payments
- Payment Links
- Notifications
- Administration Dashboard

## Version 3

- Virtual Cards
- Tap to Pay
- Merchant Dashboard
- Banking Integrations
- Public API

## Version 4

- Mobile Applications
- International Transfers
- Financial Analytics
- AI Financial Assistant

## Version 5

- Physical Cards
- Investment Products
- Merchant Lending
- Business Intelligence

---

# 26. Vision Statement

Knissa is being built to become a secure, scalable and globally connected financial infrastructure platform.

Every architectural decision must prioritize security, financial integrity, reliability and long-term maintainability.

The platform should remain simple to use while being powerful enough to support millions of users, businesses and financial transactions worldwide.