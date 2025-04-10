import { test, expect, jest, describe, beforeAll, afterEach } from "@jest/globals";
import request from 'supertest';
import { app } from "./../../index";
import { Role, User } from "../../src/components/user";
import ErrorHandler from "../../src/helper";
import ProductController from "../../src/controllers/productController";
import Authenticator from "../../src/routers/auth";
import { Category, Product } from "../../src/components/product";

const baseURL = "/ezelectronics";

jest.mock("../../src/routers/auth");

describe("Register products", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("200 Code with correct informations and auth", async () => {
        const model = "test";
        const category = Category.SMARTPHONE;
        const quantity = 10;
        const details = "";
        const sellingPrice = 12.0;
        const arrivalDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();

        const response = await request(app).post(baseURL + '/products').send({model,category,quantity,details,sellingPrice,arrivalDate});

        expect(response.status).toBe(200);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(model,category,quantity,details,sellingPrice,arrivalDate);
    });

    test("200 Code with null details and arrivalDate", async () => {
        const model = "test";
        const category = Category.SMARTPHONE;
        const quantity = 10;
        const details: string | null = null;
        const sellingPrice = 12.0;
        const arrivalDate: string | null = "";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();

        const response = await request(app).post(baseURL + '/products').send({model,category,quantity,details,sellingPrice,arrivalDate});

        expect(response.status).toBe(200);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(model,category,quantity,details,sellingPrice,arrivalDate);
    });

    test("422 Code with not string model", async () => {
        const model = 1;
        const category = Category.SMARTPHONE;
        const quantity = 10;
        const details = "";
        const sellingPrice = 12.0;
        const arrivalDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();

        const response = await request(app).post(baseURL + '/products').send({model,category,quantity,details,sellingPrice,arrivalDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);
    });

    test("422 Code with empty model", async () => {
        const model = "";
        const category = Category.SMARTPHONE;
        const quantity = 10;
        const details = "";
        const sellingPrice = 12.0;
        const arrivalDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();

        const response = await request(app).post(baseURL + '/products').send({model,category,quantity,details,sellingPrice,arrivalDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);
    });

    test("422 Code with not string category", async () => {
        const model = "test";
        const category = 3;
        const quantity = 10;
        const details = "";
        const sellingPrice = 12.0;
        const arrivalDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();

        const response = await request(app).post(baseURL + '/products').send({model,category,quantity,details,sellingPrice,arrivalDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);
    });

    test("422 Code with empty category / category invalid", async () => {
        const model = "test";
        const category = "";
        const quantity = 10;
        const details = "";
        const sellingPrice = 12.0;
        const arrivalDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();

        const response = await request(app).post(baseURL + '/products').send({model,category,quantity,details,sellingPrice,arrivalDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);
    });

    test("422 Code with not int quantity", async () => {
        const model = "test";
        const category = Category.SMARTPHONE;
        const quantity = 10.2;
        const details = "";
        const sellingPrice = 12.0;
        const arrivalDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();

        const response = await request(app).post(baseURL + '/products').send({model,category,quantity,details,sellingPrice,arrivalDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);
    });

    test("422 Code with zero quantity", async () => {
        const model = "test";
        const category = Category.SMARTPHONE;
        const quantity = 0;
        const details = "";
        const sellingPrice = 12.0;
        const arrivalDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();

        const response = await request(app).post(baseURL + '/products').send({model,category,quantity,details,sellingPrice,arrivalDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);
    });

    test("422 Code with not string details", async () => {
        const model = "test";
        const category = Category.SMARTPHONE;
        const quantity = 10;
        const details = 2;
        const sellingPrice = 12.0;
        const arrivalDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();

        const response = await request(app).post(baseURL + '/products').send({model,category,quantity,details,sellingPrice,arrivalDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);
    });

    test("422 Code with zero sellingPrice", async () => {
        const model = "test";
        const category = Category.SMARTPHONE;
        const quantity = 10;
        const details = "";
        const sellingPrice = 0.0;
        const arrivalDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();

        const response = await request(app).post(baseURL + '/products').send({model,category,quantity,details,sellingPrice,arrivalDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);
    });

    test("422 Code with not string arrivalDate", async () => {
        const model = "test";
        const category = Category.SMARTPHONE;
        const quantity = 10;
        const details = "";
        const sellingPrice = 12.0;
        const arrivalDate = 2;
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();

        const response = await request(app).post(baseURL + '/products').send({model,category,quantity,details,sellingPrice,arrivalDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);
    });

    test("422 Code with wrong format arrivalDate", async () => {
        const model = "test";
        const category = Category.SMARTPHONE;
        const quantity = 10;
        const details = "";
        const sellingPrice = 12.0;
        const arrivalDate = "10-12-2000";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();

        const response = await request(app).post(baseURL + '/products').send({model,category,quantity,details,sellingPrice,arrivalDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);
    });

    test("401 Code with unauthenticated user", async () => {
        const model = "test";
        const category = Category.SMARTPHONE;
        const quantity = 10;
        const details = "";
        const sellingPrice = 12.0;
        const arrivalDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();

        const response = await request(app).post(baseURL + '/products').send({model,category,quantity,details,sellingPrice,arrivalDate});

        expect(response.status).toBe(401);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);
    });

    test("401 Code with not Admin nor Manager user", async () => {
        const model = "test";
        const category = Category.SMARTPHONE;
        const quantity = 10;
        const details = "";
        const sellingPrice = 12.0;
        const arrivalDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not an admin or manager", status: 401 });
        });

        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();

        const response = await request(app).post(baseURL + '/products').send({model,category,quantity,details,sellingPrice,arrivalDate});

        expect(response.status).toBe(401);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(0);
    });
})

describe("Change product quantity", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("200 Code with correct informations and auth", async () => {
        const model = "test";
        const quantity = 10;
        const changeDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValueOnce(20);

        const response = await request(app).patch(baseURL + `/products/${model}`).send({quantity, changeDate});

        expect(response.status).toBe(200);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(model, quantity, changeDate);
        expect(response.body).toStrictEqual({"quantity": 20});
    });

    test("200 Code with null changeDate", async () => {
        const model = "test";
        const quantity = 10;
        const changeDate: string | null = null;
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValueOnce(20);

        const response = await request(app).patch(baseURL + `/products/${model}`).send({quantity, changeDate});

        expect(response.status).toBe(200);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(model, quantity, changeDate);
        expect(response.body).toStrictEqual({"quantity": 20});
    });

    test("422 Code with not int quantity", async () => {
        const model = "test";
        const quantity = 10.2;
        const changeDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValueOnce(20);

        const response = await request(app).patch(baseURL + `/products/${model}`).send({quantity, changeDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(0);
    });

    test("422 Code with zero quantity", async () => {
        const model = "test";
        const quantity = 0;
        const changeDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValueOnce(20);

        const response = await request(app).patch(baseURL + `/products/${model}`).send({quantity, changeDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(0);
    });

    test("422 Code wrong format changeDate", async () => {
        const model = "test";
        const quantity = 10;
        const changeDate = "01-04-2024";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValueOnce(20);

        const response = await request(app).patch(baseURL + `/products/${model}`).send({quantity, changeDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(0);
    });

    test("401 Code with unauthenticated user", async () => {
        const model = "test";
        const quantity = 10;
        const changeDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        });
        
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValueOnce(20);

        const response = await request(app).patch(baseURL + `/products/${model}`).send({quantity, changeDate});

        expect(response.status).toBe(401);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(0);
    });

    test("401 Code with not Admin nor Manager user", async () => {
        const model = "test";
        const quantity = 10;
        const changeDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });
    
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not an admin or manager", status: 401 });
        });

        jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValueOnce(20);

        const response = await request(app).patch(baseURL + `/products/${model}`).send({quantity, changeDate});

        expect(response.status).toBe(401);
        expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledTimes(0);
    });
});

describe("Sell product", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("200 Code with correct informations and auth", async () => {
        const model = "test";
        const quantity = 10;
        const sellingDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValueOnce(5);

        const response = await request(app).patch(baseURL + `/products/${model}/sell`).send({quantity, sellingDate});

        expect(response.status).toBe(200);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(model, quantity, sellingDate);
        expect(response.body).toStrictEqual({"quantity": 5});
    });

    test("200 Code with null sellingDate", async () => {
        const model = "test";
        const quantity = 10;
        const sellingDate : string | null = null;
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValueOnce(5);

        const response = await request(app).patch(baseURL + `/products/${model}/sell`).send({quantity, sellingDate});

        expect(response.status).toBe(200);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(model, quantity, sellingDate);
        expect(response.body).toStrictEqual({"quantity": 5});
    });

    test("422 Code with wrong format sellingDate", async () => {
        const model = "test";
        const quantity = 10;
        const sellingDate = "01-04-2024";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValueOnce(5);

        const response = await request(app).patch(baseURL + `/products/${model}/sell`).send({quantity, sellingDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(0);
    });

    test("422 Code with not int quantity", async () => {
        const model = "test";
        const quantity = 10.2;
        const sellingDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValueOnce(5);

        const response = await request(app).patch(baseURL + `/products/${model}/sell`).send({quantity, sellingDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(0);
    });

    test("422 Code with zero quantity", async () => {
        const model = "test";
        const quantity = 0;
        const sellingDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValueOnce(5);

        const response = await request(app).patch(baseURL + `/products/${model}/sell`).send({quantity, sellingDate});

        expect(response.status).toBe(422);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(0);
    });

    test("401 Code with unauthenticated user", async () => {
        const model = "test";
        const quantity = 10;
        const sellingDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValueOnce(5);

        const response = await request(app).patch(baseURL + `/products/${model}/sell`).send({quantity, sellingDate});

        expect(response.status).toBe(401);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(0);
    });

    test("401 Code with not Admin nor Manager user", async () => {
        const model = "test";
        const quantity = 10;
        const sellingDate = "2024-04-01";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not an admin or manager", status: 401 });
        });

        jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValueOnce(5);

        const response = await request(app).patch(baseURL + `/products/${model}/sell`).send({quantity, sellingDate});

        expect(response.status).toBe(401);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(0);
    });
});

describe("Get products", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("200 Code with all query parmeters null", async () => {
        const grouping: string|undefined = undefined;
        const category: string|undefined = undefined;
        const model: string|undefined = undefined;
        const existingProducts = new Product(10,"test1",Category.SMARTPHONE,"2024-01-04",null,10);
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce([existingProducts]);

        const response = await request(app).get(baseURL + `/products`).query({grouping,category,model});

        expect(response.status).toBe(200);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledWith(grouping,category,model);
        expect(response.body).toEqual([existingProducts]);
    });

    test("200 Code with grouping as category", async () => {
        const grouping: string|undefined = "category";
        const category: string|undefined = "Laptop";
        const model: string|undefined = undefined;
        const existingProducts = new Product(10,"test1",Category.SMARTPHONE,"2024-01-04",null,10);
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce([existingProducts]);

        const response = await request(app).get(baseURL + `/products`).query({grouping,category,model});

        expect(response.status).toBe(200);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledWith(grouping,category,model);
        expect(response.body).toEqual([existingProducts]);
    });

    test("200 Code with grouping as model", async () => {
        const grouping: string|undefined = "model";
        const category: string|undefined = undefined;
        const model: string|undefined = "test";
        const existingProducts = new Product(10,"test1",Category.SMARTPHONE,"2024-01-04",null,10);
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce([existingProducts]);

        const response = await request(app).get(baseURL + `/products`).query({grouping,category,model});

        expect(response.status).toBe(200);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledWith(grouping,category,model);
        expect(response.body).toEqual([existingProducts]);
    });

    test("401 Code with unauthenticated user", async () => {
        const grouping: string|undefined = "model";
        const category: string|undefined = undefined;
        const model: string|undefined = 'test';
        const existingProducts = new Product(10,"test1",Category.SMARTPHONE,"2024-01-04",null,10);
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce([existingProducts]);

        const response = await request(app).get(baseURL + `/products`).query({grouping,category,model});

        expect(response.status).toBe(401);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(0);
    });

    test("401 Code with not Admin nor Manager user", async () => {
        const grouping: string|undefined = "model";
        const category: string|undefined = undefined;
        const model: string|undefined = 'test';
        const existingProducts = new Product(10,"test1",Category.SMARTPHONE,"2024-01-04",null,10);
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
        return res.status(401).json({ error: "User is not an admin or manager", status: 401 });
        });

        jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce([existingProducts]);

        const response = await request(app).get(baseURL + `/products`).query({grouping,category,model});

        expect(response.status).toBe(401);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(0);
    });
});

describe("Get available products", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("200 Code with all query parmeters null", async () => {
        const grouping: string|undefined = undefined;
        const category: string|undefined = undefined;
        const model: string|undefined = undefined;
        const existingProducts = new Product(10,"test1",Category.SMARTPHONE,"2024-01-04",null,10);
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce([existingProducts]);

        const response = await request(app).get(baseURL + `/products/available`).query({grouping,category,model});

        expect(response.status).toBe(200);
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith(grouping,category,model);
        expect(response.body).toEqual([existingProducts]);
    });

    test("200 Code with grouping as category", async () => {
        const grouping: string|undefined = "category";
        const category: string|undefined = "Laptop";
        const model: string|undefined = undefined;
        const existingProducts = new Product(10,"test1",Category.SMARTPHONE,"2024-01-04",null,10);
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce([existingProducts]);

        const response = await request(app).get(baseURL + `/products/available`).query({grouping,category,model});

        expect(response.status).toBe(200);
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith(grouping,category,model);
        expect(response.body).toEqual([existingProducts]);
    });

    test("200 Code with grouping as model", async () => {
        const grouping: string|undefined = "model";
        const category: string|undefined = undefined;
        const model: string|undefined = "test";
        const existingProducts = new Product(10,"test1",Category.SMARTPHONE,"2024-01-04",null,10);
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce([existingProducts]);

        const response = await request(app).get(baseURL + `/products/available`).query({grouping,category,model});

        expect(response.status).toBe(200);
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith(grouping,category,model);
        expect(response.body).toEqual([existingProducts]);
    });

    test("401 Code with unauthenticated user", async () => {
        const grouping: string|undefined = "model";
        const category: string|undefined = undefined;
        const model: string|undefined = 'test';
        const existingProducts = new Product(10,"test1",Category.SMARTPHONE,"2024-01-04",null,10);
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        });

        jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce([existingProducts]);

        const response = await request(app).get(baseURL + `/products/available`).query({grouping,category,model});

        expect(response.status).toBe(401);
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(0);
    });
});

