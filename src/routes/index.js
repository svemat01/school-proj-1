import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { signedCookie } from "cookie-parser";
import {
    StockError,
    deleteCartEntry,
    getAllProducts,
    getCart,
    getCartEntryWithProduct,
    getCartTotal,
    getCartWithProducts,
    getProduct,
    getSecureUser,
    getUser,
    getUserByUsername,
    insertCart,
    insertUser,
    updateCartEntry,
} from "../database.js";
import { hashMD5 } from "../lib/md5.js";
import { adminRouter } from "./admin.js";

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

    if (req.query.raw === "true") {
        req.templateData = {
            ...req.templateData,
            layout: false,
        };
    }

    console.log({ cid: req.cid, user: req.user, path: req.path });

    next();
});

router.use("/admin", adminRouter);

// Template for products retrieved from database
const templateProduct = {
    id: "",
    name: "",
    description: "",
    image: "",
    stock: null,
    price: null,
};

// Template for products stored locally in cart
const templateProductInCart = {
    id: "",
    count: null,
};

const products = [
    {
        name: "Banan",
        price: 10,
        description: "En gul böjig frukt",
        image: "safari.jpeg",
    },
    {
        name: "Äpple",
        price: 15,
        description:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
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
    });
});

router.get("/contact", (req, res) => {
    res.render("contact", {
        ...req.templateData,
    });
});

router.get("/products", (req, res) => {
    const products = getAllProducts();

    res.render("products", {
        ...req.templateData,
        products,
    });
});

router
    .route("/products/:id")
    // Show product page
    .get((req, res) => {
        const item = getProduct(Number(req.params.id));

        res.render("product", {
            ...req.templateData,
            item,
        });
    })
    // Add product to cart
    .post((req, res) => {
        const { id } = req.params;

        if (!req.cid) {
            return res
                .setHeader("HX-Redirect", `/login?redirect=/products/${id}`)
                .status(401)
                .send("Unauthorized");
        }

        const item = getProduct(Number(id));

        try {
            insertCart(req.cid, Number(id), 1);
        } catch (error) {
            if (error === StockError) {
                return res.setHeader(
                    "HX-Trigger",
                    JSON.stringify({
                        toast: {
                            msg: `Not enough ${item?.name} in stock`,
                            color: "red",
                        },
                    }),
                ).send();
            }
        }
        

        res.setHeader(
            "HX-Trigger",
            JSON.stringify({
                toast: {
                    msg: `Added ${item?.name} to cart`,
                    color: "green",
                },
            }),
        ).send();
    });

router.get("/cart", (req, res) => {
    if (!req.cid) {
        return res.render("cart", {
            ...req.templateData,
            items: [],
            total: 0,
        });
    }

    const items = getCartWithProducts(req.cid);

    console.log(items);

    res.render("cart", {
        ...req.templateData,
        items,
        total: items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0),
        isEmpty: items.length === 0,
    });
});

router.route("/cart/:id").post((req, res) => {
    if (!req.cid) {
        return res.redirect("/login?redirect=/cart");
    }

    const { id } = req.params;

    const item = getProduct(Number(id));

    if (!item) {
    }
}).delete((req, res) => {
    if (!req.cid) {
        return res.redirect("/login?redirect=/cart");
    }

    const { id } = req.params;

    deleteCartEntry(req.cid, Number(id));

    const items = getCartWithProducts(req.cid);

    res.setHeader('HX-Location', '/cart').send();
})
.patch((req, res) => {
    if (!req.cid) {
        return res.redirect("/login?redirect=/cart");
    }

    const { id } = req.params;

    const { quantity } = req.body;

    if (quantity <=0) {
        deleteCartEntry(req.cid, Number(id));

        return res.setHeader('HX-Location', '/cart').send();
    }

    try {
        updateCartEntry(req.cid, Number(id), Number(quantity));
    } catch (error) {
        if (error === StockError) {
            const item = getCartEntryWithProduct(req.cid, Number(id));
        
            const total = getCartTotal(req.cid);

            return res.setHeader(
                "HX-Trigger",
                JSON.stringify({
                    toast: {
                        msg: `Not enough ${item?.name} in stock`,
                        color: "red",
                    },
                }),
            ).render("minis/cart_count_change", {
                ...req.templateData,
                item,
                total,
                layout: false,
            });
        }

        console.log({error})
    }

    const item = getCartEntryWithProduct(req.cid, Number(id));

    const total = getCartTotal(req.cid);

    res.setHeader(
        'HX-Trigger',
        JSON.stringify({
            toast: {
                msg: `Updated ${item?.name} quantity`,
                color: "green",
            },
        }),
    )

    res.render("minis/cart_count_change", {
        ...req.templateData,
        item,
        total,
        layout: false,
    });
})

// =======================
// Account
// =======================

router
    .route("/login")
    .get((req, res) => {
        if (req.user) {
            return res.redirect("/");
        }

        res.render("login", {
            ...req.templateData,
            register: false,
        });
    })
    .post((req, res) => {
        const { username, password } = req.body;

        // get redirect url from query param
        const redirectUrl = req.query.redirect ? `${req.query.redirect}` : "/";

        console.log("login", username, password);

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

        const hashedPassword = hashMD5(password);

        if (user?.password_hash === hashedPassword) {
            res.cookie("cid", user.id, {
                maxAge: 1000 * 60 * 60 * 24 * 365,
                signed: true,
            });

            console.log("redirect", redirectUrl);
            res.setHeader("HX-Redirect", redirectUrl);
            return res.send(
                `Redirecting to ${redirectUrl}<br><a href="${redirectUrl}">Click here if you are not redirected</a>`,
            );
        }

        res.render("login", {
            ...req.templateData,
            register: false,
            layout: false,
            error: "Invalid username or password",
            username,
            password,
        });
    });

router
    .route("/register")
    .get((req, res) => {
        if (req.user) {
            return res.redirect("/");
        }

        res.render("login", {
            ...req.templateData,
            register: true,
        });
    })
    .post((req, res) => {
        const { username, password } = req.body;

        console.log("login", username, password);

        if (!req.cid) {
            return res.render("login", {
                ...req.templateData,
                register: true,
                layout: false,
                error: "Technical error",
                username,
                password,
            });
        }

        if (!username || !password) {
            return res.render("login", {
                ...req.templateData,
                register: true,
                layout: false,
                error: "Missing username or password",
                username,
                password,
            });
        }

        const user = getUserByUsername(username);

        if (user) {
            return res.render("login", {
                ...req.templateData,
                register: true,
                layout: false,
                error: "Username already taken",
                username,
                password,
            });
        }

        const hashedPassword = hashMD5(password);

        insertUser(req.cid, username, hashedPassword);

        res.render("login", {
            ...req.templateData,
            register: true,
            layout: false,
            successful: true,
        });
    });

router.get("/logout", (req, res) => {
    res.clearCookie("cid");
    res.redirect("/");
});

router.get("/fill-db", (req, res) => {});
