# Identity Domain

## Purpose

Responsible for authentication, identity and session management.

---

## Models

- User
- Profile
- Session

---

## Responsibilities

- Authentication
- Authorization
- Session Management
- Identity

---

## Relationships

User
↓
Profile
↓
Session

---

## Business Rules

- Every User has exactly one Profile.
- A User may have multiple Sessions.
- Sessions can be revoked independently.
- Passwords are never stored in plain text.

---

## Future Evolution

- Passkeys
- MFA
- OAuth
- Social Login
- Biometric Authentication