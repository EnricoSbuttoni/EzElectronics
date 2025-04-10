import { test, expect, jest, afterAll, afterEach,describe,beforeAll     } from "@jest/globals"
import CartDao from "../../src/dao/cartDAO"
import { CartNotFoundError, EmptyCartError, ProductNotInCartError } from "../../src/errors/cartError";
import { ProductNotFoundError, ProductSoldError } from "../../src/errors/productError";
import db from "../../src/db/db";
import { Database } from "sqlite3";
import { Cart, ProductInCart } from "../../src/components/cart";
import { Category } from "../../src/components/product";
import dayjs from "dayjs";
import CartDAO from "../../src/dao/cartDAO";

describe("Run all",()=>{
    
    

describe("Add Product", ()=>{
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });
    class MockRunResult {
        lastID: number;
    
        constructor(lastID: number) {
            this.lastID = lastID;
        }
    
        run(sql: string, params: any[], callback: (err: Error | null) => void): this {
            callback(null);
            return this;
        }
    }
    
    test("Correct with non existing Cart", async () => {
        const Dao = new CartDao();
        const model = "ciao";
        const user = "user";
        const mockCart = new Cart(user, false, "2024-6-6", 10, []);
    
        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            const result = new MockRunResult(1);
            callback.call(result, null); // Passa result come this al callback
            return result as unknown as Database;
        });
    
        const mockDBget = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, null);  // No existing cart found
            return {} as Database;
        });
    
        const mockAddProductToCart = jest.spyOn(CartDao.prototype, "addProductToCart").mockImplementation((cart: Cart, model: string, cartId: number, resolve) => {
            resolve(true);
        });
    
        const response = await Dao.addProduct(user, model);
        expect(mockDBrun).toHaveBeenCalledTimes(1);
        expect(mockDBget).toHaveBeenCalledTimes(1);
        expect(mockAddProductToCart).toHaveBeenCalledTimes(1);
        // Verifica il risultato
        expect(response).toBe(true);
    
        // Ripristina le implementazioni originali
        mockDBrun.mockRestore();
        mockDBget.mockRestore();
        mockAddProductToCart.mockRestore();
    });
    test('Correct with existing Cart with only a product', async () => {
        const Dao = new CartDao();
        const model = "ciao";
        const user = "user";
        const existingCart = {
            cartId: 1,
            customer: user,
            paid: false,
            paymentDate: "2024-6-6",
            total: 100
        };
    
        const existingProducts = [
            { model: "ciao", quantity: 1, category:"Smartphone", price: 50 }
        ];    
    
        const mockDBget = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            if (sql.includes('carts')) {
                callback(null, existingCart);
            } else {
                callback(null, null);  // No additional products found
            }
            return {} as Database;
        });
    
        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(null, existingProducts);
            return {} as Database;
        });
    
        const mockAddProductToCart = jest.spyOn(CartDao.prototype, "addProductToCart").mockImplementation((cart: Cart, model: string, cartId: number, resolve) => {
            resolve(true);
        });
        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            const result = new MockRunResult(1);
            callback.call(result, null); // Passa result come this al callback
            return result as unknown as Database;
        });
    
        const response = await Dao.addProduct(user, model);
        expect(mockDBget).toHaveBeenCalledTimes(1);
        expect(mockDBrun).toHaveBeenCalledTimes(0);
        expect(mockDBall).toHaveBeenCalledTimes(1);
        expect(mockAddProductToCart).toHaveBeenCalledTimes(1);
        // Verifica il risultato
        expect(response).toBe(true);
    
        // Ripristina le implementazioni originali
        mockDBget.mockRestore();
        mockDBrun.mockRestore();
        mockDBall.mockRestore();
        mockAddProductToCart.mockRestore();
    });
    test("addProductToCart - Product does not exist", async () => {
        const Dao = new CartDao();
        const cart = new Cart("user", false, "2024-6-6", 100, []);
        const model = "nonexistent";
        const cartId = 1;
    
        const mockDBget = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, null); // Product does not exist
            return {} as Database;
        });
    
        const promise = new Promise<boolean>((resolve, reject) => {
            Dao.addProductToCart(cart, model, cartId, resolve, reject);
        });
    
        await expect(promise).rejects.toThrow(ProductNotFoundError);
        expect(mockDBget).toHaveBeenCalledTimes(1);
        mockDBget.mockRestore();
       
    });
    
    test("addProductToCart - Product is sold out", async () => {
        const Dao = new CartDao();
        const cart = new Cart("user", false, "2024-6-6", 100, []);
        const model = "soldout";
        const cartId = 1;
    
        const mockDBget = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, { model, quantity: 0 }); // Product is sold out
            return {} as Database;
        });
    
        const promise = new Promise<boolean>((resolve, reject) => {
            Dao.addProductToCart(cart, model, cartId, resolve, reject);
        });
    
        await expect(promise).rejects.toThrow(ProductSoldError);
        expect(mockDBget).toHaveBeenCalledTimes(1);
        mockDBget.mockRestore();
      
    });
    
    test("addProductToCart - Product exists in cart", async () => {
        const Dao = new CartDao();
        const model = "existing";
        const user = "user";
        const cartId = 1;
        const cart = new Cart(user, false, "2024-6-6", 100, [
            new ProductInCart(model, 1, Category.SMARTPHONE, 50)
        ]);
    
        const mockDBget = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, { model, quantity: 10, sellingPrice: 50 }); // Product exists
            return {} as Database;
        });
    
        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            callback(null); // Update quantity
            return {} as Database;
        });
    
        const mockUpdateCartCost = jest.spyOn(CartDao.prototype, "updateCartCost").mockImplementation((cart,price,cartId,resolve,reject) => {
            resolve(true);
        });
    
        const promise = new Promise<boolean>((resolve, reject) => {
            Dao.addProductToCart(cart, model, cartId, resolve, reject);
        });
    
        await expect(promise).resolves.toBe(true);
        expect(mockDBget).toHaveBeenCalledTimes(1);
        expect(mockDBrun).toHaveBeenCalledTimes(1);
        expect(mockUpdateCartCost).toHaveBeenCalledTimes(1);
        mockDBget.mockRestore();
        mockDBrun.mockRestore();
       mockUpdateCartCost.mockRestore();
    });
    
    test("updateCartCost success", async () => {
        const Dao = new CartDAO();
        const mockCart = new Cart("Paciok", false, "2024-06-12", 100, [new ProductInCart("ModelX", 1, Category.APPLIANCE, 199.99)]);
        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): any => {
            callback(null);
            return {} as any;
        });

        const promise = new Promise<boolean>((resolve, reject) => {
            Dao.updateCartCost(mockCart, 50, 1, resolve, reject);
        });

        await expect(promise).resolves.toBe(true);
        expect(mockDBrun).toHaveBeenCalledTimes(1);
        expect(mockCart.total).toBe(150);
    });
    
    
});

