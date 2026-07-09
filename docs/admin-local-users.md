# Admin Local Users

The local users screen lives at `/admin` and is used to manage local accounts in the database.

## Entry point

The screen is intentionally surfaced from the settings hamburger menu in the top navigation.

## What it provides

- list local users with pagination
- create a new local user
- edit profile fields, roles and password
- assign or remove managed employer ids

## Notes

- The page is rendered by `src/views/AdminLocalUsersView.vue`.
- The view talks to `src/services/localUsersApi.ts`.