describe("Delete all products", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("200 Code with correct auth", async () => {
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "deleteAllProducts").mockResolvedValueOnce(true);

        const response = await request(app).delete(baseURL + `/products`);

        expect(response.status).toBe(200);
        expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalledTimes(1);

    });

    test("401 Code with unauthenticated user", async () => {
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "deleteAllProducts").mockResolvedValueOnce(true);

        const response = await request(app).delete(baseURL + `/products`);

        expect(response.status).toBe(401);
        expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalledTimes(0);

    });

    test("401 Code with not Admin nor Manager user", async () => {
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not an admin or manager", status: 401 });
        });

        jest.spyOn(ProductController.prototype, "deleteAllProducts").mockResolvedValueOnce(true);

        const response = await request(app).delete(baseURL + `/products`);

        expect(response.status).toBe(401);
        expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalledTimes(0);

    });
});

describe("Delete a single product", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("200 Code with correct informations and auth", async () => {
        const model = "test"
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "deleteProduct").mockResolvedValueOnce(true);

        const response = await request(app).delete(baseURL + `/products/${model}`);

        expect(response.status).toBe(200);
        expect(ProductController.prototype.deleteProduct).toHaveBeenCalledTimes(1);
    });

    test("401 Code with unauthenticated user", async () => {

        const model = "test"
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(ProductController.prototype, "deleteProduct").mockResolvedValueOnce(true);

        const response = await request(app).delete(baseURL + `/products/${model}`);

        expect(response.status).toBe(401);
        expect(ProductController.prototype.deleteProduct).toHaveBeenCalledTimes(0);

    });

    test("401 Code with not Admin nor Manager user", async () => {
        const model = "test";
        const testCustomer = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not an admin or manager", status: 401 });
        });

        jest.spyOn(ProductController.prototype, "deleteProduct").mockResolvedValueOnce(true);

        const response = await request(app).delete(baseURL + `/products/${model}`);

        expect(response.status).toBe(401);
        expect(ProductController.prototype.deleteProduct).toHaveBeenCalledTimes(0);
    });
});