import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { create, engine } from "express-handlebars";

// =======================
// Konfigurera express webbservern
// =======================

// Instans av express
const app = express();
// Porten som servern ska lyssna på
const port = 3000;

// __dirname är sökvägen till den här filen
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const hbs = create({
    extname: ".hbs",
});

// Säger till express att använda handlebars som template engine
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
// Säger till express att använda views-mappen för att hitta template filer
app.set("views", path.resolve(__dirname, "../views"));

// =======================
// Konfigurera routes
// =======================

// Säger till express att använda public-mappen för att serva statiska filer
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
// hämta data

    res.render("home", {
        // släng in data
        title: "Yeet!"
    });
});

app.get("/yeet", (req, res) => {
    res.render("yeet", {});
});

// =======================
// Starta servern
// =======================

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    hbs.getTemplates(path.resolve(__dirname, "../views")).then(console.log).catch(console.error);
});
