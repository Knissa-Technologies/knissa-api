<div align="center">

# 🚀 Knissa API

**The backend powering the Knissa financial platform.**

Secure • Scalable • Multi-Currency • Ledger-Based • Built for the Future

</div>

---

## 📖 Overview

Knissa API is the backend service for the **Knissa Financial Platform**, a modern financial ecosystem designed to provide secure, scalable and reliable financial services.

The platform is built around modern software engineering principles, clean architecture and financial integrity.

This repository contains the backend responsible for authentication, user management, digital wallets, payments, currency exchange and financial transactions.

---

## ✨ Features

### Authentication

- JWT Authentication
- Password Hashing
- Secure Login
- User Registration

### User Management

- User CRUD
- Roles
- Profile Management

### Wallets

- Multi-Currency Wallets
- One Wallet per Currency
- Balance Management

### Financial Operations

- Deposit
- Withdrawal
- Internal Transfer
- Payments
- Currency Exchange

### Exchange

- Exchange Rates
- Currency Conversion
- Exchange History

### Ledger

- Immutable Ledger
- Financial Traceability
- Transaction Records

---

## 🛠 Tech Stack

| Layer            | Technology |
| ---------------- | ---------- |
| Language         | TypeScript |
| Runtime          | Node.js    |
| Framework        | Express    |
| Database         | PostgreSQL |
| ORM              | Prisma     |
| Authentication   | JWT        |
| Validation       | Zod        |
| Password Hashing | Argon2     |

---

## 🏗 Architecture

The project follows a **Modular Monolith Architecture**, allowing independent business modules while keeping deployment simple.

```
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

Business rules are isolated inside Services.

Database access is performed exclusively through Repositories.

---

## 📁 Project Structure

```text
src/

├── modules/
│   ├── auth/
│   ├── users/
│   ├── wallets/
│   ├── ledger/
│   ├── transactions/
│   ├── payments/
│   ├── exchange/
│   ├── exchange-rates/
│   ├── currencies/
│   └── countries/
│
├── shared/
│
├── config/
│
└── server.ts
```

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

### Database

```bash
npx prisma migrate dev

npx prisma generate
```

### Run

```bash
npm run dev
```

---

## 📦 Implemented Modules

| Module            | Status |
| ----------------- | :----: |
| Authentication    |   ✅   |
| Users             |   ✅   |
| Countries         |   ✅   |
| Currencies        |   ✅   |
| Wallets           |   ✅   |
| Deposits          |   ✅   |
| Withdrawals       |   ✅   |
| Transfers         |   ✅   |
| Payments          |   ✅   |
| Exchange Rates    |   ✅   |
| Currency Exchange |   ✅   |
| Ledger            |   ✅   |
| Transactions      |   ✅   |

---

## 📚 Documentation

Project documentation is available in the **docs/** directory.

- Blueprint
- Architecture Decisions (ADR)
- Database Design
- Financial Core

---

## 🛣 Roadmap

### Backend

- [x] Authentication
- [x] Wallets
- [x] Ledger
- [x] Payments
- [x] Exchange
- [x] Transactions

### Next Steps

- [ ] Swagger / OpenAPI
- [ ] Docker
- [ ] Automated Tests
- [ ] CI/CD
- [ ] Monitoring
- [ ] Production Deployment

### Future Projects

- Angular Administrative Panel
- Flutter Mobile Application
- Public API
- Banking Integrations
- Open Finance

---

## 🤝 Contributing

Contributions are welcome.

Please open an Issue before submitting major changes.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Jean Joseph Bauzil

Building the future of digital finance through the Knissa Platform.
