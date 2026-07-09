# Administrare Utilizatori Locali

Acest ghid descrie in detaliu pagina de administrare a utilizatorilor locali, disponibila in zona de admin a aplicatiei. Scopul ei este sa ofere control complet asupra conturilor interne, rolurilor si relatiilor de business asociate.

## Scop functional

Pagina de administrare a utilizatorilor locali este folosita pentru:

1. listarea conturilor locale existente;
2. crearea unui cont nou pentru un operator intern;
3. actualizarea informatiilor de baza;
4. schimbarea sau reasignarea rolurilor;
5. resetarea parolei;
6. gestionarea employerilor administrati de un manager.

## Punct de intrare

Ecranul este expus in mod intentionat din meniul tip hamburger al sectiunii de settings.

Aceasta decizie are un scop clar:

- pagina nu aglomereaza navigatia principala;
- accesul la administrare ramane intentionat si controlat;
- se separa zona operationala de navigarea publica.

## Componente si servicii implicate

### View-ul principal

- `src/views/AdminLocalUsersView.vue`

### Serviciul HTTP

- `src/services/localUsersApi.ts`

### Stratul comun de transport

- `src/services/httpClient.ts`

### Tipuri si contracte auxiliare

- `LocalUserResponse`
- `LocalUserCreateRequest`
- `LocalUserUpdateRequest`
- `LocalUserRolesRequest`
- `LocalUserPasswordRequest`
- `ManagerEmployerAssignmentRequest`

## Modelul de date

Raspunsul pentru un utilizator local include:

- `id`
- `username`
- `email`
- `enabled`
- `locked`
- `roles`
- `managedEmployerIds`
- `lastLoginAt`
- campuri de audit si versionare

### Ce inseamna aceste campuri

- `enabled` decide daca utilizatorul poate accesa sistemul;
- `locked` indica o restrictie operativa sau de securitate;
- `roles` definește drepturile la nivel de aplicatie;
- `managedEmployerIds` arata employerii asociati contului respectiv;
- `lastLoginAt` ajuta la audit si suport.

## Functionalitati detaliate

### 1. Listare cu paginare

Lista utilizatorilor se obtine prin:

- `GET /api/admin/local-users`

Parametrii acceptati:

- `page`
- `size`

### Ce trebuie urmarit in UI

- totalul de elemente;
- pagina curenta;
- actiuni rapide pe fiecare rand;
- starea `enabled` si `locked`.

### 2. Creare utilizator

Crearea foloseste:

- `POST /api/admin/local-users`

Payload-ul include:

- `username`
- `email`
- `password`
- `roles`

### Reguli operationale

- parola nu trebuie afisata dupa trimitere;
- rolurile trebuie validate inainte de submit;
- username-ul si email-ul trebuie tratate ca identitati unice in UI.

### 3. Actualizare date de baza

Actualizarea se face prin:

- `PUT /api/admin/local-users/{id}`

Campuri disponibile:

- `username`
- `email`
- `enabled`
- `locked`

### 4. Actualizare roluri

Schimbarea rolurilor foloseste:

- `PUT /api/admin/local-users/{id}/roles`

Aceasta operatie este importanta pentru ca rolurile controleaza accesul la zonele sensibile din aplicatie.

### 5. Schimbare parola

Parola este actualizata prin:

- `PUT /api/admin/local-users/{id}/password`

Aceasta ruta intoarce de obicei doar confirmarea operatiunii, fara date suplimentare.

### 6. Gestionarea employerilor

Asocierea unui employer se face prin:

- `POST /api/admin/local-users/{id}/managed-employers`

Revocarea se face prin:

- `DELETE /api/admin/local-users/{id}/managed-employers/{employerId}`

### Observatie practica

Acest mecanism este relevant in special pentru utilizatorii de tip manager, care trebuie sa vada sau sa administreze doar anumite organizatii.

## Flux de lucru recomandat pentru operatorul admin

1. cauta utilizatorul in lista;
2. verifica starea contului si rolurile curente;
3. modifica doar campurile necesare;
4. salveaza schimbarea si confirma raspunsul serverului;
5. reface lista sau datele randului pentru a evita afisarea de stare stale.

## Validari importante

### Inainte de creare sau editare

- username-ul trebuie sa fie lizibil si stabil;
- email-ul trebuie sa respecte formatul corect;
- rolurile trebuie sa fie alese explicit;
- parolele trebuie tratate ca date sensibile.

### Inainte de atribuire employer

- verifica daca utilizatorul are rolul potrivit;
- verifica daca employerul exista;
- evita duplicarea aceluiasi employer in lista de assignari.

## Erori comune

### 401 sau 403

Indica lipsa drepturilor de administrare sau o sesiune invalida.

### 404

Poate aparea daca id-ul utilizatorului nu mai exista sau ruta backend-ului difera de cea asteptata.

### 409

De obicei semnaleaza conflicte de unicitate, cum ar fi username sau email deja folosite.

## Integrare cu UI

View-ul trebuie sa reflecte clar starea curenta a fiecarei operatii:

- loading la listare;
- confirmare la salvare;
- mesaj de eroare controlat;
- refresh de stare dupa operatiuni cu impact mare.

## Recomandari de mentenanta

1. foloseste tipuri explicite pentru request si response;
2. nu reutiliza acelasi payload pentru toate operatiile daca serverul impune campuri diferite;
3. pastreaza interactiunile destructive clar separate vizual;
4. documenteaza orice nou camp adaugat in contractul de user local;
5. mentine pagina de admin separata de fluxurile publice.