describe('getCart', () => {

    test('should return the cart with products if an unpaid cart is found for the user', async () => {
        const Dao = new CartDao();
        const username = "user";

        const existingCart = {
            cartId: 1,
            customer: username,
            paid: false,
            paymentDate: "2024-06-06",
            total: 100
        };

        const existingProducts = [
            { model: "product1", quantity: 2, category: "Smartphone", price: 50 }
        ];

        // Mock implementation for db.get
        const mockDBget = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingCart);
            return {} as Database;
        });

        // Mock implementation for db.all
        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(null, existingProducts);
            return {} as Database;
        });

        const result = await Dao.getCart(username);

        const expectedCart = new Cart(username, false, "2024-06-06", 100, [
            new ProductInCart("product1", 2, Category.SMARTPHONE, 50)
        ]);

        expect(mockDBget).toHaveBeenCalledTimes(1);
        expect(mockDBall).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedCart);

        // Restore the original implementations
        mockDBget.mockRestore();
        mockDBall.mockRestore();
    });
    test('should return an empty cart if no unpaid cart is found for the user', async () => {
        const Dao = new CartDao();
        const username = "user";
        const today=dayjs().format("YYYY-MM-DD");
        
        // Mock implementation for db.get
        const mockDBget = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, null); // No cart found
            return {} as Database;
        });

        const result = await Dao.getCart(username);

        expect(mockDBget).toHaveBeenCalledTimes(1);
        expect(result.customer).toEqual("user");
        expect(result.paid).toEqual(false);
        expect(result.paymentDate).toEqual(null);
        expect(result.total).toEqual(0);
        expect(result.products).toEqual([]);
              // Restore the original implementations
        mockDBget.mockRestore();
    });
    test('should throw CartNotFoundError if an error occurs while fetching products', async () => {
        const Dao = new CartDao();
        const username = "user";

        const existingCart = {
            cartId: 1,
            customer: username,
            paid: false,
            paymentDate: "2024-06-06",
            total: 100
        };

        // Mock implementation for db.get
        const mockDBget = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingCart);
            return {} as Database;
        });

        // Mock implementation for db.all to throw an error
        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(new Error('DB error'), []);
            return {} as Database;
        });

        await expect(Dao.getCart(username)).rejects.toThrow(CartNotFoundError);
        expect(mockDBall).toHaveBeenCalledTimes(1);
        // Restore the original implementations
        mockDBget.mockRestore();
        mockDBall.mockRestore();
    });
});

