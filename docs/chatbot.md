# Integrare Chatbot GPT

Aplicatia SmartRecruit include un asistent virtual pentru asistarea utilizatorilor si a recrutorilor. Acest document descrie arhitectura, modul de utilizare si regulile de integrare ale chatbot-ului.

## Rolul chatbot-ului in produs

Asistentul virtual este gandit ca un strat de suport contextual. Nu inlocuieste ecranele de business, ci completeaza aplicatia cu:

- raspunsuri rapide la intrebari uzuale;
- asistenta pentru joburi si candidati;
- ghidare in fluxurile repetitive;
- suport pentru utilizatori care au nevoie de navigare asistata.

## Arhitectura generala

Sistemul este compus din trei zone principale:

1. **Interfata UI**: componenta de chat si widget-ul integrat.
2. **Serviciul API**: stratul care trimite si primeste mesaje din backend.
3. **Starea chat-ului**: composable-ul care mentine mesajele, incarcarea si istoricul local.

## Componente implicate

- `src/components/chat/ChatWindow.vue`
- `src/components/ChatbotAndroidWidget.vue`
- `src/composables/useChat.ts`
- `src/services/gptRobotApi.ts`

## Fluxul de interactiune

### 1. Deschiderea conversatiei

Utilizatorul activeaza widget-ul sau fereastra de chat. Componenta citeste starea existenta si pregateste contextul vizual.

### 2. Trimiterea mesajului

Mesajul este preluat de composable si trimis catre serviciul API.

### 3. Raspunsul backend-ului

Backend-ul proceseaza cererea si intoarce un raspuns care poate include text, context sau alte informatii utile.

### 4. Actualizarea istoricului

Conversatia este actualizata in UI, iar utilizatorul vede imediat raspunsul.

## Principii de implementare

### Separare clara intre UI si logica

Componentele vizuale trebuie sa fie cat mai simple. Logica de stare si transfer de date ramane in composable si serviciu.

### Refolosire

Composable-ul trebuie sa poata fi consumat din mai multe zone ale aplicatiei, nu doar dintr-un singur ecran.

### Stare previzibila

Chatul trebuie sa afiseze clar:

- daca se trimite un mesaj;
- daca se asteapta raspuns;
- daca a aparut o eroare;
- ce mesaje sunt deja in conversatie.

## Functionalitati asteptate

### Conversatii in timp real

Mesajele sunt trimise catre backend si procesate de un serviciu extern de tip LLM sau de un strat intermediar care comunica cu acesta.

### Context de recrutare

Asistentul trebuie sa raspunda la intrebari despre:

- joburi;
- candidati;
- procese de recrutare;
- functionalitati ale aplicatiei.

### Widget integrat

Widget-ul ofera acces rapid la chat fara a lasa utilizatorul sa paraseasca ecranul curent.

## Utilizarea in cod

Pentru a integra logica de chat intr-o noua componenta, se recomanda utilizarea composable-ului dedicat:

```ts
import { useChat } from '@/composables/useChat'

const { messages, sendMessage, isLoading } = useChat()
```

## Consideratii despre accesibilitate

Un chat util trebuie sa fie accesibil, nu doar vizual atractiv.

### Recomandari

- focus clar pe campul de input;
- trimitere din tastatura;
- stare vizibila pentru loading;
- etichete clare pentru actiunile principale;
- text suficient de contrastant pentru citire rapida.

## Configurare backend

Asistentul depinde de endpoint-urile `/api/robot/...`. Asigurati-va ca variabila `VITE_API_HOST` este corect setata pentru ca robotul sa poata raspunde.

## Strategii de depanare

### Cand mesajele nu se trimit

- verifica daca host-ul API este setat corect;
- verifica daca endpoint-ul de chat exista in backend;
- urmareste erorile din consola si din logurile HTTP.

### Cand raspunsurile intarzie

- verifica timpul de raspuns al backend-ului;
- verifica daca cererea ajunge la server;
- confirma daca loading state-ul este resetat corect dupa eroare.

### Cand istoricul nu se pastreaza

- verifica daca composable-ul gestioneaza contextul local;
- confirma daca componenta reporneste o conversatie noua la fiecare mount;
- verifica daca se sterge intentional istoricul la inchidere.

## Extensii posibile

In viitor, acest subsistem poate fi extins cu:

- sugestii rapide de tip quick replies;
- atasamente;
- clasificarea intentiilor;
- raspunsuri contextuale pe baza ecranului curent;
- integrare cu un istoric persistent al conversatiilor.
