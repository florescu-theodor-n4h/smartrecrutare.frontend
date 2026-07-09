# SmartRecruit Frontend — Documentatie Tehnica

Acest folder contine documentatia operationala si tehnica pentru frontend-ul SmartRecruit. Ghidurile de mai jos sunt orientate spre mentenanta, integrare si extindere a proiectului.

## Start Rapid

1. Instaleaza dependintele.

```bash
npm install
```

2. Configureaza host-ul API, daca este necesar.

```env
VITE_API_HOST=http://192.168.1.79:8080
```

3. Porneste serverul de dezvoltare.

```bash
npm run dev
```

## Ce gasesti in aceasta documentatie

### Arhitectura si contracte

- `docs/arhitectura.md` descrie structura proiectului si principiile de design.
- `docs/modele-si-decoratori.md` explica DTO-urile, decoratoarele si validarea datelor.
- `docs/api-integration.md` acopera stratul HTTP, endpoint-urile si contractele de payload.

### Autentificare

- `docs/autentificare.md` documenteaza modul dual de login si regulile de selectie ale providerului.
- `docs/auth-pill-enterprise.md` ofera detalii despre componenta de autentificare din header.

### Administrare si navigatie

- `docs/settings-hamburger-menu.md` descrie controlul de navigatie pentru zona de settings.
- `docs/admin-local-users.md` documenteaza pagina de administrare a utilizatorilor locali.

### Conversatii si asistenta

- `docs/chatbot.md` explica integrarea chatbot-ului GPT si fluxurile de chat.

## Recomandari de utilizare

- Citeste mai intai manualul corespunzator zonei pe care vrei sa o modifici.
- Verifica daca exista deja un contract sau un tip dedicat inainte sa adaugi unul nou.
- Pastreaza documentatia si codul aliniate: daca se schimba un endpoint sau o regula de autentificare, actualizeaza si ghidul asociat.

## Limbi si traduceri

- Textele UI sunt definite in `src/i18n/en.json` si `src/i18n/ro.json`.
- Acest folder de documentatie foloseste romana pentru ghidurile tehnice interne.

## Ordinea recomandata de lectura

1. `docs/arhitectura.md`
2. `docs/api-integration.md`
3. `docs/autentificare.md`
4. `docs/modele-si-decoratori.md`
5. `docs/admin-local-users.md`
6. `docs/settings-hamburger-menu.md`
7. `docs/chatbot.md`
