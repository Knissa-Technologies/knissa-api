
# ADR-003: Financial Core

- **Status:** Accepted
- **Date:** July 2026

---

# Context

Knissa is a financial platform responsible for managing wallets, transfers, payments, currency exchange and future banking integrations.

Financial systems require strong guarantees of consistency, traceability and auditability.

Incorrect balance calculations may lead to financial losses and loss of customer trust.

Therefore, the financial core must follow accounting principles instead of storing balances as the source of truth.

---

# Decision

Knissa adopts an **Immutable Ledger Model**.

Every financial operation must generate one or more ledger entries.

The ledger is the source of truth for every wallet balance.

Wallet balances are derived from ledger records.

---

# Ledger Principles

The ledger follows these principles:

- Immutable
- Auditable
- Consistent
- Traceable
- Double-entry ready
- Transactional

Ledger records must never be updated or deleted.

Corrections must be performed through compensating transactions.

---

# Financial Flow

Every financial operation follows the same lifecycle:

Request

↓

Validation

↓

Business Rules

↓

Database Transaction

↓

Ledger Entries

↓

Wallet Balance Update

↓

Transaction Completed

---

# Wallet

Each wallet belongs to:

- One User
- One Currency

A user may own multiple wallets.

Example:

User

↓

Wallet (BRL)

Wallet (USD)

Wallet (EUR)

Wallet (HTG)

Wallet (CAD)

---

# Transactions

Transactions represent business operations.

Examples:

- Deposit
- Withdrawal
- Transfer
- Exchange
- Payment
- Refund
- Fee

Each transaction produces ledger entries.

---

# Ledger Entries

A ledger entry represents the movement of money.

Example fields:

- id
- walletId
- transactionId
- amount
- currencyId
- type
- createdAt

Ledger entries are immutable.

---

# Exchange

Currency exchange consists of:

- Source Wallet
- Destination Wallet
- Exchange Rate
- Exchange Fee
- Ledger Entries

Every exchange creates its own transaction.

---

# Fees

Fees are explicit financial records.

Examples:

- Exchange Fee
- Transfer Fee
- Withdrawal Fee
- Payment Fee

Fees generate their own ledger entries.

---

# Auditability

Every financial operation must be traceable.

The system must record:

- Timestamp
- User
- Transaction
- Wallet
- Currency
- Operation Type

Future versions may include complete audit logs.

---

# ACID Transactions

All financial operations must execute inside database transactions.

Either:

Everything succeeds

or

Everything fails.

Partial updates are not allowed.

---

# Future Evolution

The financial core is designed to support:

- Double-entry accounting
- Banking integrations
- Open Finance
- International transfers
- Payment providers
- Merchant accounts

without major architectural changes.

---

# Decision Summary

Financial Model:

Immutable Ledger

Balance Source:

Ledger Entries

Database Transactions:

Required

Financial Integrity:

Guaranteed through ACID transactions and immutable records.