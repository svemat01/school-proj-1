import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";

export const DB = Database("database.db");

// define the tables as typescript types using jsdoc

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {number} stock
 * @property {number} price
 * @property {string} description
 * @property {string} category
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
 * @typedef {Object} Order
 * @property {number} id
 * @property {string} oid - order id
 * @property {string} cid - client id
 * @property {number} product_id
 * @property {number} quantity
 * @property {string} price
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
            description TEXT NOT NULL,
            category TEXT NOT NULL
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

    // An order should have a user id, the products they ordered, and the quantity of each product, and the total price
    const setupOrdersTable = DB.prepare(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            oid TEXT NOT NULL,
            cid TEXT NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price INTEGER NOT NULL,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `);

    setupOrdersTable.run();
};

// =======================
// #region Products

/**
 * Insert or update a product into the database
 * @param {string} name name of product
 * @param {number} stock number of products in stock
 * @param {number} price price of product
 * @param {string} description description of product
 * @param {string} category category of product
 */
export const insertProduct = (name, stock, price, description, category) => {
    /** @type {!import('better-sqlite3').Statement<Omit<Product, 'id'>>} */
    const insertProductStmt = prepare(`
        INSERT INTO products (name, stock, price, description, category) VALUES (@name, @stock, @price, @description, @category);
    `);

    insertProductStmt.run({ name, stock, price, description, category });
};
/**
* Update product into the database
* @param {number} id id of product
* @param {string} name name of product
* @param {number} stock number of products in stock
* @param {number} price price of product
* @param {string} description description of product
* @param {string} category category of product
*/
export const updateProduct = (id, name, stock, price, description, category) => {
    /** @type {!import('better-sqlite3').Statement<Omit<Product, ''>>}*/
    const updateProductStmt = prepare(`
        UPDATE products SET name = @name, stock = @stock, price = @price, description = @description, category = @category WHERE id = @id;
    `);

    updateProductStmt.run({ id, name, stock, price, description, category });
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

/**
* Get all products from the database
* @param {string} search search term
* @param {number} limit number of products to get
* @returns {Product[]} products
*/
export const searchProducts = (search, limit = 25) => {
    /** @type {!import('better-sqlite3').Statement<{ search: string, limit: number }>} */
    const searchProductsStmt = prepare(`
        SELECT * FROM products WHERE name LIKE '%' || @search || '%' LIMIT @limit
    `);

    return /** @type {Product[]} */ (searchProductsStmt.all({
        search,
        limit,
    }));
};

/**
 * Filter products from the database by category, search term, and sort.
 * All params are optional.
 * @param {string} [category] category of product
 * @param {string} [search] search term
 * @param {string} [sort] sort by
 * @param {number} [limit] number of products to get
 * @returns {Product[]} products
 */
export const filterProducts = (category, search, sort, limit = 25) => {
    /** @type {!import('better-sqlite3').Statement<{ category?: string, search?: string, limit?: number }>} */
    const filterProductsStmt = prepare(`
        SELECT * FROM products 
        ${category ? "WHERE category = @category" : ""}
        ${search ? category && search ? "AND" : "WHERE" + " name LIKE '%' || @search || '%'" : ""}
        ${sort ? `ORDER BY ${sort}` : ""}
        LIMIT @limit
    `);

    return /** @type {Product[]} */ (
        filterProductsStmt.all({
            category,
            search,
            limit,
        })
    );

};

// #endregion Products
// =======================

// =======================
// #region Users

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
 * Get total amount of users
 */
export const getUserCount = () => {
    /** @type {!import('better-sqlite3').Statement} */
    const getUserCountStmt = prepare(`
        SELECT COUNT(*) AS user_count FROM users
    `);

    return /** @type {{user_count: number}} */ (getUserCountStmt.get())
}

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
};

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
};

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
};

// #endregion Users
// =======================

// =======================
// #region Carts

export class StockError extends Error {
    /**
     * @param {string} message
     * @param {number} productId
     */
    constructor(message, productId) {
        super(message);
        this.name = "StockError";
        this.productId = productId;
    }
}

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

        if (newQuantity > alreadyInCart.stock) throw new StockError('Not enough stock', product_id);

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

    if (cartEntry && quantity > cartEntry.stock) throw new StockError("Not enough stock", id);

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

/**
 * 
 * @param {string} cid id of user
 * @returns {number} total entries
 */
export const getCartCount = (cid) => {
    /** @type {!import('better-sqlite3').Statement<string>} */
    const getCartCountStmt = prepare(`
        SELECT COUNT(*) AS total FROM carts
        WHERE cid = ?
    `);

    return /** @type {{total: number}} */ (getCartCountStmt.get(cid)).total;
}

// #endregion Carts
// =======================

// =======================
// #region Orders

/**
 * Turn a cart into an order
 * @param {string} cid id of user
 */
export const cartToOrder = (cid) => {
    /** @type {!import('better-sqlite3').Statement<{oid: string, cid: string}>} */

    // Get cart entries and also their product price
    // Insert into orders table
    // Delete cart entries
    const cartToOrderStmt = prepare(`
        INSERT INTO orders (oid, cid, product_id, quantity, price)
        SELECT @oid, @cid, carts.product_id, carts.quantity, products.price FROM carts
        INNER JOIN products ON carts.product_id = products.id
        WHERE cid = @cid
    `);

    const trans = DB.transaction(() => {
        // check if cart quantity is lesser than stock
        /** @type {!import('better-sqlite3').Statement<string>} */
        const checkCartStmt = prepare(`
            SELECT carts.quantity, products.stock, products.id, products.price FROM carts
            INNER JOIN products ON carts.product_id = products.id
            WHERE cid = ?
        `);

        const cart =
            /** @type {(Pick<Cart, 'quantity'> & Pick<Product, 'stock' | 'id' | 'price'>)[]} */ (
                checkCartStmt.all(cid)
            );

        for (const { quantity, stock, id } of cart) {
            if (quantity > stock) throw new StockError("Not enough stock", id);
        }

        const oid = uuidv4();
        console.log(oid);

        cartToOrderStmt.run({ oid: oid, cid });

        /** @type {!import('better-sqlite3').Statement<{quantity: number, id: number}>}*/
        const decrementStockStmt = prepare(`
                UPDATE products SET stock = stock - @quantity WHERE id = @id
            `);

        for (const { quantity, id } of cart) {
            // decrement stock by quantity
            decrementStockStmt.run({ quantity, id });
        }

        deleteCart(cid);
    });

    trans();
};

/**
 * Get order metrics
 * gets how many of each product have been sold and its average price
 * also get a sum of all the orders (price * quantity) for each order
 */
export const getOrderMetrics = () => {
    /** @type {!import('better-sqlite3').Statement}*/
    const getOrderMetricsStmt = prepare(`
        SELECT products.name, products.description, SUM(orders.quantity) AS quantity, AVG(orders.price) AS price, SUM(orders.price * orders.quantity) AS total FROM orders
        INNER JOIN products ON orders.product_id = products.id
        GROUP BY orders.product_id
    `);

    return /** @type {{name: string, description: string, quantity: number, price: number, total: number}[]} */ (
        getOrderMetricsStmt.all()
    );
}

/**
 * Get orders for a user
 * @param {string} cid id of user
 * @returns {string[]} order ids
 */
//get only unique order ids
export const getOrdersForUser = (cid) => {
    /** @type {!import('better-sqlite3').Statement<string>} */
    const getOrdersStmt = prepare(`
        SELECT DISTINCT oid FROM orders WHERE cid = ?
    `);

    return /** @type {string[]} */ (
        /** @type {Pick<Order, 'oid'>[]} */ (getOrdersStmt.all(cid)).map(
            (order) => order.oid,
        )
    );
};

/**
 * Get order for a user
 * @param {string} cid id of user
 * @param {string} oid id of order
 */
export const getOrder = (cid, oid) => {
    /** @type {!import('better-sqlite3').Statement<{cid: string, oid: string}>}*/
    const getOrderStmt = prepare(`
        SELECT orders.*, products.name, products.description FROM orders
        INNER JOIN products ON orders.product_id = products.id
        WHERE cid = @cid AND oid = @oid
    `);

    // return /** @type {(Order & Pick<Product, 'name' | 'stock'>)[]} */ (
    //     /** @type {Pick<Order, 'oid'>[]} */ (getOrderStmt.all(cid)).map(
    //         (order) => order.oid,
    //     )
    // );

    const orderEntries =
        /** @type {(Order & Pick<Product, 'name' | 'description'>)[]} */ (
            getOrderStmt.all({ cid, oid })
        );

    return orderEntries.map((order) => ({
        name: order.name,
        description: order.description,
        quantity: order.quantity,
        price: order.price,
    }));
};
