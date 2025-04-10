import {jest, describe, test, expect, beforeAll, beforeEach, afterEach,afterAll } from "@jest/globals";
import db from "../src/db/db";
import { app } from "../index"
import CartDAO from "../src/dao/cartDAO";
import { Role, User } from "../src/components/user";
import { Category, Product } from "../src/components/product";
import { Cart, ProductInCart } from "../src/components/cart";
import dayjs from "dayjs";
import { CartNotFoundError, EmptyCartError } from "../src/errors/cartError";
import { ProductNotFoundError } from "../src/errors/productError";
import request from 'supertest'
import { cleanup } from "../src/db/cleanup";
const baseURL = "/ezelectronics"
// jest.mock("crypto")
// jest.mock("../src/db/db.ts")


// 1. Defines the base route path, a user object, and a string for storing the cookie
const admin = { username: "admin_test", name: "admin_test", surname: "admin_test", password: "admin_test", role: "Admin" }
const customer = { username: "customer_test", name: "customer_test", surname: "customer_test", password: "customer_test", role: "Customer" }
const manager = { username: "manager_test", name: "manager_test", surname: "manager_test", password: "manager_test", role: "Manager" }

let adminCookie: string
let customerCookie: string
let managerCookie: string

// 2. Defines a function that calls the POST route for creating a new user
const postUser = async (userInfo: any) => {
    await request(app)
        .post(`${baseURL}/users`)
        .send(userInfo)
        .expect(200)
}

