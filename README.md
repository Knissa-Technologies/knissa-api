<div align="center">

# 🚀 Knissa API

**The backend powering the Knissa Financial Platform.**

Secure • Scalable • Multi-Currency • Merchant-Ready • Built for the Future

</div>

---

## 📖 Overview

Knissa API is the backend service for the **Knissa Financial Platform**, a modern financial ecosystem designed to provide secure, scalable and reliable financial services for individuals and businesses.

The platform follows a modular architecture focused on security, financial integrity, maintainability and future expansion.

The API currently provides authentication, MFA, profiles, accounts, multi-currency wallets, transactions, recipients, payments, payment links, currency exchange, merchant management, compliance, notifications and API key management.

---

## ✨ Features

### Authentication & Security

- User Registration
- Email Verification
- Email Verification Resend
- Secure Login
- JWT Authentication
- Refresh Tokens
- Session Management
- Session Revocation
- Password Change
- Multi-Factor Authentication (MFA)
- MFA Login Verification
- Role-Based Access Control

### User & Profile Management

- User Management
- User Roles
- Profile Management
- Account Ownership
- Administrative User Controls

### Accounts

- Personal Accounts
- Business-Ready Account Architecture
- Account Status Management
- Country, Language and Timezone Support
- Base Currency Configuration

### Wallets

- Multi-Currency Wallets
- Wallet per Account and Currency
- Balance Management
- Wallet History Integration
- Account-Based Access Control

### Transactions

- Internal Transfers
- Transaction History
- Transaction Details
- Administrative Test Deposits
- Financial Traceability

### Recipients

- Recipient Management
- Recipient Lookup
- Account-Based Ownership
- Recipient Updates

### Payments

- Payment Creation
- Payment History
- Payment Details
- Refunds
- Merchant Payment Architecture

### Payment Links

- Create Payment Links
- List Payment Links
- Retrieve Payment Link
- Cancel Payment Link
- Pay Payment Link

### Currency Exchange

- Exchange Quotes
- Quote Acceptance
- Currency Conversion
- Exchange History
- Exchange Rate Management
- Exchange Rate Expiration

### Merchant Platform

- Merchant Creation
- Merchant Profile Management
- Merchant Settings
- Merchant Members
- OWNER / ADMIN / MANAGER Roles
- Member Activation and Deactivation
- Member Role Management
- Merchant Ownership Transfer

### Notifications

- In-App Notifications
- Notification History
- Notification Details
- Unread Notification Count
- Mark Notification as Read
- Notification Types and Priorities
- Architecture for Email, SMS, Push and WhatsApp Providers

### API Keys

- API Key Creation
- API Key Listing
- API Key Lookup
- API Key Revocation
- API Key Deletion
- Hashed Secret Storage
- API Key Prefixes
- Environment and Scope Architecture

### Compliance

- Compliance Profiles
- Compliance Documents
- User Compliance Status
- Administrative Compliance Reviews
- KYC / AML Ready Architecture

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Cache | Redis |
| Authentication | JWT |
| Validation | Zod |
| Password Hashing | Argon2 |
| Infrastructure | Docker |

---

## 🏗 Architecture

Knissa API follows a **Modular Monolith Architecture**.

Each business capability is isolated inside its own module while sharing common infrastructure and platform services.

```text
HTTP Request
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
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
```

Business rules are implemented inside Services.

Database access is handled through Repositories.

Authentication, authorization and shared HTTP concerns are provided through shared middleware and infrastructure.

The modular monolith approach keeps deployment simple while preserving clear domain boundaries and allowing future service extraction when justified.

---

## 📁 Project Structure

```text
src/
├── modules/
│   ├── accounts/
│   ├── api-keys/
│   ├── auth/
│   ├── compliance/
│   ├── exchange/
│   ├── exchange-rates/
│   ├── merchants/
│   ├── notifications/
│   ├── payment-links/
│   ├── payments/
│   ├── profiles/
│   ├── recipients/
│   ├── sessions/
│   ├── transactions/
│   ├── users/
│   └── wallets/
│
├── infra/
├── shared/
├── app.ts
└── server.ts

prisma/
├── migrations/
├── seeds/
└── schema.prisma

docs/
├── adr/
├── api/
├── architecture/
├── blueprint/
├── compliance/
├── database/
├── decisions/
├── diagrams/
├── domains/
├── openapi/
├── roadmap/
├── security/
└── standards/
```

---

## 🌐 API Modules

The application currently exposes the following main API routes:

```text
/auth
/users
/profiles
/accounts
/wallets
/transactions
/recipients
/payments
/payment-links
/exchange
/exchange-rates
/compliance
/merchants
/notifications
/api-keys
```

Most user-facing routes require JWT authentication.

Administrative operations may additionally require specific platform roles.

---

## 🚀 Getting Started

### Clone

```bash
git clone https://github.com/bauzilj/knissa-api.git
cd knissa-api
```

### Install

```bash
npm install
```

### Configure Environment

Create a `.env` file.

Example:

```env
DATABASE_URL=
JWT_SECRET=
PORT=3000
NODE_ENV=development
```

Do not commit secrets or production credentials.

### Prisma

Validate the schema:

```bash
npx prisma validate
```

Generate Prisma Client:

```bash
npx prisma generate
```

Apply development migrations:

```bash
npx prisma migrate dev
```

### TypeScript Validation

```bash
npx tsc --noEmit
```

### Run Locally

```bash
npm run dev
```

### Docker

Build and start the complete local environment:

```bash
docker compose up --build -d
```

Check services:

```bash
docker compose ps
```

Follow API logs:

```bash
docker compose logs -f api
```

The development API runs at:

```text
http://localhost:3000
```

---

## 📦 Implemented Modules

| Module | Status |
| --- | :---: |
| Authentication | ✅ |
| Email Verification | ✅ |
| Sessions | ✅ |
| MFA | ✅ |
| Users | ✅ |
| Profiles | ✅ |
| Accounts | ✅ |
| Wallets | ✅ |
| Transactions | ✅ |
| Transfers | ✅ |
| Recipients | ✅ |
| Payments | ✅ |
| Refunds | ✅ |
| Payment Links | ✅ |
| Exchange | ✅ |
| Exchange Rates | ✅ |
| Merchants | ✅ |
| Merchant Members & Roles | ✅ |
| Merchant Ownership Transfer | ✅ |
| Compliance | ✅ |
| Notifications | ✅ |
| API Keys | ✅ |

---

## 📚 Documentation

Technical and product documentation is available in the `docs/` directory.

Important areas include:

- Blueprint
- Architecture Decisions (ADR)
- API Documentation
- Domain Documentation
- Database Design
- Security
- Compliance
- Architecture Diagrams
- OpenAPI Specification
- Engineering Standards
- Roadmaps

```text
docs/
├── adr/
├── api/
├── architecture/
├── blueprint/
├── compliance/
├── database/
├── diagrams/
├── domains/
├── openapi/
├── roadmap/
├── security/
└── standards/
```

---

## 🔐 API Security

Authenticated endpoints use JWT Bearer Authentication.

Example:

```http
Authorization: Bearer <access_token>
```

The platform also includes:

- Refresh Token support
- MFA
- Session management
- Role-based authorization
- Ownership checks
- Merchant role authorization
- API Key hashing
- Account-scoped resource access

Sensitive API secrets must never be stored in plaintext.

---

## 🔑 API Keys

API keys are designed for external integrations and future public API access.

A raw API key is generated when the key is created.

Example format:

```text
kn_live_xxxxxxxxxxxxxxxxxxxxxxxxx
```

Only the hash of the secret is persisted.

API key lifecycle endpoints include:

```text
POST   /api-keys
GET    /api-keys
GET    /api-keys/:id
PATCH  /api-keys/:id/revoke
DELETE /api-keys/:id
```

---

## 🔔 Notifications

The notification system currently supports in-app notification lifecycle operations and includes an extensible provider architecture.

Available endpoints include:

```text
POST   /notifications
GET    /notifications
GET    /notifications/unread-count
GET    /notifications/:id
PATCH  /notifications/:id/read
```

The domain is prepared for:

- Email
- SMS
- Push
- In-App
- WhatsApp

---

## 🛣 Roadmap

### Current Backend Foundation

- [x] Authentication
- [x] Email Verification
- [x] Session Management
- [x] MFA
- [x] User Profiles
- [x] Accounts
- [x] Wallets
- [x] Transactions
- [x] Transfers
- [x] Recipients
- [x] Payments
- [x] Payment Links
- [x] Currency Exchange
- [x] Exchange Rates
- [x] Compliance
- [x] Merchant Platform
- [x] Notifications
- [x] API Keys
- [x] Docker Development Environment

### Platform Expansion

- [ ] Webhooks
- [ ] Audit / Activity Logs
- [ ] OpenAPI Synchronization
- [ ] Automated Test Coverage Expansion
- [ ] CI/CD
- [ ] Monitoring and Observability
- [ ] Production Deployment

### Client Applications

- [ ] Knissa Web Application
- [ ] Administrative Dashboard
- [ ] Mobile Application
- [ ] Merchant Dashboard

### Future Financial Integrations

- [ ] PIX
- [ ] Open Finance
- [ ] ACH
- [ ] SEPA
- [ ] Interac
- [ ] SWIFT
- [ ] Banking Integrations
- [ ] Physical and Virtual Cards

---

## 🧭 Engineering Direction

The immediate goal is to stabilize and document the backend API contract before building the client applications.

The next major development phase will focus on consuming this API from the **Knissa Web frontend**.

Backend changes should preserve API consistency and backward compatibility whenever practical.

---

## 🤝 Contributing

Contributions are welcome.

Please open an Issue before submitting major architectural or domain changes.

All contributions should follow the engineering and security standards documented under `docs/standards/`.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Jean Joseph Bauzil**

Building the future of digital finance through the Knissa Platform.