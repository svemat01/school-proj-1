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
 * @property {0 | 1} admin
 */

/**
 * @typedef {Omit<User, 'password_hash'>} SecureUser
 */

/**
 * @typedef {Object} Cart
 * @property {number} id
 * @property {string} cid - client id
 * @property {number} product_id
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
            cid TEXT NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
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
    const getAllProductsStmt = prepare(`
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
 * @param {0 | 1} admin whether user is admin
 */
export const insertUser = (id, username, password_hash, admin = 0) => {
    /** @type {!import('better-sqlite3').Statement<User>} */
    const insertUserStmt = prepare(`
        INSERT INTO users VALUES (@id, @username, @password_hash, @admin)
    `);

    console.log({ id, username, password_hash, admin });

    insertUserStmt.run({ id, username, password_hash, admin });
};

/**F
 * Get a user from the database
 * @param {string} id id of user
 * @returns {User | undefined} user
 */
export const getUser = (id) => {
    /** @type {!import('better-sqlite3').Statement<string>} */
    const getUserStmt = prepare(`
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
    const getSecureUserStmt = prepare(`
        SELECT id, username, admin FROM users WHERE id = ?
    `);

    return /** @type {Omit<User, 'password_hash'> | undefined} */ (
        getSecureUserStmt.get(id)
    );
};

/**
 * Get a user by username from the database
 * @param {string} username username of user
 * @returns {User | undefined} user
 */
export const getUserByUsername = (username) => {
    /** @type {!import('better-sqlite3').Statement<string>} */
    const getUserByUsernameStmt = prepare(`
        SELECT * FROM users WHERE username = ?
    `);

    return /** @type {User | undefined} */ (
        getUserByUsernameStmt.get(username)
    );
};

/**
 * Get all users
 */
export const getAllSecureUsers = () => {
    /** @type {!import('better-sqlite3').Statement} */
    const getAllSecureUsersStmt = prepare(`
        SELECT id, username, admin FROM users
    `);

    return /** @type {SecureUser[]} */ (getAllSecureUsersStmt.all());
};

/**
 * Delete a specific user
 * @param {string} cid id of user
 */
export const deleteUser = (cid) => {
    /** @type {!import('better-sqlite3').Statement<string>} */
    const deleteUserStmt = prepare(`
        DELETE FROM users WHERE id = ?
    `);

    deleteUserStmt.run(cid);
}

/**
 * Promote a specific user
 * @param {string} cid id of user
 */
 export const promoteUser = (cid) => {
    /** @type {!import('better-sqlite3').Statement<string>} */
    const promoteUserStmt = prepare(`
        UPDATE users SET admin = 1 WHERE id = ?
    `);

    promoteUserStmt.run(cid);
}

/**
 * Demote a specific user
 * @param {string} cid id of user
 */
 export const demoteUser = (cid) => {
    /** @type {!import('better-sqlite3').Statement<string>} */
    const demoteUserStmt = prepare(`
        UPDATE users SET admin = 0 WHERE id = ?
    `);

    demoteUserStmt.run(cid);
}


// =======================
// Carts
// =======================

export const StockError = new Error("Not enough stock");

/**
 * Insert a cart entry into the database
 * @param {string} cid id of user
 * @param {number} product_id id of product
 * @param {number} quantity quantity of product
 */
export const insertCart = (cid, product_id, quantity) => {
    /** @type {!import('better-sqlite3').Statement<{ cid: string, product_id: number }>} */
    const alreadyInCartStmt = prepare(`
        SELECT carts.id, carts.quantity, products.stock
        FROM carts
        INNER JOIN products ON carts.product_id = products.id
        WHERE cid = @cid AND product_id = @product_id
    `);

    const alreadyInCart =
        /** @type {Pick<Cart, 'id' | 'quantity'> & Pick<Product, 'stock'> | undefined} */ (
            alreadyInCartStmt.get({ cid, product_id })
        );

    if (alreadyInCart) {
        /** @type {!import('better-sqlite3').Statement<Pick<Cart, 'id' | 'quantity'>>} */
        const updateCartStmt = prepare(`
            UPDATE carts SET quantity = @quantity WHERE id = @id
        `);

        const newQuantity = alreadyInCart.quantity + quantity;

        if (newQuantity > alreadyInCart.stock) throw StockError;

        return updateCartStmt.run({
            id: alreadyInCart.id,
            quantity: alreadyInCart.quantity + quantity,
        });
    }

    /** @type {!import('better-sqlite3').Statement<Pick<Cart, 'cid' | 'product_id' | 'quantity'>>} */
    const insertCartStmt = prepare(`
        INSERT INTO carts (cid, product_id, quantity)
        VALUES (@cid, @product_id, @quantity)
    `);

    insertCartStmt.run({ cid, product_id, quantity });
};

/**
 * Delete a cart entry from the database
 * @param {string} cid id of user
 * @param {number} id id of cart
 */
export const deleteCartEntry = (cid, id) => {
    /** @type {!import('better-sqlite3').Statement<{ cid: string, id: number }>} */
    const deleteCartEntryStmt = prepare(`
        DELETE FROM carts WHERE cid = @cid AND id = @id
    `);

    deleteCartEntryStmt.run({ cid, id });
};

/**
 * Delete all cart entries for a user
 * @param {string} cid id of user
 */
export const deleteCart = (cid) => {
    /** @type {!import('better-sqlite3').Statement<string>} */
    const deleteCartStmt = prepare(`
        DELETE FROM carts WHERE cid = ?
    `);

    deleteCartStmt.run(cid);
};

/**
 * Get cart entry for a user and product
 * @param {string} cid id of user
 * @param {number} id id of cart
 * @returns {Cart | undefined} cart entry
 */
export const getCartEntry = (cid, id) => {
    /** @type {!import('better-sqlite3').Statement<{ cid: string, id: number }>} */
    const getCartEntryStmt = prepare(`
        SELECT * FROM carts WHERE cid = @cid AND id = @id
    `);

    return /** @type {Cart | undefined} */ (
        getCartEntryStmt.get({
            cid,
            id,
        })
    );
};

/**
 * Get cart entry for a user and product with product data
 * @param {string} cid id of user
 * @param {number} id id of cart
 * @returns {(Cart & Product) | undefined} cart entry
 */
export const getCartEntryWithProduct = (cid, id) => {
    /** @type {!import('better-sqlite3').Statement<{ cid: string, id: number }>} */
    const getCartEntryWithProductStmt = prepare(`
        SELECT carts.*, products.name, products.stock, products.price, products.description FROM carts
        INNER JOIN products ON carts.product_id = products.id
        WHERE cid = @cid AND carts.id = @id
    `);

    return /** @type {(Cart & Omit<Product, 'id'>) | undefined} */ (
        getCartEntryWithProductStmt.get({ cid, id })
    );
};

/**
 * Get all cart entries for a user
 * @param {string} cid id of user
 * @returns {Omit<Cart, 'product'>[]} cart entries
 */
export const getCart = (cid) => {
    /** @type {!import('better-sqlite3').Statement<string>} */
    const getCartStmt = prepare(`
        SELECT * FROM carts WHERE cid = ?
    `);

    return /** @type {Omit<Cart, 'product'>[]} */ (getCartStmt.all(cid));
};

/**
 * Get all cart entries for a user with products data
 * @param {string} cid id of user
 * @returns {(Cart & Product)[]} cart entries
 */
export const getCartWithProducts = (cid) => {
    /** @type {!import('better-sqlite3').Statement<string>} */
    const getCartWithProductStmt = prepare(`
        SELECT carts.*, products.name, products.stock, products.price, products.description FROM carts
        INNER JOIN products ON carts.product_id = products.id
        WHERE cid = ?
    `);

    return /** @type {(Cart & Omit<Product, 'id'>)[]} */ (
        getCartWithProductStmt.all(cid)
    );
};

/**
 * Update cart entry quantity
 * @param {string} cid id of user
 * @param {number} id id of cart
 * @param {number} quantity new quantity
 */
export const updateCartEntry = (cid, id, quantity) => {
    // Throw StockError if quantity is greater than stock
    /** @type {!import('better-sqlite3').Statement<{ cid: string, id: number }>} */
    const getCartEntryStmt = prepare(`
        SELECT carts.quantity, products.stock FROM carts
        INNER JOIN products ON carts.product_id = products.id
        WHERE cid = @cid AND carts.id = @id
    `);

    const cartEntry =
        /** @type {Pick<Cart, 'quantity'> & Pick<Product, 'stock'> | undefined} */ (
            getCartEntryStmt.get({ cid, id })
        );

    if (cartEntry && quantity > cartEntry.stock) throw StockError;

    /** @type {!import('better-sqlite3').Statement<{ cid: string, id: number, quantity: number }>} */
    const updateCartEntryStmt = prepare(`
        UPDATE carts SET quantity = @quantity WHERE cid = @cid AND id = @id
    `);

    updateCartEntryStmt.run({ cid, id, quantity });
};

/**
 * Get cart total
 * @param {string} cid id of user
 * @returns {number} total
 */
export const getCartTotal = (cid) => {
    /** @type {!import('better-sqlite3').Statement<string>} */
    const getCartTotalStmt = prepare(`
        SELECT SUM(products.price * carts.quantity) AS total FROM carts
        INNER JOIN products ON carts.product_id = products.id
        WHERE cid = ?
    `);

    return /** @type {{total: number}} */ (getCartTotalStmt.get(cid)).total;
};