describe('checkoutCart', () => {
    test('should throw EmptyCartError if cart is empty', async () => {
        const Dao = new CartDao();
        const username = "user";

        // Mock implementation for db.all to return an empty cart
        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(null, []);
            return {} as Database;
        });

        await expect(Dao.checkoutCart(username)).rejects.toThrow(EmptyCartError);

        // Restore the original implementation
        mockDBall.mockRestore();
    });

    test('should throw ProductNotFoundError if product is not found in stock', async () => {
        const Dao = new CartDao();
        const username = "user";

        const productsInCart = [
            { model: "product1", quantity: 2 }
        ];

        // Mock implementation for db.all to return products in cart
        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            if (sql.includes('products_in_cart')) {
                callback(null, productsInCart);
            } else if (sql.includes('products')) {
                callback(null, []);
            }
            return {} as Database;
        });

        await expect(Dao.checkoutCart(username)).rejects.toThrow(ProductNotFoundError);

        // Restore the original implementation
        mockDBall.mockRestore();
    });

    test('should throw ProductSoldError if product quantity in cart exceeds stock', async () => {
        const Dao = new CartDao();
        const username = "user";

        const productsInCart = [
            { model: "product1", quantity: 2 }
        ];

        const stockProducts = [
            { model: "product1", quantity: 1 }
        ];

        // Mock implementation for db.all to return products in cart and stock
        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            if (sql.includes('products_in_cart')) {
                callback(null, productsInCart);
            } else if (sql.includes('products')) {
                callback(null, stockProducts);
            }
            return {} as Database;
        });

        await expect(Dao.checkoutCart(username)).rejects.toThrow(ProductSoldError);

        // Restore the original implementation
        mockDBall.mockRestore();
    });

    test('should mark the cart as paid and update product quantities', async () => {
        const Dao = new CartDao();
        const username = "user";

        const productsInCart = [
            { model: "product1", quantity: 2 }
        ];

        const stockProducts = [
            { model: "product1", quantity: 5 }
        ];

        // Mock implementation for db.all to return products in cart and stock
        const mockDBall1 = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            if (sql.includes('products_in_cart')) {
                callback(null, productsInCart);
            } else if (sql.includes('products')) {
                callback(null, stockProducts);
            }
            return {} as Database;
        });

        // Mock implementation for db.run to update cart and product quantities
        const mockDBrun1 = jest.spyOn(db, "run").mockImplementation(function(sql: string, params: any[], callback: (err: Error | null) => void): Database {
            callback.call({ changes: 1 }, null); // Mock the context with `changes` property
            return {} as Database;
        });

        const result = await Dao.checkoutCart(username);

        expect(mockDBall1).toHaveBeenCalledTimes(2);
        expect(mockDBrun1).toHaveBeenCalledTimes(2); // One for marking cart as paid, two for updating product quantities
        expect(result).toBe(true);

        // Restore the original implementation
        mockDBall1.mockRestore();
        mockDBrun1.mockRestore();
    });
});
describe('retrieveCarts', () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });
    test('should return an empty array if no paid carts are found', async () => {
        const Dao = new CartDao();
        const username = "user";

        // Mock implementation for db.all to return no carts
        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(null, []);
            return {} as Database;
        });

        const result = await Dao.retrieveCarts(username);

        expect(mockDBall).toHaveBeenCalledTimes(1);
        expect(result).toEqual([]);

        // Restore the original implementation
        mockDBall.mockRestore();
    });

    test('should return carts with their products if paid carts are found', async () => {
        const Dao = new CartDao();
        const username = "user";

        const paidCarts = [
            { customer: username, paid: true, paymentDate: "2024-06-06", total: 100, cartId: 1 }
        ];

        const productsInCart = [
            { model: "product1", quantity: 2, category: "Smartphone", price: 50 }
        ];

        // Mock implementation for db.all to return paid carts
        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            if (sql.includes('carts')) {
                callback(null, paidCarts);
            } else if (sql.includes('products_in_cart')) {
                callback(null, productsInCart);
            }
            return {} as Database;
        });

        const result = await Dao.retrieveCarts(username);

        const expectedCart = new Cart(username, true, "2024-06-06", 100, [
            new ProductInCart("product1", 2, Category.SMARTPHONE, 50)
        ]);

        expect(mockDBall).toHaveBeenCalledTimes(2); // One for carts, one for products
        expect(result).toEqual([expectedCart]);

        // Restore the original implementation
        mockDBall.mockRestore();
    });

    test('should throw CartNotFoundError if there is an error fetching carts', async () => {
        const Dao = new CartDao();
        const username = "user";

        // Mock implementation for db.all to throw an error when fetching carts
        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            if (sql.includes('carts')) {
                callback(new Error('DB error'), []);
            }
            return {} as Database;
        });

        await expect(Dao.retrieveCarts(username)).rejects.toThrow(CartNotFoundError);

        // Restore the original implementation
        mockDBall.mockRestore();
    });

    test('should throw ProductNotFoundError if there is an error fetching products', async () => {
        const Dao = new CartDao();
        const username = "user";

        const paidCarts = [
            { customer: username, paid: true, paymentDate: "2024-06-06", total: 100, cartId: 1 }
        ];

        // Mock implementation for db.all to return paid carts and throw an error when fetching products
        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            if (sql.includes('carts')) {
                callback(null, paidCarts);
            } else if (sql.includes('products_in_cart')) {
                callback(new ProductNotFoundError(),[]);
            }
            return {} as Database;
        });


        try {
            await Dao.retrieveCarts(username);
        } catch (error) {
            //console.error("Error caught in test:", error);
            expect(error).toBeInstanceOf(ProductNotFoundError);
        }

        // Restore the original implementation
        mockDBall.mockRestore();
    });
});

