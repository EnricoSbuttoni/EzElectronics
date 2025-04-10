import { test, expect, jest, describe, beforeAll, afterAll, afterEach } from "@jest/globals";
import request from 'supertest';
import { app } from "./../../index";
import { Cart, ProductInCart } from "../../src/components/cart";
import { Role, User } from "../../src/components/user";
import ErrorHandler from "../../src/helper";
import CartController from "../../src/controllers/cartController";
import Authenticator from "../../src/routers/auth";
import { Category } from "../../src/components/product";
import { CartNotFoundError } from "../../src/errors/cartError";

const baseURL = "/ezelectronics";

jest.mock("../../src/routers/auth");
describe("Run all",()=>{
describe("Get cart", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("It should return a 200 code with empty Cart", async () => {
        const cart = new Cart("user", false, "2024-6-10", 0, []);
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "getCart").mockResolvedValueOnce(cart);

        const response = await request(app).get(baseURL + '/carts').send();

        expect(response.status).toBe(200);
        expect(CartController.prototype.getCart).toHaveBeenCalledTimes(1);
        expect(CartController.prototype.getCart).toHaveBeenCalledWith(testCustomer);
    });

    test("It should return a 200 code with full Cart", async () => {
       
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");
        const product= new ProductInCart("Iphone13",10,Category.SMARTPHONE,10);
        const cart = new Cart("user", false, "2024-6-10", 0, [product]);
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "getCart").mockResolvedValueOnce(cart);

        const response = await request(app).get(baseURL + '/carts').send();

        expect(response.status).toBe(200);
        expect(CartController.prototype.getCart).toHaveBeenCalledTimes(1);
        expect(CartController.prototype.getCart).toHaveBeenCalledWith(testCustomer);
    });

    test("It should return a 401 code if user not logged in", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });

        const response = await request(app).get(baseURL + '/carts').send();

        expect(response.status).toBe(401);
    });

    test("It should return a 401 code if the user is not a customer", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not a customer", status: 401 });
        });

        const response = await request(app).get(baseURL + '/carts').send();

        expect(response.status).toBe(401);
    });
    test("It should return a 503 code if there is an error in the controller", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");
        const errorMessage = "Internal Server Error";

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "getCart").mockRejectedValueOnce(new Error(errorMessage));

        const response = await request(app).get(baseURL + '/carts').send();

        expect(response.status).toBe(503);
        expect(response.body.error).toBe(errorMessage);
        expect(CartController.prototype.getCart).toHaveBeenCalledTimes(1);
        expect(CartController.prototype.getCart).toHaveBeenCalledWith(testCustomer);
    });

    afterAll(() => {
        jest.clearAllMocks();
    });
});

describe("Checkout cart", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("It should return a 200 code for successful checkout", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "checkoutCart").mockResolvedValueOnce(true);

        const response = await request(app).patch(baseURL + '/carts').send();

        expect(response.status).toBe(200);
        expect(CartController.prototype.checkoutCart).toHaveBeenCalledTimes(1);
        expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(testCustomer);
    });

    test("It should return a 401 code if user not logged in", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });

        const response = await request(app).patch(baseURL + '/carts').send();

        expect(response.status).toBe(401);
    });

    test("It should return a 401 code if the user is not a customer", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not a customer", status: 401 });
        });

        const response = await request(app).patch(baseURL + '/carts').send();

        expect(response.status).toBe(401);
    });
    test("It should return a 404 code if there is an error in the controller", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "checkoutCart").mockRejectedValueOnce(new CartNotFoundError());

        const response = await request(app).patch(baseURL + '/carts').send();

        expect(response.status).toBe(404);
        expect(CartController.prototype.checkoutCart).toHaveBeenCalledTimes(1);
        expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(testCustomer);
    });

    afterAll(() => {
        jest.clearAllMocks();
    });
    afterAll(() => {
        jest.clearAllMocks();
    });
});

