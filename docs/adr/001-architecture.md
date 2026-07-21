# ADR-001: Architecture Style

- **Status:** Accepted
- **Date:** July 2026

---

# Context

Knissa is a digital financial platform designed to support multiple financial products, including digital accounts, wallets, international transfers, money exchange, payment services and banking integrations.

The platform is expected to evolve continuously while maintaining high code quality, security and scalability.

At the beginning of the project, the development team is small and prioritizes rapid delivery without sacrificing maintainability.

Therefore, the architecture must:

- be easy to understand;
- support modular development;
- allow independent evolution of business domains;
- simplify testing;
- reduce operational complexity;
- allow future migration to microservices if necessary.

---

# Decision

Knissa will adopt a **Modular Monolith Architecture**.

The application will be organized into independent business modules, each containing its own controllers, services, repositories and domain logic.

Examples of modules include:

```text
Auth

Users

Wallets

Transactions

Ledger

Exchange

Payments

OpenFinance

Notifications

Admin
```

Business rules must remain inside their respective modules.

Communication between modules should occur through services and clearly defined interfaces.

---

# Benefits

The Modular Monolith architecture provides:

- Simple deployment
- Lower infrastructure costs
- Faster development
- Easier debugging
- Better code organization
- Strong domain separation
- Easier automated testing
- Lower operational complexity

---

# Future Evolution

If business growth requires independent scaling of specific modules, the architecture will support gradual extraction into microservices.

Possible candidates include:

- Payments
- Exchange
- Notifications
- Open Finance

This migration should occur only when justified by business or operational requirements.

---

# Consequences

Positive:

- Faster initial development
- Better maintainability
- Easier onboarding of new developers
- Lower infrastructure cost
- Simpler deployments

Negative:

- Single deployment artifact
- Shared database in early stages
- Requires discipline to prevent tight coupling between modules

---

# Implementation Guidelines

Every module should follow the same internal structure.

Example:

```text
modules/

users/

controller/

service/

repository/

domain/

dto/

routes/

validators/
```

Business logic must never be placed inside controllers.

Controllers are responsible only for:

- receiving HTTP requests;
- validating input;
- invoking services;
- returning HTTP responses.

All business rules belong to the Service layer.

Database access belongs exclusively to the Repository layer.

---

# Decision Summary

Architecture Style:

**Modular Monolith**

Language:

**TypeScript**

Framework:

**Express**

Database:

**PostgreSQL**

ORM:

**Prisma**

This decision establishes the architectural foundation for the Knissa platform.