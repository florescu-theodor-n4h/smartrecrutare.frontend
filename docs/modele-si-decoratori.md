# Modele de Date si Decoratori

Pentru a asigura integritatea datelor si o mapare corecta intre API (Backend) si UI (Frontend), proiectul foloseste un sistem avansat de DTO-uri bazat pe decoratori Stage 3. Acest model evita tratarea payload-urilor ca obiecte libere si impune un contract explicit la nivel de domeniu.

## De ce exista acest sistem

Intr-o aplicatie de recrutare, aceleasi entitati pot circula intre mai multe contexte:

- liste paginate;
- formulare de creare;
- formulare de editare;
- payload-uri pentru API;
- rezultate partiale din backend;
- date provenite din JSON brut.

Fara un sistem de tipuri si decoratori, aceste variatii duc rapid la:

1. campuri lipsa sau suplimentare;
2. transformari inconsistente;
3. serializari incorecte;
4. validare duplicata in componente;
5. bug-uri greu de localizat.

## Rolul lui `AbstractDTOEntity`

Toate modelele de date din `src/models/` trebuie sa extinda clasa `AbstractDTOEntity`. Aceasta ofera functionalitati automate pentru:

1. **Parsare (`parse`)**: transforma un obiect JSON brut intr-o instanta de clasa, aplicand validarile necesare.
2. **Serializare (`toJSON`)**: pregateste obiectul pentru a fi trimis catre API, filtrand campurile conform regulilor.
3. **Transformare (`transform`)**: produce o forma intermediara normalizata, utila in UI si in servicii.
4. **Creare payload (`toCreatePayload`)**: construieste payload-ul pentru operatii de creare, respectand metadata declarata.

## Cum functioneaza parse-ul

Metoda `parse()` accepta fie un obiect, fie un JSON string.

### Fluxul intern conceptual

1. datele brute sunt convertite in obiect JS;
2. instanta clasei este creata cu constructorul gol;
3. campurile brute sunt asignate peste instanta;
4. validatorii si transformarile declarate prin decoratori sunt rulate;
5. la final, instanta este normalizata cu valorile rezultate din transformare.

### Ce inseamna asta practic

- daca backend-ul trimite un camp in format neasteptat, validarea il poate respinge;
- daca anumite campuri trebuie omise sau rescrise, decoratoarele pot controla acest lucru;
- UI-ul lucreaza ulterior cu o instanta coerenta, nu cu JSON ad-hoc.

## Decoratori de camp

Sistemul se bazeaza pe decoratori aplicati direct pe proprietatile clasei.

### `@Field()`

Marcheaza o proprietate ca parte din DTO.

Utilizare tipica:

- campuri care trebuie parse-uite;
- campuri care trebuie serializate;
- proprietati care trebuie sa existe in metadata modelului.

### `@Exclude()`

Previne trimiterea campului inapoi catre API.

Este util pentru:

- identificatori generati server-side;
- campuri read-only;
- metadata interna care nu trebuie expusa in payload.

### `@Transform()`

Permite transformarea datelor la intrare.

Exemple de scenarii:

- string -> Date;
- string -> number;
- valoare bruta -> forma normalizata;
- mapare intre formatul API si formatul intern al UI-ului.

## Metadata si registru intern

Decoratoarele nu lucreaza prin mutarea vizibila a prototype-ului. In schimb, metadata este stocata in registrul de decoratori al clasei.

### Avantajele abordarii

- nu polueaza obiectul de domeniu;
- permite mostenire si clonare a metadata-ului;
- separa clar definitia modelului de mecanismul de runtime;
- face posibila serializarea si validarea fara logica dispersata in componente.

## Exemplu de implementare

```typescript
import { AbstractDTOEntity } from './AbstractDTOEntity'
import { Field, Exclude } from '@/decorators/Field'

export class CandidatDTO extends AbstractDTOEntity {
  @Field()
  id!: number

  @Field()
  nume!: string

  @Field()
  @Exclude()
  dataCreare!: string
}
```

## Ciclu de viata recomandat pentru un DTO

### 1. Primire date de la API

Raspunsul crud nu trebuie folosit direct. El este convertit intr-o instanta de model.

### 2. Validare

Inainte de afisare, campurile sunt verificate pentru tip, format si constrangeri.

### 3. Normalizare

Valorile sunt transformate intr-o forma consistenta pentru UI.

### 4. Serializare pentru submit

La trimiterea inapoi catre server, campurile excluse sunt eliminate, iar structura payload-ului este construita din metadata.

## Reguli de proiectare pentru modelele noi

### Ce trebuie facut

1. defineste modelul in `src/models/` sau in zona de serviciu daca este strict un request payload;
2. marcheaza campurile relevante cu `@Field()`;
3. exclude campurile read-only cu `@Exclude()`;
4. adauga transformari numai acolo unde sunt necesare;
5. foloseste `parse()` in loc de conversii manuale in componente.

### Ce trebuie evitat

- obiecte literale trecute direct in views;
- validare duplicata in formular si apoi in model, fara motiv clar;
- presupunerea ca backend-ul trimite exact acelasi format pentru toate endpoint-urile;
- caste largi si `any` pentru a evita erorile de tip.

## Beneficii practice

- **Type safety**: TypeScript stie exact ce campuri exista.
- **Validare centralizata**: erorile de format sunt prinse la intrare.
- **Cod curat**: logica de mapare este declarativa, nu imperativa.
- **Mentenanta mai usoara**: schimbarile de contract sunt vizibile in model, nu ascunse in componente.

## Cum se leaga de API si UI

Modelele pot servi la:

- listarea candidatilor;
- editarea unui job;
- serializarea unor payload-uri de creare;
- afisarea datelor in componente reutilizabile;
- adaptarea structurii backend-ului la formatul cerut de UI.

## Reguli de aur

1. **NU** folositi obiecte literale (`{}`) direct din API in componente.
2. Folositi intotdeauna `Model.parse(data)` pentru a obtine o instanta valida.
3. Daca un camp nou este adaugat in backend, acesta trebuie adaugat cu `@Field()` in modelul corespunzator din frontend.
4. Daca un camp nu trebuie trimis inapoi la server, marcati-l explicit cu `@Exclude()`.
5. Daca valoarea vine intr-un format diferit de cel utilizat in UI, introduceti un transformator dedicat in loc sa corectati manual in mai multe componente.