// 3. Defines a function that performs login and returns the cookie
const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${baseURL}/sessions`)
            .send(userInfo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.header["set-cookie"][0])
            })
    })
}
describe("All Cart Integration Test",()=>{
describe("CartDAO", () => {
    beforeAll((done) => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY UNIQUE,
            name TEXT,
            surname TEXT,
            role TEXT,
            password REAL,
            salt TEXT
        )`);
        db.serialize(() => {
            db.run("DELETE FROM products_in_cart");
            db.run("DELETE FROM products");
            db.run("DELETE FROM carts");
            db.run("DELETE FROM users", done);
        });
    });

    beforeEach((done) => {
        const sqlUser = "INSERT INTO users (username, name, surname, role, password, salt) VALUES ('Paciok', 'Francesco_Maria', 'Travaglio', 'Customer', 'aa', 'aa')";
        db.run(sqlUser, done);
    });

    afterEach((done) => {
        db.serialize(() => {
            db.run("DELETE FROM products_in_cart");
            db.run("DELETE FROM products");
            db.run("DELETE FROM carts");
            db.run("DELETE FROM users", done);
        });
    });
    
    describe("AddProduct", () => {
        test("addProduct, empty Cart", async () => {
            await new Promise<void>((resolve, reject) => {
                const sql1 = "INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')";
                db.run(sql1, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            const Dao = new CartDAO();
            const a = await Dao.addProduct("Paciok", "ModelX");
            expect(a).toBe(true);
        });

        test("addProduct, existent Cart", async () => {
            let cartId:number;
            await new Promise<void>((resolve, reject) => {
                const sqlProduct = "INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')";
                db.run(sqlProduct, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            await new Promise<void>((resolve, reject) => {
                const sqlCart = "INSERT INTO carts (customer, paid, paymentDate, total) VALUES ('Paciok', false, '2023-06-10', 0)";
                db.run(sqlCart, function (err) {
                    if (err) return reject(err);
                    cartId = this.lastID;
                    resolve();
                });
            });

            await new Promise<void>((resolve, reject) => {
                const sqlProductInCart = "INSERT INTO products_in_cart (cartId, model, quantity, category, price) VALUES (?, 'ModelX', 1, 'Appliance', 199.99)";
                db.run(sqlProductInCart, [cartId], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            const Dao = new CartDAO();
            const result = await Dao.addProduct('Paciok', 'ModelX');
            expect(result).toBe(true);
        });
    });

    describe("GetCart", () => {
        test("Get Empty Cart", async () => {
            const emptyCart = new Cart("Paciok", false, "null", 0, []);
            const Dao = new CartDAO();
            const result = await Dao.getCart("Paciok");
            expect(result.customer).toEqual("Paciok");
            expect(result.paid).toEqual(false);
            expect(result.paymentDate).toEqual(null);
            expect(result.total).toEqual(0);
            expect(result.products).toEqual([]);
        });

        test("Get non-empty Cart", async () => {
            let cartId:number;
            await new Promise<void>((resolve, reject) => {
                const sqlProduct = "INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')";
                db.run(sqlProduct, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            await new Promise<void>((resolve, reject) => {
                const sqlCart = "INSERT INTO carts (customer, paid, paymentDate, total) VALUES ('Paciok', false, '2024-06-12', 0)";
                db.run(sqlCart, function (err) {
                    if (err) return reject(err);
                    cartId = this.lastID;
                    resolve();
                });
            });

            await new Promise<void>((resolve, reject) => {
                const sqlProductInCart = "INSERT INTO products_in_cart (cartId, model, quantity, category, price) VALUES (?, 'ModelX', 1, 'Appliance', 199.99)";
                db.run(sqlProductInCart, [cartId], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            const productIn = new ProductInCart("ModelX", 1, Category.APPLIANCE, 199.99);
            const nonemptyCart = new Cart("Paciok", false, "2024-06-12", 0, [productIn]);

            const Dao = new CartDAO();
            const result = await Dao.getCart("Paciok");
            expect(result).toEqual(nonemptyCart);
        });
    });

    describe("CheckoutCart", () => {
        beforeEach((done) => {
            db.serialize(() => {
                const sqlUser = "INSERT INTO users (username, name, surname, role, password, salt) VALUES ('Paciok', 'Francesco_Maria', 'Travaglio', 'Customer', 'aa', 'aa')";
                db.run(sqlUser, (err) => {
                    const sqlProduct = "INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')";
                    db.run(sqlProduct, (err) => {
                        if (err) return done(err);

                        const sqlCart = "INSERT INTO carts (customer, paid, paymentDate, total) VALUES ('Paciok', false, '2024-06-12', 0)";
                        db.run(sqlCart, function (err) {
                            if (err) return done(err);
                            done();
                        });
                    });
                });
            });
        });

        test("Checkout Empty Cart", async () => {
            const Dao = new CartDAO();
            await expect(Dao.checkoutCart("Paciok")).rejects.toThrow(EmptyCartError);
        });

        test("Checkout non-empty Cart with 1 element", async () => {
            let cartId:number;
            await new Promise<void>((resolve, reject) => {
                const sqlCart = "SELECT cartId FROM carts WHERE customer = 'Paciok'";
                db.get(sqlCart, (err, row:any) => {
                    if (err) return reject(err);
                    cartId = row.cartId;
                    resolve();
                });
            });

            await new Promise<void>((resolve, reject) => {
                const sqlProductInCart = "INSERT INTO products_in_cart (cartId, model, quantity, category, price) VALUES (?, 'ModelX', 1, 'Appliance', 199.99)";
                db.run(sqlProductInCart, [cartId], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            const Dao = new CartDAO();
            const result = await Dao.checkoutCart("Paciok");
            expect(result).toEqual(true);
        });
    });

    describe("Retrieve Carts", () => {
        beforeEach((done) => {
            db.serialize(() => {
                const sqlUser = "INSERT INTO users (username, name, surname, role, password, salt) VALUES ('Paciok', 'Francesco_Maria', 'Travaglio', 'Customer', 'aa', 'aa')";
                db.run(sqlUser, (err) => {
                    const sqlProduct = "INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')";
                    db.run(sqlProduct, (err) => {
                        if (err) return done(err);

                        const sqlCart = "INSERT INTO carts (customer, paid, paymentDate, total) VALUES ('Paciok', true, '2024-06-12', 199.99)";
                        db.run(sqlCart, (err) => {
                            if (err) return done(err);

                            const sqlCart1 = "INSERT INTO carts (customer, paid, paymentDate, total) VALUES ('Paciok', true, '2024-05-01', 199.99)";
                            db.run(sqlCart1, (err) => {
                                if (err) return done(err);
                                done();
                            });
                        });
                    });
                });
            });
        });

        test("Multiple Carts", async () => {
            let cartId1:number;
            let cartId2:number;
            await new Promise<void>((resolve, reject) => {
                const sqlCart = "SELECT cartId FROM carts WHERE customer = 'Paciok' AND paymentDate = '2024-06-12'";
                db.get(sqlCart, (err, row:any) => {
                    if (err) return reject(err);
                    cartId1 = row.cartId;
                    resolve();
                });
            });

            await new Promise<void>((resolve, reject) => {
                const sqlCart = "SELECT cartId FROM carts WHERE customer = 'Paciok' AND paymentDate = '2024-05-01'";
                db.get(sqlCart, (err, row:any) => {
                    if (err) return reject(err);
                    cartId2 = row.cartId;
                    resolve();
                });
            });

            await new Promise<void>((resolve, reject) => {
                const sqlProductInCart = "INSERT INTO products_in_cart (cartId, model, quantity, category, price) VALUES (?, 'ModelX', 1, 'Appliance', 199.99)";
                db.run(sqlProductInCart, [cartId1], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            await new Promise<void>((resolve, reject) => {
                const sqlProductInCart = "INSERT INTO products_in_cart (cartId, model, quantity, category, price) VALUES (?, 'ModelX', 1, 'Appliance', 199.99)";
                db.run(sqlProductInCart, [cartId2], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            const productIn = new ProductInCart("ModelX", 1, Category.APPLIANCE, 199.99);
            const cart1 = new Cart("Paciok", true, "2024-06-12", 199.99, [productIn]);
            const cart2 = new Cart("Paciok", true, "2024-05-01", 199.99, [productIn]);
            const carts = [cart1, cart2];
            const Dao = new CartDAO();
            const result = await Dao.retrieveCarts("Paciok");
            expect(result).toEqual(carts);
        });

        test("Empty Cart", async () => {
            await new Promise<void>((resolve, reject) => {
                const sqlDeleteProductsInCart = "DELETE FROM products_in_cart";
                db.run(sqlDeleteProductsInCart, [], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            const Dao = new CartDAO();
            await expect(Dao.retrieveCarts("Paciok")).rejects.toThrow(ProductNotFoundError);
        });
    });

    describe("RemoveFromCart", () => {
        test("Remove product from cart", async () => {
            let cartId:number;
            await new Promise<void>((resolve, reject) => {
                const sqlProduct = "INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')";
                db.run(sqlProduct, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            await new Promise<void>((resolve, reject) => {
                const sqlCart = "INSERT INTO carts (customer, paid, paymentDate, total) VALUES ('Paciok', false, '2024-06-12', 199.99)";
                db.run(sqlCart, function (err) {
                    if (err) return reject(err);
                    cartId = this.lastID;
                    resolve();
                });
            });

            await new Promise<void>((resolve, reject) => {
                const sqlProductInCart = "INSERT INTO products_in_cart (cartId, model, quantity, category, price) VALUES (?, 'ModelX', 1, 'Appliance', 199.99)";
                db.run(sqlProductInCart, [cartId], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            const Dao = new CartDAO();
            const result = await Dao.removeFromCart('Paciok', 'ModelX');
            expect(result).toBe(true);

            // Verify that the product has been removed
            const cart = await Dao.getCart('Paciok');
            expect(cart.products.length).toBe(0);
            expect(cart.total).toBe(0);
        });
    });

    describe("RemoveAllFromCart", () => {
        test("Remove all products from cart", async () => {
            let cartId:number;
            await new Promise<void>((resolve, reject) => {
                const sqlProduct = "INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')";
                db.run(sqlProduct, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            await new Promise<void>((resolve, reject) => {
                const sqlProduct1 = "INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelY', 'Appliance', 5, 'Latest model of Y', 199.99, '2023-05-01')";
                db.run(sqlProduct1, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            await new Promise<void>((resolve, reject) => {
                const sqlCart = "INSERT INTO carts (customer, paid, paymentDate, total) VALUES ('Paciok', false, '2024-06-12', 199.99)";
                db.run(sqlCart, function (err) {
                    if (err) return reject(err);
                    cartId = this.lastID;
                    resolve();
                });
            });

            await new Promise<void>((resolve, reject) => {
                const sqlProductInCart = "INSERT INTO products_in_cart (cartId, model, quantity, category, price) VALUES (?, 'ModelX', 1, 'Appliance', 199.99)";
                db.run(sqlProductInCart, [cartId], (err) => {
                    if (err) return reject(err);
                    const sqlProductInCart1 = "INSERT INTO products_in_cart (cartId, model, quantity, category, price) VALUES (?, 'ModelY', 1, 'Appliance', 199.99)";
                    db.run(sqlProductInCart1, [cartId], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            });

            const Dao = new CartDAO();
            const result = await Dao.removeAllfromCart('Paciok');
            expect(result).toBe(true);

            // Verify that the cart is empty
            const cart = await Dao.getCart('Paciok');
            expect(cart.products.length).toBe(0);
            expect(cart.total).toBe(0);
        });
    });

    describe("DeleteAllCarts", () => {
        test("Delete all carts", async () => {
            let cartId:number;
            await new Promise<void>((resolve, reject) => {
                db.run("INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')", (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            await new Promise<void>((resolve, reject) => {
                db.run("INSERT INTO carts (customer, paid, paymentDate, total) VALUES ('Paciok', false, '2024-06-12', 199.99)", function (err) {
                    if (err) return reject(err);
                    cartId = this.lastID;
                    const sqlProductInCart = "INSERT INTO products_in_cart (cartId, model, quantity, category, price) VALUES (?, 'ModelX', 1, 'Appliance', 199.99)";
                    db.run(sqlProductInCart, [cartId], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            });

            const Dao = new CartDAO();
            const result = await Dao.deleteAllCarts();
            expect(result).toBe(true);

            // Verify that all carts have been deleted
            const carts = await Dao.getAllCarts();
            expect(carts.length).toBe(0);
        });
    });

    describe("GetAllCarts", () => {
        test("Retrieve all carts", async () => {
            let cartId:number;
            await new Promise<void>((resolve, reject) => {
                db.run("INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')", (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            await new Promise<void>((resolve, reject) => {
                db.run("INSERT INTO carts (customer, paid, paymentDate, total) VALUES ('Paciok', false, '2024-06-12', 199.99)", function (err) {
                    if (err) return reject(err);
                    cartId = this.lastID;
                    const sqlProductInCart = "INSERT INTO products_in_cart (cartId, model, quantity, category, price) VALUES (?, 'ModelX', 1, 'Appliance', 199.99)";
                    db.run(sqlProductInCart, [cartId], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            });

            const Dao = new CartDAO();
            const carts = await Dao.getAllCarts();

            const productIn = new ProductInCart("ModelX", 1, Category.APPLIANCE, 199.99);
            const cart = new Cart("Paciok", false, "2024-06-12", 199.99, [productIn]);

            expect(carts.length).toBe(1);
            expect(carts[0]).toEqual(cart);
        });
    });
    describe("CartDAO Error Handling", () => {
        beforeAll((done) => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY UNIQUE,
                name TEXT,
                surname TEXT,
                role TEXT,
                password REAL,
                salt TEXT
            )`, done);
        });
    
    
        afterEach((done) => {
            db.serialize(() => {
                db.run("DELETE FROM products_in_cart");
                db.run("DELETE FROM products");
                db.run("DELETE FROM carts");
                db.run("DELETE FROM users", done);
            });
        });
    
        test("Checkout Empty Cart should throw EmptyCartError", async () => {
            const Dao = new CartDAO();
            await expect(Dao.checkoutCart("Paciok")).rejects.toThrow(EmptyCartError);
        });

    
        test("Add non-existent product to cart should throw ProductNotFoundError", async () => {
            const Dao = new CartDAO();
            await expect(Dao.addProduct("Paciok", "NonExistentProduct")).rejects.toThrow(ProductNotFoundError);
        });
    
        test("Retrieve Carts when no product in cart should throw ProductNotFoundError", async () => {
            let cartId: number;
            await new Promise<void>((resolve, reject) => {
                const sqlCart = "INSERT INTO carts (customer, paid, paymentDate, total) VALUES ('Paciok', true, '2024-06-12', 199.99)";
                db.run(sqlCart, function (err) {
                    if (err) return reject(err);
                    cartId = this.lastID;
                    resolve();
                });
            });
    
            const Dao = new CartDAO();
            await expect(Dao.retrieveCarts("Paciok")).rejects.toThrow(ProductNotFoundError);
        });
    });
});

describe("Cart : Routes + Controller + Dao + DB for customer", () => {
    beforeAll(async () => {
        // Create necessary tables if they don't exist
        await new Promise<void>((resolve, reject) => {
            db.run(
                `CREATE TABLE IF NOT EXISTS users (
                    username TEXT PRIMARY KEY UNIQUE,
                    name TEXT,
                    surname TEXT,
                    role TEXT,
                    password REAL,
                    salt TEXT
                )`,
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        await postUser(customer);
        customerCookie = await login(customer);
    }, 30000);

    afterEach((done) => {
        db.run("DELETE FROM products_in_cart");
        db.run("DELETE FROM products");
        db.run("DELETE FROM carts", done);
    });
    afterAll((done)=>{
        db.serialize(() => {
            db.run("DELETE FROM products_in_cart");
            db.run("DELETE FROM products");
            db.run("DELETE FROM carts");
            db.run("DELETE FROM users", done);
        });
    })

    test("Add product to cart", async () => {
        // Step 1: Add a product to the database
        await new Promise<void>((resolve, reject) => {
            const sql = `INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')`;
            db.run(sql, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Step 2: Add the product to the customer's cart
        await request(app)
            .post(`${baseURL}/carts`)
            .set("Cookie", customerCookie)
            .send({ model: "ModelX" })
            .expect(200);

        // Step 3: Retrieve the cart and verify the product is added
        const res = await request(app)
            .get(`${baseURL}/carts`)
            .set("Cookie", customerCookie)
            .expect(200);

        const cart = res.body;
        expect(cart.products).toHaveLength(1);
        expect(cart.products[0]).toEqual({
            model: "ModelX",
            quantity: 1,
            category: "Appliance",
            price: 199.99,
        });
        expect(cart.total).toBe(199.99);
    });

    test("Retrieve a cart", async () => {
        const res = await request(app)
            .get(`${baseURL}/carts`)
            .set("Cookie", customerCookie)
            .expect(200);

        const cart = res.body;
        expect(cart.products).toHaveLength(0);
        expect(cart.total).toBe(0);
    });

    test("Checkout an empty cart should throw EmptyCartError", async () => {
        const res = await request(app)
            .patch(`${baseURL}/carts`)
            .set("Cookie", customerCookie)
            .expect(400);

        expect(res.body.error).toBe("Cart is empty");
    });

    test("Add non-existent product to cart should throw ProductNotFoundError", async () => {
        const res = await request(app)
            .post(`${baseURL}/carts`)
            .set("Cookie", customerCookie)
            .send({ model: "NonExistentProduct" })
            .expect(404);

        expect(res.body.error).toBe("Product not found");
    });

    test("Remove product from cart", async () => {
        // Step 1: Add a product to the database
        await new Promise<void>((resolve, reject) => {
            const sql = `INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')`;
            db.run(sql, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Step 2: Add the product to the customer's cart
        await request(app)
            .post(`${baseURL}/carts`)
            .set("Cookie", customerCookie)
            .send({ model: "ModelX" })
            .expect(200);

        // Step 3: Remove the product from the cart
        await request(app)
            .delete(`${baseURL}/carts/products/ModelX`)
            .set("Cookie", customerCookie)
            .expect(200);

        // Step 4: Retrieve the cart and verify the product is removed
        const res = await request(app)
            .get(`${baseURL}/carts`)
            .set("Cookie", customerCookie)
            .expect(200);

        const cart = res.body;
        expect(cart.products).toHaveLength(0);
        expect(cart.total).toBe(0);
    });

    test("Remove all products from cart", async () => {
        // Step 1: Add products to the database
        await new Promise<void>((resolve, reject) => {
            const sql1 = `INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')`;
            const sql2 = `INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelY', 'Appliance', 5, 'Latest model of Y', 299.99, '2023-05-01')`;
            db.run(sql1, (err) => {
                if (err) return reject(err);
                db.run(sql2, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        });

        // Step 2: Add products to the customer's cart
        await request(app)
            .post(`${baseURL}/carts`)
            .set("Cookie", customerCookie)
            .send({ model: "ModelX" })
            .expect(200);
        await request(app)
            .post(`${baseURL}/carts`)
            .set("Cookie", customerCookie)
            .send({ model: "ModelY" })
            .expect(200);

        // Step 3: Remove all products from the cart
        await request(app)
            .delete(`${baseURL}/carts/current`)
            .set("Cookie", customerCookie)
            .expect(200);

        // Step 4: Retrieve the cart and verify it is empty
        const res = await request(app)
            .get(`${baseURL}/carts`)
            .set("Cookie", customerCookie)
            .expect(200);

        const cart = res.body;
        expect(cart.products).toHaveLength(0);
        expect(cart.total).toBe(0);
    });

    test("Retrieve all carts of a customer", async () => {
        // Step 1: Add a product to the database
        await new Promise<void>((resolve, reject) => {
            const sql = `INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')`;
            db.run(sql, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Step 2: Add the product to the customer's cart
        await request(app)
            .post(`${baseURL}/carts`)
            .set("Cookie", customerCookie)
            .send({ model: "ModelX" })
            .expect(200);

        // Step 3: Checkout the cart
        await request(app)
            .patch(`${baseURL}/carts`)
            .set("Cookie", customerCookie)
            .expect(200);

        // Step 4: Retrieve all carts of the customer
        const res = await request(app)
            .get(`${baseURL}/carts/history`)
            .set("Cookie", customerCookie)
            .expect(200);

        const carts = res.body;
        expect(carts).toHaveLength(1);
        expect(carts[0].products).toHaveLength(1);
        expect(carts[0].products[0]).toEqual({
            model: "ModelX",
            quantity: 1,
            category: "Appliance",
            price: 199.99,
        });
        expect(carts[0].total).toBe(199.99);
        expect(carts[0].paid).toBe(true);
    });
    

});
    
describe("Cart : Routes + Controller + Dao + DB for admin", () => {
    
    const c1 =   { username: "customer1", name: "Customer One", surname: "Test", password: "password1", role: "Customer" };
    const c2=    { username: "customer2", name: "Customer Two", surname: "Test", password: "password2", role: "Customer" };
    
    let c1cookie:string
    let c2cookie:string;

    beforeAll(async () => {
        // Create necessary tables if they don't exist
        await new Promise<void>((resolve, reject) => {
            db.run(
                `CREATE TABLE IF NOT EXISTS users (
                    username TEXT PRIMARY KEY UNIQUE,
                    name TEXT,
                    surname TEXT,
                    role TEXT,
                    password REAL,
                    salt TEXT
                )`,
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        // Create admin user and log in
        await postUser(admin);
        adminCookie = await login(admin);

        // Create customer users and log them in
        await postUser(c1);
        c1cookie=await login(c1);
        await postUser(c2);
        c2cookie=await login(c2);
    }, 30000);

    afterEach((done) => {
        db.run("DELETE FROM products_in_cart");
        db.run("DELETE FROM products");
        db.run("DELETE FROM carts", done);
    });

    afterAll((done) => {
        db.serialize(() => {
            db.run("DELETE FROM products_in_cart");
            db.run("DELETE FROM products");
            db.run("DELETE FROM carts");
            db.run("DELETE FROM users", done);
        });
    });

    test("Delete all carts", async () => {
        // Step 1: Add a product to the database
        await new Promise<void>((resolve, reject) => {
            const sql = `INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')`;
            db.run(sql, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Step 2: Add the product to each customer's cart
        
            await request(app)
                .post(`${baseURL}/carts`)
                .set("Cookie", c1cookie)
                .send({ model: "ModelX" })
                .expect(200);
            await request(app)
            .post(`${baseURL}/carts`)
            .set("Cookie", c2cookie)
            .send({ model: "ModelX" })
            .expect(200);
        

        // Step 3: Delete all carts
        await request(app)
            .delete(`${baseURL}/carts`)
            .set("Cookie", adminCookie)
            .expect(200);

        // Step 4: Retrieve all carts and verify they are deleted
        const res = await request(app)
            .get(`${baseURL}/carts/all`)
            .set("Cookie", adminCookie)
            .expect(200);

        const carts = res.body;
        expect(carts).toHaveLength(0);
    });

    test("Retrieve all carts of all users", async () => {
        // Step 1: Add products to the database
        await new Promise<void>((resolve, reject) => {
            const sql1 = `INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')`;
            const sql2 = `INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelY', 'Appliance', 5, 'Latest model of Y', 299.99, '2023-05-01')`;
            db.run(sql1, (err) => {
                if (err) return reject(err);
                db.run(sql2, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        });

        // Step 2: Add products to each customer's cart
        
            await request(app)
                .post(`${baseURL}/carts`)
                .set("Cookie", c1cookie)
                .send({ model: "ModelX" })
                .expect(200);

            await request(app)
                .post(`${baseURL}/carts`)
                .set("Cookie", c1cookie)
                .send({ model: "ModelY" })
                .expect(200);



            await request(app)
            .post(`${baseURL}/carts`)
            .set("Cookie", c2cookie)
            .send({ model: "ModelX" })
            .expect(200);
            await request(app)
                .post(`${baseURL}/carts`)
                .set("Cookie", c2cookie)
                .send({ model: "ModelY" })
                .expect(200);    
        

        // Step 3: Retrieve all carts
        const res = await request(app)
            .get(`${baseURL}/carts/all`)
            .set("Cookie", adminCookie)
            .expect(200);

        const carts = res.body;
        expect(carts).toHaveLength(2);
        for (const cart of carts) {
            expect(cart.products).toHaveLength(2);
            expect(cart.products[0]).toEqual({
                model: "ModelX",
                quantity: 1,
                category: "Appliance",
                price: 199.99,
            });
            expect(cart.products[1]).toEqual({
                model: "ModelY",
                quantity: 1,
                category: "Appliance",
                price: 299.99,
            });
            expect(cart.total).toBe(499.98);
        }
    });
});


describe("Cart : Routes + Controller + Dao + DB for manager", () => {
    
    const c1 =   { username: "customer1", name: "Customer One", surname: "Test", password: "password1", role: "Customer" };
    const c2=    { username: "customer2", name: "Customer Two", surname: "Test", password: "password2", role: "Customer" };
    
    let c1cookie:string
    let c2cookie:string;

    beforeAll(async () => {
        // Create necessary tables if they don't exist
        await new Promise<void>((resolve, reject) => {
            db.run(
                `CREATE TABLE IF NOT EXISTS users (
                    username TEXT PRIMARY KEY UNIQUE,
                    name TEXT,
                    surname TEXT,
                    role TEXT,
                    password REAL,
                    salt TEXT
                )`,
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });

        // Create admin user and log in
        await postUser(manager);
        managerCookie = await login(manager);

        // Create customer users and log them in
        await postUser(c1);
        c1cookie=await login(c1);
        await postUser(c2);
        c2cookie=await login(c2);
    }, 30000);

    afterEach((done) => {
        db.run("DELETE FROM products_in_cart");
        db.run("DELETE FROM products");
        db.run("DELETE FROM carts", done);
    });

    afterAll((done) => {
        db.serialize(() => {
            db.run("DELETE FROM products_in_cart");
            db.run("DELETE FROM products");
            db.run("DELETE FROM carts");
            db.run("DELETE FROM users", done);
        });
    });

    test("Delete all carts", async () => {
        // Step 1: Add a product to the database
        await new Promise<void>((resolve, reject) => {
            const sql = `INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')`;
            db.run(sql, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Step 2: Add the product to each customer's cart
        
            await request(app)
                .post(`${baseURL}/carts`)
                .set("Cookie", c1cookie)
                .send({ model: "ModelX" })
                .expect(200);
            await request(app)
            .post(`${baseURL}/carts`)
            .set("Cookie", c2cookie)
            .send({ model: "ModelX" })
            .expect(200);
        

        // Step 3: Delete all carts
        await request(app)
            .delete(`${baseURL}/carts`)
            .set("Cookie", managerCookie)
            .expect(200);

        // Step 4: Retrieve all carts and verify they are deleted
        const res = await request(app)
            .get(`${baseURL}/carts/all`)
            .set("Cookie", managerCookie)
            .expect(200);

        const carts = res.body;
        expect(carts).toHaveLength(0);
    });

    test("Retrieve all carts of all users", async () => {
        // Step 1: Add products to the database
        await new Promise<void>((resolve, reject) => {
            const sql1 = `INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelX', 'Appliance', 5, 'Latest model of X', 199.99, '2023-05-01')`;
            const sql2 = `INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ('ModelY', 'Appliance', 5, 'Latest model of Y', 299.99, '2023-05-01')`;
            db.run(sql1, (err) => {
                if (err) return reject(err);
                db.run(sql2, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        });

        // Step 2: Add products to each customer's cart
        
            await request(app)
                .post(`${baseURL}/carts`)
                .set("Cookie", c1cookie)
                .send({ model: "ModelX" })
                .expect(200);

            await request(app)
                .post(`${baseURL}/carts`)
                .set("Cookie", c1cookie)
                .send({ model: "ModelY" })
                .expect(200);



            await request(app)
            .post(`${baseURL}/carts`)
            .set("Cookie", c2cookie)
            .send({ model: "ModelX" })
            .expect(200);
            await request(app)
                .post(`${baseURL}/carts`)
                .set("Cookie", c2cookie)
                .send({ model: "ModelY" })
                .expect(200);    
        

        // Step 3: Retrieve all carts
        const res = await request(app)
            .get(`${baseURL}/carts/all`)
            .set("Cookie", managerCookie)
            .expect(200);

        const carts = res.body;
        expect(carts).toHaveLength(2);
        for (const cart of carts) {
            expect(cart.products).toHaveLength(2);
            expect(cart.products[0]).toEqual({
                model: "ModelX",
                quantity: 1,
                category: "Appliance",
                price: 199.99,
            });
            expect(cart.products[1]).toEqual({
                model: "ModelY",
                quantity: 1,
                category: "Appliance",
                price: 299.99,
            });
            expect(cart.total).toBe(499.98);
        }
    });
});


});