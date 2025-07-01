# Poké-app
Een responsive Pokédex app waarmee je informatie over alle Pokémon kunt opzoeken. Bewaar je favoriete Pokémon door ze te vangen!

## Inhoudsopgave

  * [Beschrijving](#beschrijving)
  * [Gebruik](#gebruik)
  * [Kenmerken](#kenmerken)
  * [Installatie](#installatie)
  * [Bronnen](#bronnen)
  * [Licentie](#licentie)

## Beschrijving
<!-- Bij Beschrijving staat kort beschreven wat voor project het is en wat je hebt gemaakt -->
<!-- Voeg een mooie poster visual toe 📸 -->
<!-- Voeg een link toe naar Github Pages 🌐-->

<img src="https://github.com/user-attachments/assets/bf10baec-ecca-45bf-8bf0-33817ecc91b6" height=350>
<img src="https://github.com/user-attachments/assets/2ecddef5-baaf-4661-923e-3a87ae829b20" height=350>

<img src="https://github.com/user-attachments/assets/d099ab4f-bced-4484-8120-dbeaad0b8d41" height=350>
<img src="https://github.com/user-attachments/assets/4394f42c-a542-416d-8f4d-bc2e20f71ebc" height=350>



## Gebruik
<!-- Bij Gebruik staat de user story, hoe het werkt en wat je er mee kan. -->
### Overzicht met Pokémon
De gebruiker kan een overzicht met Pokémon zien. De kleur van het kaartje van de Pokémon komt overeen met het type. Elk kaartje is volledig klikbaar, en heeft een subtiel geanimeerde focus stijl. Als op de Pokéball wordt geklikt, kan de gebruiker de Pokémon 'vangen', en later snel terugvinden.

![Untitled video](https://github.com/user-attachments/assets/bffeb782-5cee-4de2-a727-e71c5ea8bee2)

### Load More
Onderaan de pagina kan de gebruiker op de 'load more' knop klikken. Dan worden de volgende twaalf Pokémon geladen. In het geval dat JavaScript niet wordt ondersteund of uit staat, navigeert de gebruiker naar de volgende pagina.

<img src="https://github.com/user-attachments/assets/671efbe0-8d39-4095-9963-ea55bbbb60b2" height=100>
<img src="https://github.com/user-attachments/assets/d0addc42-d560-4091-a513-f63a20e0598e" height=100>

### Detailpagina met tabjes
Als de gebruiker op een Pokémon klikt, navigeert deze naar de detailpagina van die Pokémon. Hier kan de gebruiker alle info van die Pokémon zien, onderverdeeld in drie tabjes: 'about', 'stats', en 'evolutions'. In 'about' heb ik een subtiele achtergrondkleur toegevoegd aan de oneven rijen informatie, zodat (vooral op bredere schermen) duidelijker is welke informatie bij elkaar hoort. In 'stats' staan zowel de statistieken in nummers als een visuele representatie van de stats in een balkje. Vanuit 'evolutions' kan de gebruiker naar elke evolutie van de Pokémon navigeren. Ook vanuit de detailpagina kan de gebruiker de Pokémon 'vangen'.

<img src="https://github.com/user-attachments/assets/a236dd96-8af5-4250-961b-47a77f75b3b3" height=200>
<img src="https://github.com/user-attachments/assets/1bae3f96-514c-470b-84f2-8529c5f4168d" height=200>



### Zoekbalk
Vanuit de homepagina kan de gebruiker zoeken op de naam van de Pokémon of een deel daarvan.

### Error Page
Als een Pokémon niet gevonden wordt, wordt er een foutpagina weergegeven.

<img src="https://github.com/user-attachments/assets/69cc7f8b-b4df-4487-a134-391afb4abadd" height=200>



## Kenmerken
<!-- Bij Kenmerken staat welke technieken zijn gebruikt en hoe. Wat is de HTML structuur? Wat zijn de belangrijkste dingen in CSS? Wat is er met JS gedaan en hoe? Misschien heb je iets met NodeJS gedaan, of heb je een framwork of library gebruikt? -->
### Liquid Templates
Ik heb een Liquid template aangemaakt voor de homepagina zodat ik dezelfde structuur kon gebruiken voor de overzichtpagina en de zoekresultaten. 
https://github.com/irisvw/proof-of-concept/blob/main/views/layouts/overview.liquid

### Pagination
De applicatie werkt met pagina's. Op basis van de PageID geeft de server een bepaalde set Pokémon terug. 
https://github.com/irisvw/proof-of-concept/blob/8d684173b1626aee3f8a5fe364ade05babe12667/server.js#L124-L129

In het Liquid template worden de 'previous' en 'next' link gerenderd door er 1 van af te trekken of toe te voegen.
https://github.com/irisvw/proof-of-concept/blob/8d684173b1626aee3f8a5fe364ade05babe12667/views/index.liquid#L36-L37

### Client-side Enhancements
Ik heb een script toegevoegd om de forms te enhancen, zodat de pagina niet meer ververst en er coole animaties afspelen. https://github.com/irisvw/proof-of-concept/blob/main/public/scripts/data-enhance.js

Ook heb ik een extra scriptje toegevoegd voor de pagina's, waardoor de 'next' en 'previous' buttons veranderen in een enkele 'load more' button en de resultaten van de volgende pagina aan de huidige pagina worden toegevoegd. https://github.com/irisvw/proof-of-concept/blob/main/views/index.liquid#L41-L65


## Installatie
<!-- Bij Instalatie staat hoe een andere developer aan jouw repo kan werken -->
1. Navigeer naar nodejs.org en installeer de NodeJS ontwikkelomgeving. Kies voor NodeJS 22.16.0 with long-term support, download de benodigde bestanden en doorloop het installatieproces.
2. Fork daarna deze repository en clone deze op jouw computer.
3. Open deze repository in je editor, bijvoorbeeld VS code.
4. Voer in de terminal het commando `npm install` uit
5. Start de site op door in de terminal het commando `npm start` uit te voeren.

## Bronnen

## Licentie

This project is licensed under the terms of the [MIT license](./LICENSE).