describe('deleteAllCarts', () => {
    test('should return true when all carts and products are deleted successfully', async () => {
        const Dao = new CartDao();

        // Mock implementation for db.run to simulate successful deletion
        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            callback(null); // No error
            return {} as Database;
        });

        const result = await Dao.deleteAllCarts();

        expect(mockDBrun).toHaveBeenCalledTimes(2); // One for products, one for carts
        expect(result).toBe(true);

        // Restore the original implementation
        mockDBrun.mockRestore();
    });

    test('should return false when there is an error deleting products', async () => {
        const Dao = new CartDao();

        // Mock implementation for db.run to simulate an error when deleting products
        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            if (sql.includes('PRODUCTS_IN_CART')) {
                callback(new Error('DB error'));
            } else {
                callback(null);
            }
            return {} as Database;
        });

        const result = await Dao.deleteAllCarts();

        expect(mockDBrun).toHaveBeenCalledTimes(2); // Only called for products
        expect(result).toBe(false);

        // Restore the original implementation
        mockDBrun.mockRestore();
    });

    test('should return false when there is an error deleting carts', async () => {
        const Dao = new CartDao();

        // Mock implementation for db.run to simulate successful deletion of products but error when deleting carts
        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            if (sql.includes('CARTS')) {
                callback(new Error('DB error'));
            } else {
                callback(null);
            }
            return {} as Database;
        });

        const result = await Dao.deleteAllCarts();

        expect(mockDBrun).toHaveBeenCalledTimes(2); // One for products, one for carts
        expect(result).toBe(false);

        // Restore the original implementation
        mockDBrun.mockRestore();
    });
});