describe("Get customer cart history", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("It should return a 200 code with the cart history", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");
        const cartHistory = [
            new Cart("user", true, "2024-6-10", 100, [new ProductInCart("Iphone13", 10, Category.SMARTPHONE, 10)]),
            new Cart("user", true, "2023-5-9", 50, [new ProductInCart("Samsung Galaxy", 5, Category.SMARTPHONE, 10)])
        ];

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "getCustomerCarts").mockResolvedValueOnce(cartHistory);

        const response = await request(app).get(baseURL + '/carts/history').send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual(cartHistory);
        expect(CartController.prototype.getCustomerCarts).toHaveBeenCalledTimes(1);
        expect(CartController.prototype.getCustomerCarts).toHaveBeenCalledWith(testCustomer);
    });

    test("It should return a 401 code if user not logged in", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });

        const response = await request(app).get(baseURL + '/carts/history').send();

        expect(response.status).toBe(401);
    });

    test("It should return a 401 code if the user is not a customer", async () => {
        const testUser = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testUser;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testUser;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not a customer", status: 401 });
        });

        const response = await request(app).get(baseURL + '/carts/history').send();

        expect(response.status).toBe(401);
    });
    test("It should return a 503 code if there is an error in the controller", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");
        const errorMessage = "Internal Server Error";

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "getCustomerCarts").mockRejectedValueOnce(new Error(errorMessage));

        const response = await request(app).get(baseURL + '/carts/history').send();

        expect(response.status).toBe(503);
        expect(response.body.error).toBe(errorMessage);
        expect(CartController.prototype.getCustomerCarts).toHaveBeenCalledTimes(1);
        expect(CartController.prototype.getCustomerCarts).toHaveBeenCalledWith(testCustomer);
    });

    afterAll(() => {
        jest.clearAllMocks();
    });
});


describe("Remove product from cart", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("It should return a 200 code if the product was removed from the cart", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");
        const model = "Iphone13";

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "removeProductFromCart").mockResolvedValueOnce(true);

        const response = await request(app).delete(`${baseURL}/carts/products/${model}`).send();

        expect(response.status).toBe(200);
        expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledTimes(1);
        expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(testCustomer, model);
    });

    test("It should return a 404 code if the model parameter is missing", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return res.status(404).json({ error: "Invalid model parameter", status: 404 });
        });

        const response = await request(app).delete(`${baseURL}/carts/products/`).send();

        expect(response.status).toBe(404);
    });

    test("It should return a 401 code if user not logged in", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");
        const model = "Iphone13";

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        });

        const response = await request(app).delete(`${baseURL}/carts/products/${model}`).send();

        expect(response.status).toBe(401);
    });

    test("It should return a 401 code if the user is not a customer", async () => {
        const testUser = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");
        const model = "Iphone13";

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testUser;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testUser;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not a customer", status: 401 });
        });

        const response = await request(app).delete(`${baseURL}/carts/products/${model}`).send();

        expect(response.status).toBe(401);
    });
    test("It should return a 503 code if there is an error in the controller", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");
        const model = "Iphone13";
        const errorMessage = "Internal Server Error";
    
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });
    
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });
    
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });
    
        jest.spyOn(CartController.prototype, "removeProductFromCart").mockRejectedValueOnce(new Error(errorMessage));
    
        const response = await request(app).delete(baseURL + `/carts/products/${model}`).send();
    
        expect(response.status).toBe(503);
        expect(response.body.error).toBe(errorMessage);
        expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledTimes(1);
        expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(testCustomer, model);
    });
    
    afterAll(() => {
        jest.clearAllMocks();
    });
});

