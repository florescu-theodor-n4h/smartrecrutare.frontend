# Integrare API Frontend

Acest manual descrie stratul de integrare dintre frontend-ul SmartRecruit si backend-ul HTTP. Accentul este pus pe contracte, configurare, modul de transport si pe modul in care sunt organizate apelurile catre server.

## Scopul stratului de integrare

Frontend-ul nu vorbeste direct cu componente UI despre detalii de retea. Toate apelurile trec prin servicii dedicate din `src/services/`, astfel incat:

1. configurarea host-ului sa fie centralizata;
2. autentificarea la nivel HTTP sa fie consistenta;
3. logica de payload si route-uri sa poata fi mentinuta independent de vizualizare;
4. erorile de contract sa fie descoperite la nivel de serviciu, nu in componente.

## Configurare de baza

### URL-ul backend-ului

Clientul HTTP foloseste o baza de lucru derivata din variabilele de mediu:

- `VITE_API_HOST` are prioritate pentru host-ul principal.
- `VITE_BACKEND` este acceptat ca fallback compatibil.
- daca niciuna nu este definita, clientul cade pe `http://localhost:8080`.

Aceasta valoare este normalizata prin eliminarea slash-ului final, pentru a evita URL-uri duble de forma `//api/...`.

### Credentiale si cookie-uri

Clientul HTTP este creat cu `withCredentials=true`, ceea ce inseamna ca:

- cookie-urile de sesiune sunt trimise automat acolo unde serverul le foloseste;
- fluxurile local-auth si eventualele sesiuni server-side pot functiona fara interceptare manuala in componente;
- configurarea CORS pe backend trebuie sa permita credentiale, altfel cererile autentificate vor esua.

## Stratul HTTP

Clientul global se afla in `src/services/httpClient.ts` si adauga doua comportamente importante:

1. logare de request-uri si raspunsuri pentru debug;
2. atasarea automata a token-ului bearer, daca exista unul salvat in memoria clientului.

### Ce face interceptorul de request

La fiecare request se aplica urmatoarele reguli:

- daca exista un token bearer activ si header-ul `Authorization` nu este deja setat, token-ul este injectat automat;
- se logheaza metoda HTTP si URL-ul complet;
- nu se modifica payload-ul functional al cererii.

### Ce face interceptorul de response

La raspunsurile de succes:

- se logheaza metoda, URL-ul si statusul.

La erori:

- se logheaza metoda, URL-ul, statusul si mesajul de eroare;
- eroarea este propagata mai departe fara a fi inghitita.

## Manual de endpoint-uri

Documentatia de mai jos reflecta contractele utilizate de serviciile frontend existente.

### Joburi

Serviciul de joburi foloseste ruta `/api/jobs`.

- `GET /api/jobs` intoarce lista de joburi.
- `GET /api/jobs/{id}` intoarce un job singular.
- `POST /api/jobs` creeaza un job nou.
- `PUT /api/jobs/{id}` actualizeaza un job existent.
- `DELETE /api/jobs/{id}` sterge un job.

### Candidati

Serviciul de candidati foloseste ruta `/api/candidati`.

- `GET /api/candidati` intoarce lista paginata sau nepaginta, in functie de implementarea backend-ului.
- `POST /api/candidati` creeaza un candidat.
- `PUT /api/candidati/{id}` actualizeaza datele candidatului.
- `DELETE /api/candidati/{numeCandidat}` sterge candidatul identificat prin nume, folosind `encodeURIComponent()` pentru siguranta URL-ului.

### Administrare utilizatori locali

Mecanismul de administrare pentru utilizatorii locali foloseste ruta `/api/admin/local-users`.