describe('getAllCarts', () => {
    test('should return an empty array if no carts are found', async () => {
        const Dao = new CartDao();

        // Mock implementation for db.all to return no carts
        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(null, []);
            return {} as Database;
        });

        const result = await Dao.getAllCarts();

        expect(mockDBall).toHaveBeenCalledTimes(1);
        expect(result).toEqual([]);

        // Restore the original implementation
        mockDBall.mockRestore();
    });

    test('should return carts with their products if carts are found', async () => {
        const Dao = new CartDao();

        const carts = [
            { customer: "user1", paid: true, paymentDate: "2024-06-06", total: 100, cartId: 1 },
            { customer: "user2", paid: false, paymentDate: "2024-06-07", total: 200, cartId: 2 }
        ];

        const productsInCart1 = [
            { model: "product1", quantity: 2, category: "Smartphone", price: 50 }
        ];

        const productsInCart2 = [
            { model: "product2", quantity: 1, category: "Laptop", price: 20 }
        ];

        // Mock implementation for db.all to return carts and products
        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            if (sql.includes('carts')) {
                callback(null, carts);
            } else if (sql.includes('products_in_cart') && params[0] === 1) {
                callback(null, productsInCart1);
            } else if (sql.includes('products_in_cart') && params[0] === 2) {
                callback(null, productsInCart2);
            }
            return {} as Database;
        });

        const result = await Dao.getAllCarts();

        const expectedCarts = [
            new Cart("user1", true, "2024-06-06", 100, [new ProductInCart("product1", 2, Category.SMARTPHONE, 50)]),
            new Cart("user2", false, "2024-06-07", 200, [new ProductInCart("product2", 1, Category.LAPTOP, 20)])
        ];

        expect(mockDBall).toHaveBeenCalledTimes(3); // One for carts, one for each set of products
        expect(result).toEqual(expectedCarts);

        // Restore the original implementation
        mockDBall.mockRestore();
    });

    test('should throw an error if there is an issue fetching carts', async () => {
        const Dao = new CartDao();

        // Mock implementation for db.all to throw an error when fetching carts
        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            if (sql.includes('carts')) {
                callback(new Error('DB error'), []);
            }
            return {} as Database;
        });

        await expect(Dao.getAllCarts()).rejects.toThrow(Error);

        // Restore the original implementation
        mockDBall.mockRestore();
    });

    test('should throw an error if there is an issue fetching products for a cart', async () => {
        const Dao = new CartDao();

        const carts = [
            { customer: "user1", paid: true, paymentDate: "2024-06-06", total: 100, cartId: 1 }
        ];

        // Mock implementation for db.all to return carts and throw an error when fetching products
        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            if (sql.includes('carts')) {
                callback(null, carts);
            } else if (sql.includes('products_in_cart')) {
                callback(new Error('DB error'), []);
            }
            return {} as Database;
        });

        await expect(Dao.getAllCarts()).rejects.toThrow(Error);

        // Restore the original implementation
        mockDBall.mockRestore();
    });
});


