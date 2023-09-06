import { Router } from 'express';
import { readdir } from 'fs';
import { writeFile } from 'fs/promises';
import multer from 'multer';
import path from 'path';
import { getAllSecureUsers, deleteUser, promoteUser, demoteUser, getAllProducts, updateProduct, insertProduct } from '../database.js';

const storage = multer.memoryStorage()
const upload = multer({ storage: storage,fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        cb(null, true);
    } else {
        cb(null, false);
        return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
} });

// @ts-ignore
const uploadDir = path.join(path.dirname(import.meta.url.substring(8)), '../../upload');

export const adminRouter = Router();

adminRouter.use((req, res, next) => {
    if (!req.user) {
        res.redirect('/login');
    } else if (!req.user.admin) {
        return res.render('layouts/main', {
            ...req.templateData,
            layout: false,
            body: '<h1>You are not an admin</h1> <link rel="stylesheet" href="/styles/home.css"> <style> main { display: flex; justify-content: center; align-items: center; height: 100vh; color: red; } </style>',
        })
    } else {
        req.templateData = {
            ...req.templateData,
            layout: 'admin'
        }
        next();
    }
});

adminRouter.get('/', (req, res) => {
    const users = getAllSecureUsers();


    res.render('admin_home', {
        ...req.templateData,
        users,
    })
})

adminRouter.get('/users', (req, res) => {
    const users = getAllSecureUsers();
    const normUsers = users.filter((user)=> user.admin === 0)
    const adminUsers = users.filter((user)=> user.admin === 1)
    res.render('admin_users', {
        ...req.templateData,
        normUsers,
        adminUsers,
        users
    })
})

adminRouter.delete("/delete_user/:id", (req, res) => {
    const { id } = req.params;
    deleteUser(id);

    res.setHeader('HX-Location', '/admin/users').send();
})

adminRouter.post("/demote_user/:id", (req, res) => {
    const { id } = req.params;
    demoteUser(id);

    res.setHeader('HX-Location', '/admin').send();
})

adminRouter.post("/demote_users/:id", (req, res) => {
    const { id } = req.params;
    demoteUser(id);

    res.setHeader('HX-Location', '/admin/users').send();
})

adminRouter.post("/promote_user/:id", (req, res) => {
    const { id } = req.params;
    promoteUser(id);

    res.setHeader('HX-Location', '/admin/users').send();
})

adminRouter.get('/products', (req, res) => {
    const products = getAllProducts();
    res.render('admin_products', {
        ...req.templateData,
        products,
    })
})

adminRouter.post("/update_product/:id", (req, res) => {
    //res.setHeader("HX-Location", "/admin/products").send();
    console.log(req.body);

    const { id } = req.params;
    const 
        name = req.body[`name-${id}`], 
        stock = req.body[`stock-${id}`],
        price = req.body[`price-${id}`],
        description = req.body[`desc-${id}`],
        category = req.body[`category-${id}`];
    console.log(Number(id), name, stock, price, description, category);
    updateProduct(Number(id), name, stock, price, description, category);

    
    res.setHeader("HX-Location", "/admin/products").send();
})


adminRouter.post("/add_product", upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No image were uploaded.');
    }

    req.file.buffer
    console.log(req.body)

    const name = req.body["new-name"],
        description = req.body["new-desc"],
        category = req.body["new-category"],
        price = req.body["new-price"],
        stock = req.body["new-stock"];

    const productId = insertProduct(name, stock, price, description, category);

    await writeFile(`${uploadDir}/${productId}.jpg`, req.file.buffer);

    res.setHeader("HX-Location", "/admin/products").send();
})