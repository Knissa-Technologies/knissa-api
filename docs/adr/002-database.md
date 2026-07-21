# ADR-002: Database Architecture

- **Status:** Accepted
- **Date:** July 2026

---

# Context

Knissa is a financial platform responsible for storing users, wallets, transactions, exchange rates, payments and ledger records.

The database must guarantee:

- Data consistency
- ACID transactions
- High reliability
- Referential integrity
- Scalability
- Excellent performance

Financial operations cannot tolerate inconsistent data.

---

# Decision

The platform will use PostgreSQL as the primary relational database.

Database access will be implemented using Prisma ORM.

---

# Why PostgreSQL?

PostgreSQL provides:

- ACID compliance
- Strong consistency
- Excellent indexing
- Rich SQL features
- JSON support
- Foreign keys
- Transactions
- High reliability
- Wide community adoption

These characteristics make PostgreSQL suitable for financial applications.

---

# Why Prisma?

Prisma was selected because it offers:

- Type-safe database access
- Excellent TypeScript integration
- Automatic client generation
- Simple migrations
- Good developer experience
- Reduced boilerplate

---

# Primary Keys

Every entity will use UUID as its primary identifier.

Example:

- User
- Wallet
- Transaction
- Exchange
- Payment

UUIDs improve security and simplify distributed systems.

---

# Database Principles

The database must follow these principles:

- Referential Integrity
- Data Normalization
- Immutable Financial Records
- Explicit Relationships
- Foreign Keys
- Auditability

---

# Financial Records

Financial operations must never update balances directly.

Balances will always be calculated from Ledger Entries.

Ledger records are immutable.

If a correction is necessary, a compensating transaction must be created.

---

# Multi-Currency Support

Currencies will be stored in database tables.

New currencies must be added without code changes.

Wallets will always reference a Currency.

---

# Soft Delete

Business entities such as Users may support soft delete.

Financial entities such as:

- LedgerEntry
- Transaction
- Exchange

must never be deleted.

---

# Future Evolution

Future improvements may include:

- Read Replicas
- Database Partitioning
- Horizontal Scaling
- Event Streaming
- Backup Replication

---

# Decision Summary

Database:

**PostgreSQL**

ORM:

**Prisma**

Primary Keys:

**UUID**

Financial Model:

**Immutable Ledger**

Currency Model:

**Database Tables**