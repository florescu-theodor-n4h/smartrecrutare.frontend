# Sistemul de Autentificare

SmartRecruit suporta un sistem dual de autentificare care poate fi configurat prin variabile de mediu. Toata logica este ascunsa in spatele unui contract abstract (`AuthLoginService`), astfel incat UI-ul sa nu depinda de implementarea concreta.

## Obiectivele arhitecturii de autentificare

Stratul de autentificare trebuie sa indeplineasca simultan mai multe cerinte:

1. sa permita rularea cu un furnizor extern de identitate;
2. sa permita rularea cu autentificare locala, bazata pe username si parola;
3. sa pastreze o interfata comuna pentru toate componentele Vue;
4. sa nu forteze componentele sa cunoasca detalii despre token-uri, cookie-uri sau SDK-uri externe;
5. sa poata fi activat sau dezactivat din mediul de executie, fara schimbari in UI.

## Modul de selectare a providerului

Selectarea modului de autentificare este centralizata in `src/services/auth.ts`.

### Prioritatea configurarii

Ordinea de rezolvare este urmatoarea:

1. `VITE_PREFERRED_AUTH`
2. `VITE_PREFERRED_LOGIN` ca mecanism de compatibilitate
3. `auth0` ca fallback implicit

### Reguli suplimentare

- daca este cerut modul local dar `VITE_DISABLE_LOCAL_LOGIN=true`, aplicatia revine la `auth0`;
- valorile sunt normalizate prin `trim()` si comparare case-insensitive;
- comentariile de tip `#` din variabilele de mediu sunt eliminate din valoarea folosita efectiv.

## Fluxurile suportate

### 1. Autentificare externa

Fluxul extern foloseste un provider de identitate dedicat. In aplicatie, acest mod este tratat ca o implementare a contractului `AuthLoginService`, nu ca un caz special in componente.

Comportamente asteptate:

- login prin redirect sau mecanismul nativ al providerului;
- verificare a sesiunii la pornirea aplicatiei;
- logout controlat din acelasi contract;
- afisarea unui disclaimer scurt, acolo unde este necesar.

### 2. Autentificare locala

Fluxul local foloseste endpoint-urile serverului:

- `POST /auth/local/login`
- `GET /auth/local/me`
- `POST /auth/local/register`

Acest flux este util pentru dezvoltare, medii interne sau scenarii in care nu se doreste dependenta de un provider extern.

## Contractul `AuthLoginService`

Contractul defineste comportamentul comun pentru toate implementările.

- `isAuthenticated`: referinta reactiva ce descrie starea curenta.
- `loginWithRedirect(options?)`: porneste procesul de autentificare.
- `checkAuth()`: valideaza sesiunea curenta.
- `register(options?)`: optional, pentru providerii care suporta inregistrare.
- `logout(options?)`: incheie sesiunea.
- `getDisclaimer()`: text scurt pentru UI.
- `isLocalPiniaSaveable()`: marcheaza daca persistenta locala este permisa.

### Metode auxiliare legate de sesiune

Clasa abstracta expune si metode pentru sincronizare in store-ul de sesiune:

- `setSavingUserIntention()`;
- `saveLoginStatus()`;
- `saveDisclaimer()`;
- `saveUserIntention()`.

Acestea sunt utile pentru a pastra starea de login intre refresh-uri, mai ales in modul local.

## Cum trebuie folosit in componente

### Varianta recomandata: `useAuthLoginPlugin()`

```ts
import { useAuthLoginPlugin } from '@/services/auth.contract'

const authService = useAuthLoginPlugin()
```

Aceasta varianta este potrivita in componentele Composition API si asigura acces direct la instanta instalata in aplicatie.

### Varianta recomandata: injectie prin cheia dedicata

```ts
import { inject } from 'vue'
import { AuthLoginKey } from '@/services/auth.contract'

const authService = inject(AuthLoginKey, null)
```

Aceasta abordare este utila atunci cand componenta trebuie sa trateze elegant absenta providerului.

### Varianta interzisa in UI

- nu se importa direct din `@auth0/auth0-vue`;
- nu se folosesc hook-uri SDK direct in views;
- nu se conditioneaza UI-ul pe clase sau detalii de implementare ale providerului.

## Starea de sesiune

Starea de autentificare este sincronizata in Pinia, prin store-ul de autentificare.

### Ce este retinut

- utilizatorul este autentificat sau nu;
- intentia de salvare a sesiunii;
- disclaimer-ul afisat utilizatorului;
- intentia de login sau inregistrare.

### De ce conteaza

Aceasta sincronizare permite:

- restaurarea unei sesiuni dupa reload;
- afisarea unor mesaje coerente in UI;
- pastrarea unui comportament diferit pentru local auth versus provider extern.

## Detalii despre fluxul local

Implementarea locala foloseste `ServerAuthUserPassLogin`.

### Login

La autentificare, serviciul trimite username si parola la `POST /auth/local/login`. Daca serverul intoarce un token, acesta este stocat temporar in client si reutilizat de clientul HTTP.

### Verificare sesiune

`GET /auth/local/me` este folosit pentru a confirma daca sesiunea este inca valida. Daca serverul intoarce un token nou sau o stare autentificata, aceasta este reflectata in store.

### Inregistrare

`POST /auth/local/register` primeste username, email si parola. Dupa reusita, intentia utilizatorului este salvata pentru a putea fi reluata in UI.

### Logout

La logout, token-ul bearer este eliminat din client, iar starea reactiva este resetata.

## Principii de siguranta si UX

1. UI-ul trebuie sa afiseze doar termeni generici pentru autentificare, nu nume interne de implementare.
2. Mesajele de eroare trebuie sa fie clare si sa nu expuna detalii sensibile.
3. Daca exista un disclaimer pentru modul local, el trebuie tratat ca mesaj informational, nu ca alerta.
4. Comportamentul de login trebuie sa ramana predictibil dupa refresh sau navigare intre pagini.

## Debug si depanare

### Cand loginul local pare sa nu functioneze

- verifica daca modul preferat este setat pe `local`;
- confirma ca `VITE_DISABLE_LOCAL_LOGIN` nu forteaza revenirea la `auth0`;
- verifica daca endpoint-ul local raspunde si daca returneaza `accessToken`;
- urmareste logurile HTTP si eventualele raspunsuri 401.

### Cand UI-ul pare sa aiba starea gresita

- verifica daca store-ul de sesiune este initializat;
- verifica daca `checkAuth()` este apelat la pornire;
- confirma ca valorile din Pinia corespund cu starea curenta a serverului.

## Regula de aur

Daca schimbi modul de autentificare, nu modifica views direct. Actualizeaza serviciul de contract, apoi lasa componentele sa consume acel contract fara sa stie daca autentificarea este externa sau locala.
