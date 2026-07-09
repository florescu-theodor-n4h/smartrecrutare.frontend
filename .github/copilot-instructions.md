# SmartRecrutare Copilot Instructions

These instructions are mandatory for all future AI agents working in this repository.

## Required Workflow For Every Task

Before editing code, do a short context scan:

1. Read relevant files first.
2. Identify the owning abstraction (router, service, composable, model/decorator, auth contract, component).
3. Check existing patterns and naming style in nearby files.
4. Plan the smallest safe slice.
5. Edit only needed files.
6. Run focused validation.
7. Report exact changed files, commands, outcomes, and remaining gaps.

Do not skip the scan phase.

## Core Engineering Rules

- Use SOLID and existing project principles.
- Prefer small, reviewable, safe changes.
- Preserve current login flow unless task explicitly requests auth migration.
- Keep implementation aligned with current architecture in src/services, src/decorators, src/models, src/composables, src/router.

## TypeScript Rules

- Use modern TypeScript with strict typing.
- Never use any.
- Do not add unsafe casts unless there is a narrow documented reason.
- Prefer unknown plus type guards, discriminated unions, readonly types, satisfies, explicit DTOs, narrow interfaces.
- Keep DTO and API contract types in service layer; do not pass untyped object literals across layers when DTOs are appropriate.

## Vue Rules

- Use Vue 3 Composition API by default.
- Use Options API only for plugin registration or where an existing file already requires it.
- Prefer ref, computed, readonly, shallowRef, composables, dependency injection, typed injection keys.
- Do not create large new UI screens unless explicitly requested and justified by existing routes/features.
- Wire minimal UI only after service contracts and tests are stable.

## Decorator And Model Rules

- Reuse existing decorators and DTO metadata patterns.
- Before adding DTO/forms/metadata, inspect Field.ts and nearby model usage.
- Do not create a parallel metadata/decorator system.

## Export Style

- Group exports at the bottom of touched files when compatible with surrounding style.
- Avoid inline exported declarations unless local file pattern clearly uses inline exports.

## Comments And Documentation Language

- JSDoc, documentation, and code comments inside source code must be in Romanian without diacritics.
- Comments should explain intent, domain rules, or non-obvious decisions.
- Do not add comments that only restate obvious code.
- Microcommit messages, TODO labels, and implementation step names must be in Romanian without diacritics.

## API And HTTP Rules

- Use the existing HTTP client and current error-handling UX behavior.
- Do not introduce a second HTTP abstraction unless the project already has one in that area.
- Follow Swagger/OpenAPI contract exactly.
- Do not invent endpoints, rename paths, or simplify route names.
- Use exact paths, including Romanian paths such as /api/candidati where present.
- Use typed request DTOs, response DTOs, pagination models, optimistic version fields, enums, route parameter types.

Before implementing API work:

1. Compare uploaded Swagger/OpenAPI contract with existing frontend service layer.
2. List missing endpoint groups.
3. Confirm scope before implementing.

Current contract context to respect:

- Includes local auth, local user administration with roles, analytics, employers, jobs, candidates, GPT robot endpoints.
- Do not implement SPA fallback routes as frontend API services.

## Role Typing Rules

Role typing must be explicit. Use typed union or enum for:

- ADMIN
- MANAGER
- AUDITOR
- GOVERNMENTAL_USER
- USER

## Auth Rules

- Keep Auth0 and local auth behind a common AuthLoginService contract.
- Do not break existing Auth0 bootstrapping.
- Local auth must be selectable by environment.
- Local auth must not force Auth0 plugin creation.
- Prefer VITE_PREFERRED_AUTH.
- Preserve backward compatibility with VITE_PREFERRED_LOGIN if already present.
- Keep VITE_DISABLE_LOCAL_LOGIN as a safety flag.
- Use /auth/local/login and /auth/local/me for local auth flows.
- **Views and components must NEVER import from `@auth0/auth0-vue` directly.**
- **Auth state in views must always be read through the contract: `import { useAuthLoginPlugin } from '@/services/auth.contract'` or `inject(AuthLoginKey, null)` for safe optional usage.**
- **For env-based auth mode checks in views, import `getAuthEnvironmentConfig` and `getPreferredAuthMode` from `@/services/auth` — never call Auth0 SDK hooks from view code.**
- **UI labels must never expose provider implementation names (Auth0, Pinia, cookies, js-cookie). Use generic user-facing terms: "cont extern", "SSO", "servicii externe".**

## Testing And Validation Rules

For each service/factory/composable/auth change:

1. Add or update focused tests.
2. Run narrow tests after each safe slice.
3. Run typecheck.
4. Run lint if configured for the touched scope.
5. For auth changes, always rerun auth tests to verify Auth0 behavior is not broken.

When reporting completion, include:

- Changed files.
- Validation commands run.
- Results.
- Remaining risks or gaps.
