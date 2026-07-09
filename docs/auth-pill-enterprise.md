# Auth Pill Enterprise Guide

This document describes the authentication entry component used in the top navigation.

## Scope

- component: `src/components/AuthPill.vue`
- objective: keep sign-in fast while supporting enterprise-style dual authentication flows

## Supported flows

- local-only mode
- external-only mode (SSO)
- dual mode (SSO + local credentials)

## Enterprise UX additions

- clear method chips for available authentication methods
- quick local action controls for sign in and registration
- inline password visibility toggles
- escape-key close behavior for fast keyboard navigation
- explicit security note inside the dialog

## SOLID-oriented structure

- auth provider resolution remains delegated to service layer (`AuthLoginService`)
- UI logic remains focused on presentation and user interaction state
- active service resolution is centralized in a single local decision path

## Tests

- `src/components/__tests__/AuthPill.spec.ts`
- covers local mode validation, external-only redirect, dual-mode local submission, and enterprise quick controls

## Validation commands

```bash
npm run test -- src/components/__tests__/AuthPill.spec.ts
npm run type-check
```
