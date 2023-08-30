import { Router } from 'express';
import { getAllSecureUsers } from '../database.js';

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
adminRouter.get('/admin_users', (req, res) => {
    res.render('admin_users', {
        ...req.templateData,
    })
})