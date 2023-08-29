import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { create, engine } from "express-handlebars";
import { router } from "./routes/index.js";
import cookieParser from "cookie-parser";
import { setupDB } from "./database.js";
import { urlencoded } from "express";

// =======================
// Konfigurera express webbservern ☝️🤓
// =======================

// Instans av express ☝️🤓
const app = express();
// Porten som servern ska lyssna på ☝️🤓
const port = 3000;

// __dirname är sökvägen till den här filen ☝️🤓
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const hbs = create({
    extname: ".hbs",
    helpers: {
        'inlineIf': (condition, value) => condition ? value : '',
        'inlineIfElse': (condition, value, elseValue) => condition ? value : elseValue,
    }
});

// Säger till express att använda handlebars som template engine ☝️🤓
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
// Säger till express att använda views-mappen för att hitta template filer ☝️🤓
app.set("views", path.resolve(__dirname, "../views"));

app.use(cookieParser("very secret"));

app.use(
    urlencoded({
        extended: true,
    })
);

// =======================
// Konfigurera routes ☝️🤓
// =======================

// Säger till express att använda public-mappen för att serva statiska filer ☝️🤓
app.use(express.static(path.join(__dirname, "../public")));

// Använd router from ./routes/index.js
app.use(router);

// =======================
// Starta servern ☝️🤓
// =======================
setupDB();

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    // hbs.getTemplates(path.resolve(__dirname, "../views")).then(console.log).catch(console.error);
});

console.log("Hello world");