describe("Clear current cart", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("It should return a 200 code if the cart was cleared successfully", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "clearCart").mockResolvedValueOnce(true);

        const response = await request(app).delete(baseURL + '/carts/current').send();

        expect(response.status).toBe(200);
        expect(CartController.prototype.clearCart).toHaveBeenCalledTimes(1);
        expect(CartController.prototype.clearCart).toHaveBeenCalledWith(testCustomer);
    });

    test("It should return a 401 code if user not logged in", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });

        const response = await request(app).delete(baseURL + '/carts/current').send();

        expect(response.status).toBe(401);
    });

    test("It should return a 401 code if the user is not a customer", async () => {
        const testUser = new User("user", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testUser;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testUser;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not a customer", status: 401 });
        });

        const response = await request(app).delete(baseURL + '/carts/current').send();

        expect(response.status).toBe(401);
    });
    test("It should return a 503 code if there is an error in the controller", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");
        const errorMessage = "Internal Server Error";
    
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });
    
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });
    
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });
    
        jest.spyOn(CartController.prototype, "clearCart").mockRejectedValueOnce(new Error(errorMessage));
    
        const response = await request(app).delete(baseURL + '/carts/current').send();
    
        expect(response.status).toBe(503);
        expect(response.body.error).toBe(errorMessage);
        expect(CartController.prototype.clearCart).toHaveBeenCalledTimes(1);
        expect(CartController.prototype.clearCart).toHaveBeenCalledWith(testCustomer);
    });
    
    afterAll(() => {
        jest.clearAllMocks();
    });
});

describe("Delete all carts", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("It should return a 200 code if all carts were deleted successfully", async () => {
        const testAdmin = new User("admin", "admin", "surname", Role.ADMIN, "Via Verdi 8", "2000-01-01");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testAdmin;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testAdmin;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "deleteAllCarts").mockResolvedValueOnce(true);

        const response = await request(app).delete(baseURL + '/carts').send();

        expect(response.status).toBe(200);
        expect(CartController.prototype.deleteAllCarts).toHaveBeenCalledTimes(1);
    });

    test("It should return a 401 code if user not logged in", async () => {
        const testAdmin = new User("admin", "admin", "surname", Role.ADMIN, "Via Verdi 8", "2000-01-01");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testAdmin;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        });

        const response = await request(app).delete(baseURL + '/carts').send();

        expect(response.status).toBe(401);
    });

    test("It should return a 401 code if the user is not an admin or manager", async () => {
        const testCustomer = new User("customer", "customer", "surname", Role.CUSTOMER, "Via Verdi 8", "2000-01-01");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not authorized", status: 401 });
        });

        const response = await request(app).delete(baseURL + '/carts').send();

        expect(response.status).toBe(401);
    });

    test("It should return a 503 code if there is an error in the controller", async () => {
        const testAdmin = new User("admin", "admin", "surname", Role.ADMIN, "Via Verdi 8", "2000-01-01");
        const errorMessage = "Internal Server Error";
    
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testAdmin;
            return next();
        });
    
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testAdmin;
            return next();
        });
    
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });
    
        jest.spyOn(CartController.prototype, "deleteAllCarts").mockRejectedValueOnce(new Error(errorMessage));
    
        const response = await request(app).delete(baseURL + '/carts').send();
    
        expect(response.status).toBe(503);
        expect(response.body.error).toBe(errorMessage);
        expect(CartController.prototype.deleteAllCarts).toHaveBeenCalledTimes(1);
    });
    

    afterAll(() => {
        jest.clearAllMocks();
    });
});

