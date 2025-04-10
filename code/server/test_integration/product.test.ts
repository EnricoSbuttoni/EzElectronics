import { describe, test, expect, beforeAll, afterEach, afterAll, jest, beforeEach } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { cleanup } from "../src/db/cleanup"
import { Category } from "../src/components/product"
import ProductDAO from "../src/dao/productDAO"
import ProductController from "../src/controllers/productController"
import db from "../src/db/db"

const routePath = "/ezelectronics" //Base route path for the API
//Default user information. We use them to create users and evaluate the returned values
const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
//Cookies for the users. We use them to keep users logged in. Creating them once and saving them in a variables outside of the tests will make cookies reusable
let customerCookie: string
let adminCookie: string

//Helper function that creates a new user in the database.
//Can be used to create a user before the tests or in the tests
//Is an implicit test because it checks if the return code is successful
const postUser = async (userInfo: any) => {
    await request(app)
        .post(`${routePath}/users`)
        .send(userInfo)
        .expect(200)
}

//Helper function that logs in a user and returns the cookie
//Can be used to log in a user before the tests or in the tests
const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${routePath}/sessions`)
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




describe("Products integration tests", () => {  
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

        await postUser(customer);
        customerCookie = await login(customer);
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
    describe("Register a set of new products - FR3.1", () => {
        test("DB + DAO", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            
            jest.spyOn(ProductDAO.prototype, "registerProducts")
            const productDAO = new ProductDAO()
            const response = await productDAO.registerProducts(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)

            expect(response).toBeUndefined()
            expect(ProductDAO.prototype.registerProducts).toHaveBeenCalledWith(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)
        })

        test("DB + DAO + Controller", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            
            jest.spyOn(ProductDAO.prototype, "registerProducts")
            jest.spyOn(ProductController.prototype, "registerProducts")
            const productController = new ProductController()
            const response = await productController.registerProducts(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)

            expect(response).toBeUndefined()
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)
            expect(ProductDAO.prototype.registerProducts).toHaveBeenCalledWith(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)
        })
        test("DB + DAO + Controller + Routes", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            
            jest.spyOn(ProductDAO.prototype, "registerProducts")
            jest.spyOn(ProductController.prototype, "registerProducts")
            const response = await request(app)
                            .post(`${routePath}/products`)
                            .set('Cookie', adminCookie) // Imposta il cookie di autenticazione
                            .send(product)
                            .expect(200)

            expect(response.status).toBe(200)
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)
            expect(ProductDAO.prototype.registerProducts).toHaveBeenCalledWith(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)
        })
    });

    describe("Update the quantity of a product - FR3.2", () => {
        test("DB + DAO", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            const productDAO = new ProductDAO()
            await productDAO.registerProducts(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)

            const change = {model: "test", newQuantity: 5, changeDate: "2024-01-01"}
            
            jest.spyOn(ProductDAO.prototype, "changeProductQuantity")
            const response = await productDAO.changeProductQuantity(change.model,change.newQuantity,change.changeDate)

            expect(response).toBe(10)
            expect(ProductDAO.prototype.changeProductQuantity).toHaveBeenCalledWith(change.model,change.newQuantity,change.changeDate)
        })

        test("DB + DAO + Controller", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            const productController = new ProductController()
            await productController.registerProducts(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)

            const change = {model: "test", newQuantity: 5, changeDate: "2024-01-01"}

            jest.spyOn(ProductDAO.prototype, "changeProductQuantity")
            jest.spyOn(ProductController.prototype, "changeProductQuantity")

            const response = await productController.changeProductQuantity(change.model,change.newQuantity,change.changeDate)

            expect(response).toBe(10)
            expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(change.model,change.newQuantity,change.changeDate)
            expect(ProductDAO.prototype.changeProductQuantity).toHaveBeenCalledWith(change.model,change.newQuantity,change.changeDate)
        })
        test("DB + DAO + Controller + Routes", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            
            jest.spyOn(ProductDAO.prototype, "registerProducts")
            jest.spyOn(ProductController.prototype, "registerProducts")
            await request(app)
            .post(`${routePath}/products`)
            .set('Cookie', adminCookie)
            .send(product)
            .expect(200)

            const model= "test";
            const newQuantity = 5;
            const changeDate: string | null = "2024-04-01";

            jest.spyOn(ProductDAO.prototype, "changeProductQuantity")
            jest.spyOn(ProductController.prototype, "changeProductQuantity")

            await request(app)
            .patch(`${routePath}/products/${model}`)
            .set('Cookie', adminCookie)
            .send({quantity: newQuantity, changeDate: changeDate})
            .expect(200)

            expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(model,newQuantity,changeDate)
            expect(ProductDAO.prototype.changeProductQuantity).toHaveBeenCalledWith(model,newQuantity,changeDate)
        })
    });

    describe("Sell a product - FR3.3", () => {
        test("DB + DAO", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            const productDAO = new ProductDAO()
            await productDAO.registerProducts(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)

            const sell = {model: "test", soldQuantity: 2, changeDate: "2024-01-01"}
            
            jest.spyOn(ProductDAO.prototype, "sellProduct")
            const response = await productDAO.sellProduct(sell.model,sell.soldQuantity,sell.changeDate)

            expect(response).toBe(3)
            expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledWith(sell.model,sell.soldQuantity,sell.changeDate)
        })

        test("DB + DAO + Controller", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            const productController = new ProductController()
            await productController.registerProducts(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)

            const sell = {model: "test", soldQuantity: 2, changeDate: "2024-01-01"}

            jest.spyOn(ProductDAO.prototype, "sellProduct")
            jest.spyOn(ProductController.prototype, "sellProduct")

            const response = await productController.sellProduct(sell.model,sell.soldQuantity,sell.changeDate)

            expect(response).toBe(3)
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(sell.model,sell.soldQuantity,sell.changeDate)
            expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledWith(sell.model,sell.soldQuantity,sell.changeDate)
        })
        test("DB + DAO + Controller + Routes", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            
            jest.spyOn(ProductDAO.prototype, "registerProducts")
            jest.spyOn(ProductController.prototype, "registerProducts")
            await request(app)
            .post(`${routePath}/products`)
            .set('Cookie', adminCookie)
            .send(product).expect(200)

            const model= "test";
            const soldQuantity = 2;
            const sellingDate: string | null = "2024-04-01";

            jest.spyOn(ProductDAO.prototype, "sellProduct")
            jest.spyOn(ProductController.prototype, "sellProduct")

            await request(app)
            .patch(`${routePath}/products/${model}/sell`)
            .set('Cookie', adminCookie)
            .send({quantity: soldQuantity, sellingDate: sellingDate})
            .expect(200)

            expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(model,soldQuantity,sellingDate)
            expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledWith(model,soldQuantity,sellingDate)
        })
    });

    describe("Show the list of products - FR3.4 / 3.5 / 3.6", () => {
        test("DB + DAO", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            const productDAO = new ProductDAO()
            await productDAO.registerProducts(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)

            const grouping = "category"
            const model: string | null = null;
            const category = Category.SMARTPHONE;
            
            jest.spyOn(ProductDAO.prototype, "getProducts")
            const response = await productDAO.getProducts(grouping, category, model);

            expect(response).toEqual([product])
            expect(ProductDAO.prototype.getProducts).toHaveBeenCalledWith(grouping, category, model)
        })

        test("DB + DAO + Controller", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            const productController = new ProductController()
            await productController.registerProducts(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)

            const grouping = "category"
            const model: string | null = null;
            const category = Category.SMARTPHONE;

            jest.spyOn(ProductDAO.prototype, "getProducts")
            jest.spyOn(ProductController.prototype, "getProducts")

            const response = await productController.getProducts(grouping, category, model)

            expect(response).toEqual([product])
            expect(ProductController.prototype.getProducts).toHaveBeenCalledWith(grouping, category, model)
            expect(ProductDAO.prototype.getProducts).toHaveBeenCalledWith(grouping, category, model)
        })
        test("DB + DAO + Controller + Routes", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            
            jest.spyOn(ProductDAO.prototype, "registerProducts")
            jest.spyOn(ProductController.prototype, "registerProducts")
            await request(app)
            .post(`${routePath}/products`)
            .set('Cookie', adminCookie)
            .send(product).expect(200)

            const grouping = "category"
            const model: string | undefined = undefined;
            const category = Category.SMARTPHONE;

            jest.spyOn(ProductDAO.prototype, "getProducts")
            jest.spyOn(ProductController.prototype, "getProducts")

            await request(app)
            .get(`${routePath}/products`)
            .set('Cookie', adminCookie)
            .query({grouping: grouping, model: model, category: category}).expect(200)

            expect(ProductController.prototype.getProducts).toHaveBeenCalledWith(grouping,category,model)
            expect(ProductDAO.prototype.getProducts).toHaveBeenCalledWith(grouping,category,model)
        })
    });

    describe("Show the list of available products - FR3.4.1", () => {
        test("DB + DAO", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            const productDAO = new ProductDAO()
            await productDAO.registerProducts(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)

            const grouping = "category"
            const model: string | null = null;
            const category = Category.SMARTPHONE;
            
            jest.spyOn(ProductDAO.prototype, "getAvailableProducts")
            const response = await productDAO.getAvailableProducts(grouping, category, model);

            expect(response).toEqual([product])
            expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledWith(grouping, category, model)
        })

        test("DB + DAO + Controller", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            const productController = new ProductController()
            await productController.registerProducts(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)

            const grouping = "category"
            const model: string | null = null;
            const category = Category.SMARTPHONE;

            jest.spyOn(ProductDAO.prototype, "getAvailableProducts")
            jest.spyOn(ProductController.prototype, "getAvailableProducts")

            const response = await productController.getAvailableProducts(grouping, category, model)

            expect(response).toEqual([product])
            expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith(grouping, category, model)
            expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledWith(grouping, category, model)
        })
        test("DB + DAO + Controller + Routes", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            
            jest.spyOn(ProductDAO.prototype, "registerProducts")
            jest.spyOn(ProductController.prototype, "registerProducts")
            await request(app)
            .post(`${routePath}/products`)
            .set('Cookie', adminCookie)
            .send(product).expect(200)

            const grouping = "category"
            const model: string | undefined = undefined;
            const category = Category.SMARTPHONE;

            jest.spyOn(ProductDAO.prototype, "getAvailableProducts")
            jest.spyOn(ProductController.prototype, "getAvailableProducts")

            await request(app)
            .get(`${routePath}/products/available`)
            .set('Cookie', customerCookie)
            .query({grouping: grouping, model: model, category: category}).expect(200)

            expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith(grouping,category,model)
            expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledWith(grouping,category,model)
        })
    });

    describe("Delete a product - FR3.7", () => {
        test("DB + DAO", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            const productDAO = new ProductDAO()
            await productDAO.registerProducts(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)

            const model = "test"
            
            jest.spyOn(ProductDAO.prototype, "deleteProduct")
            const response = await productDAO.deleteProduct(model);

            expect(response).toBe(true)
            expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledWith(model)
        })

        test("DB + DAO + Controller", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            const productController = new ProductController()
            await productController.registerProducts(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)

            const model = "test"

            jest.spyOn(ProductDAO.prototype, "deleteProduct")
            jest.spyOn(ProductController.prototype, "deleteProduct")

            const response = await productController.deleteProduct(model)

            expect(response).toBe(true)
            expect(ProductController.prototype.deleteProduct).toHaveBeenCalledWith(model)
            expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledWith(model)
        })
        test("DB + DAO + Controller + Routes", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            
            jest.spyOn(ProductDAO.prototype, "registerProducts")
            jest.spyOn(ProductController.prototype, "registerProducts")
            await request(app)
            .post(`${routePath}/products`)
            .set('Cookie', adminCookie)
            .send(product).expect(200)

            const model= "test";

            jest.spyOn(ProductDAO.prototype, "deleteProduct")
            jest.spyOn(ProductController.prototype, "deleteProduct")

            await request(app)
            .delete(`${routePath}/products/${model}`)
            .set('Cookie', adminCookie)
            .expect(200)

            expect(ProductController.prototype.deleteProduct).toHaveBeenCalledWith(model)
            expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledWith(model)
        })
    });

    describe("Delete all products - FR3.8", () => {
        test("DB + DAO", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            const productDAO = new ProductDAO()
            await productDAO.registerProducts(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)
            
            jest.spyOn(ProductDAO.prototype, "deleteAllProducts")
            const response = await productDAO.deleteAllProducts();

            expect(response).toBe(true)
            expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalledWith()
        })

        test("DB + DAO + Controller", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            const productController = new ProductController()
            await productController.registerProducts(product.model,product.category,product.quantity,product.details,product.sellingPrice,product.arrivalDate)

            jest.spyOn(ProductDAO.prototype, "deleteAllProducts")
            jest.spyOn(ProductController.prototype, "deleteAllProducts")

            const response = await productController.deleteAllProducts()

            expect(response).toBe(true)
            expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalledWith()
            expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalledWith()
        })
        test("DB + DAO + Controller + Routes", async () => {
            const product = {model: "test", category: Category.SMARTPHONE, quantity: 5, details: "", sellingPrice: 200, arrivalDate: "2024-01-01"}
            
            jest.spyOn(ProductDAO.prototype, "registerProducts")
            jest.spyOn(ProductController.prototype, "registerProducts")
            await request(app)
            .post(`${routePath}/products`)
            .set('Cookie', adminCookie)
            .send(product).expect(200)

            jest.spyOn(ProductDAO.prototype, "deleteAllProducts")
            jest.spyOn(ProductController.prototype, "deleteAllProducts")

            await request(app)
            .delete(`${routePath}/products`)
            .set('Cookie', adminCookie)
            .expect(200)

            expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalledWith()
            expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalledWith()
        })
    });
})


