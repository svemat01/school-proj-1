# Projekt 1

## Installation

### Installera Node.js

https://nodejs.org/en/download

### Installera Nodemon

```bash
npm install -g nodemon
```

### Installera projektet

```bash
git clone https://github.com/svemat01/school-proj-1.git
cd school-proj-1
npm install
```

### Starta projektet

Vanlig start

````bash
npm start

Starta med automatisk omstart vid ändringar

```bash
npm run dev
````

## Verktyg och tekniker som används i projektet

### Node.js

Node.js är en runtime-miljö för JavaScript som använder sig av Googles V8-motor. Node.js är ett asynkront, händelsestyrt sätt att köra JavaScript och därmed möjliggör det att köra JavaScript även på serversidan.

### JavaScript

JavaScript är ett programmeringsspråk som används för att skapa dynamiska webbapplikationer. Det är ett av de mest populära programmeringsspråken och används av många stora företag som till exempel Google och Facebook.

### npm

npm är en pakethanterare för Node.js och används för att installera och hantera paket som används i ett projekt. npm är en förkortning för Node Package Manager. Här så kommer det både att användas för att skapa backenden men även för att skapa frontenden.

### Express

Express är ett ramverk för Node.js som används för att skapa webbapplikationer och API:er. Det är ett av de mest populära ramverken för Node.js och används av många stora företag som till exempel Uber och IBM.

### Handlebars

Handlebars är ett templating-språk som används för att skapa HTML-sidor.
Med detta kan vi konfiugera views (HTML-sidor) och partials (templates) som kan användas för att skapa dynamiska webbapplikationer.

## Hur fungerar projektet?

Webbservern drivs av nodejs som kör en express applikation. Denna applikationen har en router som tar emot inkommande requests och skickar tillbaka en response. Denna response kan vara en HTML-sida, en JSON-fil eller något annat. Detta beror på vilken route som användaren har anropat.

Grundläggande så har vi tre viktiga platser i projektet. Dessa är:

- public
- src
- views

### public

I public så finns alla statiska filer som används i projektet. Detta är till exempel CSS-filer, JavaScript-filer och bilder. Dessa filer är tillgängliga för alla som besöker webbplatsen.

### src

I src så finns alla filer som används för att skapa backenden. Detta är till exempel filer som hanterar databasen och annan kod för att driva webbservern.

### views

Här så finns templates i formatet handlebars. Dessa templates används för att skapa HTML-sidor som sedan skickas tillbaka till användaren.

Under views/partials har vi delar sidan som kan inkluderas av de stora templatesen. Dessa partials kan till exempel vara en header eller en footer.

I views/layouts så har vi i vanliga fall endast en fil som heter main.handlebars. Denna filen är en mall för alla sidor som används i projektet (endast de som ligger under views). Det vill säga att här så ska saker som ska finnas på alla sidor ligga. Detta kan till exempel vara en header, en footer eller fonter/scripts som ska finnas på alla sidor.
