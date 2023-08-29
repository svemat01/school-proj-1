import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { signedCookie } from "cookie-parser";
import { getSecureUser, getUser, getUserByUsername } from "../database.js";

export const router = Router();

router.use((req, res, next) => {
    if (!req.signedCookies?.cid) {
        res.cookie("cid", uuidv4(), {
            maxAge: 1000 * 60 * 60 * 24 * 365,
            signed: true,
        });
    }
    req.cid = signedCookie(req.signedCookies.cid, req.secret || "");
    if (req.cid) {
        const user = getSecureUser(req.cid);
        if (user) {
            req.user = user;
            req.templateData = {
                ...req.templateData,
                user,
            };
        }
    }

    if (req.query.raw === 'true') {
        req.templateData = {
            ...req.templateData,
            layout: false,
        };
    }

    next();
});

const products = [
    {
        name: "Banan",
        price: 10,
        description: "En gul böjig frukt",
        image: "safari.jpeg",
    },
    // generate 5 more ☝️🤓
    {
        name: "Äpple",
        price: 15,
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
        image: "scuba.jpeg",
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
        image: "reality.jpeg",
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
    {
        name: "Squash",
        price: 200,
        description: "En smashy frukt",
        image: "alchemy.jpeg",
    },
    {
        name: "Grape",
        price: 20,
        description: "En grupp frukt",
        image: "https://cdn.pixabay.com/photo/2016/03/05/19/02/bananas-1238247_960_720.jpg",
    },
    {
        name: "Blueberry",
        price: 15,
        description: "En blå frukt",
        image: "https://cdn.pixabay.com/photo/2016/03/05/19/02/bananas-1238247_960_720.jpg",
    },
];

router.get("/", (req, res) => {
    res.render("home", {
        ...req.templateData,
        user: {
            username: "Test",
            admin: true,
        },
    });
});

router.get("/products", (req, res) => {
    res.render("products", {
        ...req.templateData,
        products,
        user: req.user,
    });
});

router.get("/cart", (req, res) => {
    res.render("cart", {
        ...req.templateData,
        products,
        total: products.reduce((acc, curr) => acc + curr.price, 0),
    });
});

router.get("/contact", (req, res) => {
    res.render("contact", {
        ...req.templateData,
    });
});

router.route("/login")
.get((req, res) => {
    res.render("login", {
        ...req.templateData,
        register: false,
    });
})
.post((req, res) => {
    const { username, password } = req.body;

    console.log(username, password)

    if (!username || !password) {
        return res.render("login", {
            ...req.templateData,
            register: false,
            layout: false,
            error: "Missing username or password",
            username,
            password,
        });
    }

    const user = getUserByUsername(username);

    res.render("login", {
        ...req.templateData,
        register: false,
        layout: false,
        error: "Invalid username or password",
        username,
        password,
    });
})

router.get("/register", (req, res) => {
    res.render("login", {
        ...req.templateData,
        register: true,
    });
});

router.get("/fill-db", (req, res) => {});
