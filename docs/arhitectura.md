# Arhitectura Proiectului SmartRecruit

Acest document descrie structura proiectului si principiile fundamentale de design utilizate in frontend-ul SmartRecruit.

## Structura Folderelor

- `src/assets/`: Fisiere statice precum CSS si imagini.
- `src/components/`: Componente Vue reutilizabile, organizate pe functionalitati (ex: `chat`, `notifications`).
- `src/composables/`: Logica de business incapsulata in functii Composition API (useChat, useApi etc.).
- `src/decorators/`: Sistem personalizat de decoratori Stage 3 pentru metadata si validare DTO.
- `src/i18n/`: Fisiere de traducere pentru suport multi-limba (Engleza si Romana).
- `src/models/`: Clase de date si entitati DTO care extind `AbstractDTOEntity`.
- `src/router/`: Configurarea rutelor aplicatiei.
- `src/services/`: Stratul de comunicare cu API-ul si servicii abstracte (ex: Auth).
- `src/stores/`: Managementul starii globale folosind Pinia.
- `src/views/`: Componentele principale de pagina care sunt mapate la rute.

## Principii de Design

### 1. Servicii Abstracte (Contracts)

Folosim interfete abstracte pentru functionalitati critice cum ar fi autentificarea. Vezi `src/services/auth.contract.ts`. Aceasta permite schimbarea furnizorului de autentificare (Auth0 vs Local) fara a modifica componentele UI.

### 2. DTO-uri si Decoratori

Datele primite de la API nu sunt folosite direct ca obiecte literale. Sunt trecute prin `AbstractDTOEntity.parse()` care foloseste decoratori (`@Field`, `@Exclude`) pentru a transforma si valida datele conform contractului cu backend-ul.

### 3. Composition API

Toate componentele noi trebuie sa utilizeze Vue 3 Composition API (`<script setup>`). Logica complexa trebuie extrasa in composables.

### 4. Zero Dependente Directe de Auth0 in UI

Componentele nu importa niciodata din `@auth0/auth0-vue`. Toata interactiunea cu autentificarea se face prin `AuthLoginKey` injectat sau prin composable-ul `useAuthLoginPlugin`.

## Tehnologii Utilizate

- **Vue 3**: Framework principal.
- **Vite**: Build tool rapid.
- **Pinia**: State management.
- **TypeScript**: Type safety strict peste tot (fara `any`).
- **Vitest**: Testing framework pentru unit si integration tests.
- **Cypress**: Pagini de testare E2E.
