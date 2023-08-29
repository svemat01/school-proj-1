import Database from "better-sqlite3";

export const DB = Database("database.db");

// define the tables as typescript types using jsdoc

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {number} stock
 * @property {number} price
 * @property {string} description
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} password_hash
 * @property {boolean} admin
 */

/**
 * @typedef {Omit<User, 'password_hash'>} SecureUser
 */

/**
 * @typedef {Object} Cart
 * @property {number} id
 * @property {string} user_id
 * @property {number} product_id
 * @property {Product} product
 * @property {User} user
 * @property {number} quantity
 */

/**
 * @type {Map<string, import('better-sqlite3').Statement>}
 */
const prepareCache = new Map();

/**
 * Returns a new instance of Statement with the specified type parameter.
 * @template T - The type of the parameters for the statement.
 * @param {string} query - The SQL query string.
 * @returns {import('better-sqlite3').Statement<T extends unknown[] | {} ? T : never>} A new instance of Statement.
 */
export const prepare = (query) => {
    if (prepareCache.has(query)) {
        return /** @type {!import('better-sqlite3').Statement<T extends unknown[] | {} ? T : never>} */ (
            prepareCache.get(query)
        );
    }

    /** @type {!import('better-sqlite3').Statement<T extends unknown[] | {} ? T : never>} */
    const stmt = DB.prepare(query);
    prepareCache.set(query, stmt);
    return stmt;
};

export const setupDB = () => {
    const setupProductsTable = DB.prepare(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            stock INTEGER NOT NULL,
            price INTEGER NOT NULL,
            description TEXT NOT NULL
        )
    `);

    setupProductsTable.run();

    const setupUsersTable = DB.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY NOT NULL,
            username TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            admin BOOLEAN NOT NULL DEFAULT FALSE
        )
    `);

    setupUsersTable.run();

    const setupCartsTable = DB.prepare(`
        CREATE TABLE IF NOT EXISTS carts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `);

    setupCartsTable.run();
};

// =======================
// Products
// =======================

/**
 * Insert a product into the database
 * @param {string} name name of product
 * @param {number} stock number of products in stock
 * @param {number} price price of product
 * @param {string} description description of product
 */
export const insertProduct = (name, stock, price, description) => {
    /** @type {!import('better-sqlite3').Statement<Omit<Product, 'id'>>} */
    const insertProductStmt = prepare(`
        INSERT INTO products (name, stock, price, description) VALUES (@name, @stock, @price, @description)
    `);

    insertProductStmt.run({ name, stock, price, description });
};

/**
 * Get a product from the database
 * @param {number} id id of product
 * @returns {Product | undefined} product
 */
export const getProduct = (id) => {
    const getProductStmt = prepare(`SELECT * FROM products WHERE id = ?`);

    return /** @type {Product | undefined} */ (getProductStmt.get(id));
};

/**
 * Get all products from the database
 * @param {number} limit number of products to get
 * @param {number} offset number of products to skip
 * @returns {Product[]} products
 */
export const getAllProducts = (limit = 25, offset = 0) => {
    /** @type {!import('better-sqlite3').Statement<{ limit: number, offset: number }>} */
    const getAllProductsStmt = DB.prepare(`
        SELECT * FROM products LIMIT @limit OFFSET @offset 
    `);

    return /** @type {Product[]} */ (getAllProductsStmt.all({ limit, offset }));
};

// =======================
// Users
// =======================

/**
 * Insert a user into the database
 * @param {string} id id of user
 * @param {string} username username of user
 * @param {string} password_hash password hash of user
 * @param {boolean} admin whether user is admin
 */
export const insertUser = (id, username, password_hash, admin = false) => {
    /** @type {!import('better-sqlite3').Statement<User>} */
    const insertUserStmt = DB.prepare(`
        INSERT INTO users (id, username, password_hash, admin) VALUES (@id, @username, @password_hash, @admin)
    `);

    insertUserStmt.run({ id, username, password_hash, admin });
};

/**
 * Get a user from the database
 * @param {string} id id of user
 * @returns {User | undefined} user
 */
export const getUser = (id) => {
    /** @type {!import('better-sqlite3').Statement<string>} */
    const getUserStmt = DB.prepare(`
        SELECT * FROM users WHERE id = ?
    `);

    return /** @type {User | undefined} */ (getUserStmt.get(id));
};

/**
 * Get secure user from the database
 * @param {string} id username of user
 * @returns {Omit<User, 'password_hash'> | undefined} user
 */
export const getSecureUser = (id) => {
    /** @type {!import('better-sqlite3').Statement<string>} */
    const getSecureUserStmt = DB.prepare(`
        SELECT id, username, admin FROM users WHERE id = ?
    `);

    return /** @type {Omit<User, 'password_hash'> | undefined} */ (
        getSecureUserStmt.get(id)
    );
}

/**
 * Get a user by username from the database
 * @param {string} username username of user
 * @returns {User | undefined} user
 */
export const getUserByUsername = (username) => {
    /** @type {!import('better-sqlite3').Statement<string>} */
    const getUserByUsernameStmt = DB.prepare(`
        SELECT * FROM users WHERE username = ?
    `);

    return /** @type {User | undefined} */ (getUserByUsernameStmt.get(username));
}