- `GET /api/admin/local-users` listeaza utilizatorii cu suport de paginare prin query params `page` si `size`.
- `POST /api/admin/local-users` creeaza un utilizator local.
- `GET /api/admin/local-users/{id}` intoarce un utilizator individual.
- `PUT /api/admin/local-users/{id}` actualizeaza datele de baza.
- `PUT /api/admin/local-users/{id}/roles` actualizeaza rolurile.
- `PUT /api/admin/local-users/{id}/password` schimba parola.
- `POST /api/admin/local-users/{id}/managed-employers` atribuie un employer gestionat.
- `DELETE /api/admin/local-users/{id}/managed-employers/{employerId}` revoca asocierea.

## Modele de date si contracte

Frontend-ul utilizeaza DTO-uri si tipuri dedicate, nu obiecte aruncate direct din UI. Contractele importante sunt definite in serviciile de API si in modelele din `src/models/`.

### Principii practice

- datele primite de la server trebuie mapate pe tipuri explicite;
- campurile optionale trebuie tratate ca atare in UI;
- valorile de tip enum trebuie reflectate fidel in frontend;
- payload-urile de creare si actualizare trebuie sa foloseasca structuri separate atunci cand regulile de contract difera.

### Exemplu conceptual

Un model de job sau candidat trebuie tratat ca obiect de domeniu, nu ca JSON generic. Asta ajuta la validare, serializare si la evitarea erorilor de forma in componente.

## Autentificare la nivel API

Integrarea API este compatibila atat cu sesiuni bazate pe cookie, cat si cu fluxuri care folosesc token bearer.

### Flux local

Fluxul local foloseste endpoint-urile:

- `POST /auth/local/login`
- `GET /auth/local/me`
- `POST /auth/local/register`

La login, serverul intoarce token-ul si informatii despre utilizator. Token-ul este retinut in client si reaplicat la cererile ulterioare.

### Observatie despre cookie-uri si token

Daca backend-ul returneaza si cookie-uri de sesiune, `withCredentials=true` permite pastrarea lor. Daca se foloseste doar token bearer, interceptoarele din `httpClient.ts` sunt responsabile pentru atasarea antetului `Authorization`.

## Exemple de payload

### Creare job

```json
{
  "titlu": "Frontend Engineer",
  "locatie": "Bucuresti",
  "descriere": "Lucru in Vue 3 si TypeScript",
  "companie": "SmartRecruit",
  "tipContract": "Contract",
  "activ": true
}
```

### Creare candidat

```json
{
  "numePrenume": "Ana Popescu",
  "mail": "ana@example.com",
  "tel": "+40 7xx xxx xxx"
}
```

### Creare utilizator local

```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "oParolaPuternica123",
  "roles": ["ADMIN"]
}
```

## Validare si depanare

### Simptome comune

- **Eroare CORS**: de obicei indica lipsa credentialelor sau a originii permise pe backend.
- **401 dupa login**: indica fie token invalid, fie sesiune neinitializata corect.
- **404 pe `/api/...`**: arata un mismatch intre ruta frontend si controllerul backend.
- **Raspuns gol la login local**: verifica daca serverul respecta contractul `accessToken`, `tokenType`, `user`.

### Strategii de verificare

1. confirma valoarea efectiva a `VITE_API_HOST` in mediul curent;
2. testeaza manual endpoint-ul din browser sau Postman;
3. verifica in consola browserului logurile generate de interceptorii HTTP;
4. compara payload-ul trimis de frontend cu contractul asteptat de backend.

## Relatie cu i18n si UI

Stratul API este independent de textele UI. Traducerile sunt gestionate separat in `src/i18n/`, iar serviciile HTTP nu trebuie sa contina string-uri de afisare catre utilizator.

## Rezumat operational

Cand adaugi un endpoint nou, regula practica este urmatoarea:

1. definesti contractul tipizat in serviciul din `src/services/`;
2. adaugi modelul sau DTO-ul necesar in `src/models/` sau in acelasi serviciu, daca este doar un tip de request;
3. documentezi ruta in acest ghid;
4. actualizezi orice view sau composable care consuma acel serviciu.
