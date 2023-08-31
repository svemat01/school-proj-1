import { Router } from 'express';
import { getAllSecureUsers, deleteUser, promoteUser, demoteUser, getAllProducts } from '../database.js';

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
    const adminUsers = users.filter((user)=> user.admin === 1)
    res.render('admin_home', {
        ...req.templateData,
        adminUsers,
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