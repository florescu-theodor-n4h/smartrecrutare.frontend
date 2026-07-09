# Meniul Hamburger de Settings

Meniul hamburger din zona de settings este un control de navigatie dedicat pentru actiuni administrative si pentru accesul la functionalitati secundare. In loc sa incarce bara principala de linkuri, el concentreaza actiunile rare intr-un singur punct clar.

## Rolul din arhitectura UI

Acest control rezolva trei probleme:

1. pastreaza navigatia principala simpla;
2. ofera un punct de acces previzibil pentru pagini de administrare;
3. separa semantic actiunile de utilizator de cele administrative.

## Ce deschide in prezent

Meniul expune pagina de administrare a utilizatorilor locali.

In termeni de UX, acesta este un avantaj important:

- utilizatorii stiu unde sa gaseasca zona de admin;
- nu este nevoie de linkuri suplimentare in header;
- actiunea devine intentionata, nu accidentala.

## Componente implicate

- `src/components/SettingsHamburgerMenu.vue`
- `src/components/NavBar.vue`

## Flux de interactiune

1. utilizatorul apasa pe butonul de settings din header;
2. se deschide meniul compact;
3. sunt afisate actiunile disponibile;
4. alegerea unei actiuni duce la navigarea catre pagina corespunzatoare.

## Principii de design

### Compact si discret

Meniul trebuie sa ocupe putin spatiu si sa nu concureze vizual cu navigatia principala.

### Clar si intentionat

Elementul trebuie sa para o zona de actiuni administrative, nu o lista generica de optiuni.

### Extensibil

Daca in viitor apar mai multe actiuni de administrare, meniul trebuie sa poata fi extins fara rescrierea structurii de baza.

## Reguli de utilizare

- accesul la meniu trebuie sa fie usor de gasit in header;
- optiunile administrative trebuie sa fie explicite;
- textul pentru utilizator trebuie sa ramana scurt si clar;
- elementele de meniu nu trebuie sa amestece actiuni de profil cu actiuni de administrare, daca nu exista o justificare clara.

## Relația cu pagina de admin

Meniul hamburger functioneaza ca un preambul pentru zona de administrare. El nu contine logica business propriu-zisa, ci doar navigare.

Aceasta separare este utila pentru ca:

- view-urile raman independente de chrome-ul aplicatiei;
- aceeasi pagina de admin poate fi accesata din mai multe puncte in viitor, daca este nevoie;
- testarea navigarii este mai simpla.

## Comportament recomandat la navigare

1. meniul se inchide dupa selectie;
2. navigarea se executa imediat;
3. focusul trebuie sa ramana predictibil pentru tastatura;
4. utilizatorul trebuie sa primeasca o tranzitie clara catre pagina aleasa.

## Criterii de calitate

Un meniu bun de settings trebuie sa fie:

- vizibil fara a domina pagina;
- coerent cu restul header-ului;
- accesibil pentru tastatura;
- suficient de mic incat sa nu umbreasca navigatia principala;
- suficient de clar incat sa nu ascunda actiunile importante.

## Cazuri de verificat in viitor

- adaugarea unui nou link de administrare;
- introducerea unui rol de super-admin;
- adaugarea unor actiuni precum schimbarea limbii sau preferintelor;
- separarea actiunilor personale de cele de administrare.
