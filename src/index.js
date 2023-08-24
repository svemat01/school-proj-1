import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { create, engine } from "express-handlebars";

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
});

// Säger till express att använda handlebars som template engine ☝️🤓
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
// Säger till express att använda views-mappen för att hitta template filer ☝️🤓
app.set("views", path.resolve(__dirname, "../views"));

// =======================
// Konfigurera routes ☝️🤓
// =======================

// Säger till express att använda public-mappen för att serva statiska filer ☝️🤓
app.use(express.static(path.join(__dirname, "../public")));

const products = [
    {
        name: "Banan",
        price: 10,
        description: "En gul böjig frukt",
        image: "https://cdn.pixabay.com/photo/2016/03/05/19/02/bananas-1238247_960_720.jpg",
    },
    // generate 5 more ☝️🤓
    {
        name: "Äpple",
        price: 5,
        description: "En röd frukt",
        image: "https://cdn.pixabay.com/photo/2016/03/05/19/02/bananas-1238247_960_720.jpg",
    },
    {
        name: "Apelsin",
        price: 7,
        description: "En orange frukt",
        image: "https://cdn.pixabay.com/photo/2016/03/05/19/02/bananas-1238247_960_720.jpg",
    },
    {
        name: "Päron",
        price: 8,
        description: "En grön frukt",
        image: "https://cdn.pixabay.com/photo/2016/03/05/19/02/bananas-1238247_960_720.jpg",
    },
    {
        name: "Kiwi",
        price: 9,
        description: "En brun frukt",
        image: "https://cdn.pixabay.com/photo/2016/03/05/19/02/bananas-1238247_960_720.jpg",
    },
    {
        name: "Vattenmelon",
        price: 15,
        description: "En stor frukt",
        image: "https://cdn.pixabay.com/photo/2016/03/05/19/02/bananas-1238247_960_720.jpg",
    },
    {
        name: "Citron",
        price: 2,
        description: "En gul frukt",
        image: "https://cdn.pixabay.com/photo/2016/03/05/19/02/bananas-1238247_960_720.jpg",
    },
    {
        name: "Avocado",
        price: 20,
        description: "En fet frukt",
        image: "https://cdn.pixabay.com/photo/2016/03/05/19/02/bananas-1238247_960_720.jpg",
    },
    {
        name: "Ananas",
        price: 15,
        description: "En tropisk frukt",
        image: "https://cdn.pixabay.com/photo/2016/03/05/19/02/bananas-1238247_960_720.jpg",
    },
]

app.get("/", (req, res) => {

    res.render("home", {
    });
});


app.get("/products", (req, res) => {
    res.render("products", {
        products
    });
});

app.get("/cart", (req, res) => {
    res.render("cart", {});
});

app.get("/contact", (req, res) => {
    res.render("contact", {});
});

// =======================
// Starta servern ☝️🤓
// =======================

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    // hbs.getTemplates(path.resolve(__dirname, "../views")).then(console.log).catch(console.error);
});