describe("Get all carts", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("It should return a 200 code with all carts", async () => {
        const testManager = new User("manager", "manager", "surname", Role.MANAGER, "Via Verdi 8", "2000-01-01");
        const allCarts = [
            new Cart("user1", false, "2024-6-10", 100, [new ProductInCart("Iphone13", 10, Category.SMARTPHONE, 10)]),
            new Cart("user2", false, "2023-5-9", 50, [new ProductInCart("Samsung Galaxy", 5, Category.SMARTPHONE, 10)])
        ];

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testManager;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testManager;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "getAllCarts").mockResolvedValueOnce(allCarts);

        const response = await request(app).get(baseURL + '/carts/all').send();

        expect(response.status).toBe(200);
        expect(response.body).toEqual(allCarts);
        expect(CartController.prototype.getAllCarts).toHaveBeenCalledTimes(1);
    });

    test("It should return a 401 code if user not logged in", async () => {
        const testManager = new User("manager", "manager", "surname", Role.MANAGER, "Via Verdi 8", "2000-01-01");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testManager;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        });

        const response = await request(app).get(baseURL + '/carts/all').send();

        expect(response.status).toBe(401);
    });

    test("It should return a 401 code if the user is not an admin or manager", async () => {
        const testCustomer = new User("customer", "customer", "surname", Role.CUSTOMER, "Via Verdi 8", "2000-01-01");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not authorized", status: 401 });
        });

        const response = await request(app).get(baseURL + '/carts/all').send();

        expect(response.status).toBe(401);
    });
    test("It should return a 503 code if there is an error in the controller", async () => {
        const testAdmin = new User("admin", "admin", "surname", Role.ADMIN, "Via Verdi 8", "2000-01-01");
        const errorMessage = "Internal Server Error";
    
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testAdmin;
            return next();
        });
    
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testAdmin;
            return next();
        });
    
        jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementationOnce((req, res, next) => {
            return next();
        });
    
        jest.spyOn(CartController.prototype, "getAllCarts").mockRejectedValueOnce(new Error(errorMessage));
    
        const response = await request(app).get(baseURL + '/carts/all').send();
    
        expect(response.status).toBe(503);
        expect(response.body.error).toBe(errorMessage);
        expect(CartController.prototype.getAllCarts).toHaveBeenCalledTimes(1);
    });
    
});
describe("Add product to cart", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("It should return a 200 code if the product was added to the cart", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");
        const model = "Iphone13";

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(CartController.prototype, "addToCart").mockResolvedValueOnce(true);

        const response = await request(app).post(baseURL + '/carts').send({ model });

        expect(response.status).toBe(200);
        expect(CartController.prototype.addToCart).toHaveBeenCalledTimes(1);
        expect(CartController.prototype.addToCart).toHaveBeenCalledWith(testCustomer, model);
    });

    test("It should return a 400 code if the model is missing", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        const response = await request(app).post(baseURL + '/carts').send({});

        expect(response.status).toBe(422);
    });

    test("It should return a 400 code if the model is an empty string", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        const response = await request(app).post(baseURL + '/carts').send({ model: "" });

        expect(response.status).toBe(422);
    });

    test("It should return a 401 code if user not logged in", async () => {
        const model = "Iphone13";

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 });
        });

        const response = await request(app).post(baseURL + '/carts').send({ model });

        expect(response.status).toBe(401);
    });

    test("It should return a 401 code if the user is not a customer", async () => {
        const testAdmin = new User("admin", "admin", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");
        const model = "Iphone13";

        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testAdmin;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testAdmin;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not a customer", status: 401 });
        });

        const response = await request(app).post(baseURL + '/carts').send({ model });

        expect(response.status).toBe(401);
    });
    test("It should return a 503 code if there is an error in the controller", async () => {
        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");
        const model = "Iphone13";
        const errorMessage = "Internal Server Error";
    
        jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });
    
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });
    
        jest.spyOn(Authenticator.prototype, "isCustomer").mockImplementationOnce((req, res, next) => {
            return next();
        });
    
        jest.spyOn(CartController.prototype, "addToCart").mockRejectedValueOnce(new Error(errorMessage));
    
        const response = await request(app).post(baseURL + '/carts').send({ model });
    
        expect(response.status).toBe(503);
        expect(response.body.error).toBe(errorMessage);
        expect(CartController.prototype.addToCart).toHaveBeenCalledTimes(1);
        expect(CartController.prototype.addToCart).toHaveBeenCalledWith(testCustomer, model);
    });
    
    afterAll(() => {
        jest.clearAllMocks();
    });
});});