describe('removeFromCart', () => {
    test('It should remove the product from the cart', async () => {
        const Dao = new CartDao();
        const model = "ciao";
        const user = "user";

        // Mock implementation for db.get
        const mockDBGet = jest.spyOn(db, "get")
            .mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
                if (sql.includes('carts')) {
                    callback(null, { cartId: 1, total: 100 });
                } else if (sql.includes('products_in_cart')) {
                    callback(null, { price: 20, quantity: 1 });
                } else {
                    callback(new Error('Unexpected query'), null);
                }
                return {} as Database;
            });

        // Mock implementation for db.run
        const mockDBRun = jest.spyOn(db, "run")
            .mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
                callback(null);
                return {} as Database;
            });

        const result = await Dao.removeFromCart(user, model);

        expect(mockDBRun).toHaveBeenCalledTimes(2);
        expect(mockDBGet).toHaveBeenCalledTimes(2);
        expect(result).toBe(true);

        mockDBGet.mockRestore();
        mockDBRun.mockRestore();
    });

    test("It should return false if the product is not found", async () => {
        const Dao = new CartDao();
        const model = "ciao";
        const user = "user";

        // Mock implementation for db.get
        const mockDBGet = jest.spyOn(db, "get")
            .mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
                if (sql.includes('carts')) {
                    callback(null, { cartId: 1, total: 100 });
                } else if (sql.includes('products_in_cart')) {
                    callback(new ProductNotInCartError(), null);
                } else {
                    callback(new Error('Unexpected query'), null);
                }
                return {} as Database;
            });

        // Mock implementation for db.run
        const mockDBRun = jest.spyOn(db, "run")
            .mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
                callback(null);
                return {} as Database;
            });

            try {
                await Dao.removeFromCart(user,model);
            } catch (error) {
                //console.error("Error caught in test:", error);
                expect(error).toBeInstanceOf(ProductNotInCartError);
            }
        // Verify that db.run was not called
        expect(mockDBRun).toHaveBeenCalledTimes(0);
        // Verify that db.get was called 2 times
        expect(mockDBGet).toHaveBeenCalledTimes(2);
        // Verify the result

        // Restore original implementations
        mockDBGet.mockRestore();
        mockDBRun.mockRestore();
    });

    test("It should return false if the cart is not found", async () => {
        const Dao = new CartDao();
        const model = "ciao";
        const user = "user";

        // Mock implementation for db.get
        const mockDBGet = jest.spyOn(db, "get")
            .mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
                if (sql.includes('carts')) {
                    callback(new CartNotFoundError(), null);
                } else if (sql.includes('products_in_cart')) {
                    callback(null, { price: 20, quantity: 1 });
                } else {
                    callback(new Error('Unexpected query'), null);
                }
                return {} as Database;
            });

        // Mock implementation for db.run
        const mockDBRun = jest.spyOn(db, "run")
            .mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
                callback(null);
                return {} as Database;
            });

            try {
                await Dao.removeFromCart(user,model);
            } catch (error) {
                //console.error("Error caught in test:", error);
                expect(error).toBeInstanceOf(CartNotFoundError);
            }
        // Verify that db.run was not called
        expect(mockDBRun).toHaveBeenCalledTimes(0);
        // Verify that db.get was called 1 time
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        // Verify the result

        // Restore original implementations
        mockDBGet.mockRestore();
        mockDBRun.mockRestore();
    });
});

describe("removeAllfromCart", () => {
    test("It should remove all products from the cart", async () => {
        const Dao = new CartDao();
        const user = "user";

        // Mock implementation for db.get
        const mockDBGet = jest.spyOn(db, "get")
            .mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
                if (sql.includes('carts')) {
                    callback(null, { cartId: 1, total: 100 });
                } else {
                    callback(new Error('Unexpected query'), null);
                }
                return {} as Database;
            });

        // Mock implementation for db.run
        const mockDBRun = jest.spyOn(db, "run")
            .mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
                callback(null);
                return {} as Database;
            });

        const result = await Dao.removeAllfromCart(user);

        expect(mockDBRun).toHaveBeenCalledTimes(2);

        expect(mockDBGet).toHaveBeenCalledTimes(1);
        // Verify the result
        expect(result).toBe(true);

        // Restore original implementations
        mockDBGet.mockRestore();
        mockDBRun.mockRestore();
    });

    test("It should return false if no cart is connected with the user", async () => {
        const Dao = new CartDao();
        const user = "user";

        // Mock implementation for db.get
        const mockDBGet = jest.spyOn(db, "get")
            .mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
                if (sql.includes('carts')) {
                    callback(new CartNotFoundError(), null);
                } else {
                    callback(new Error('Unexpected query'), null);
                }
                return {} as Database;
            });

        // Mock implementation for db.run
        const mockDBRun = jest.spyOn(db, "run")
            .mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
                callback(null);
                return {} as Database;
            });

            try {
                await Dao.removeAllfromCart(user);
            } catch (error) {
                //console.error("Error caught in test:", error);
                expect(error).toBeInstanceOf(CartNotFoundError);
            }
        // Verify that db.run was not called
        expect(mockDBRun).toHaveBeenCalledTimes(0);
        // Verify that db.get was called 1 time
        expect(mockDBGet).toHaveBeenCalledTimes(1);
        // Verify the result

        // Restore original implementations
        mockDBGet.mockRestore();
        mockDBRun.mockRestore();
    });
});




});