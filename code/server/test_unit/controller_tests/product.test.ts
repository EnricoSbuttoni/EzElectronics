import {jest, test, expect, beforeAll, afterEach, afterAll, describe} from "@jest/globals"
import { User, Role } from "../../src/components/user";
import { Category, Product } from "../../src/components/product";
import ProductDAO from "../../src/dao/productDAO";
import ProductController from "../../src/controllers/productController";
import db from "../../src/db/db";
import { Database } from "sqlite3";
import { DateError } from "../../src/utilities";
import { GroupingError } from "../../src/errors/productError";

const mockAuthenticateUser = jest.fn()

describe("CONTROLLER TEST", () => {

    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    jest.mock("../../src/dao/productDAO");

    test("Registering a new Product - SUCCESS", async () => {

        mockAuthenticateUser.mockReturnValueOnce(true);
        jest.spyOn(ProductDAO.prototype, "registerProducts").mockResolvedValueOnce();

        const controller = new ProductController();
        const response = await controller.registerProducts("test", Category.SMARTPHONE, 10, null, 20, "2024-04-05")

        expect(ProductDAO.prototype.registerProducts).toHaveBeenCalledTimes(1);
        expect(ProductDAO.prototype.registerProducts).toHaveBeenCalledWith("test", Category.SMARTPHONE, 10, null, 20, "2024-04-05");
        expect(response).toBeUndefined();
    });

    test("Registering a new Product - DateError", async () => {
        mockAuthenticateUser.mockReturnValueOnce(true);
    
        const registerProductsMock = jest.spyOn(ProductDAO.prototype, "registerProducts").mockResolvedValueOnce();
    
        const controller = new ProductController();
    
        await expect(async () => {
            await controller.registerProducts("test", Category.SMARTPHONE, 10, null, 20, "2026-04-05");
        }).rejects.toThrow(DateError);
    
        expect(registerProductsMock).toHaveBeenCalledTimes(0);
    });

    test("Change product quantity - SUCCESS", async () => {

        const testQuantity = 5;

        const existingProductQuantity = 10;

        const mockDBget = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingProductQuantity);
            return {} as Database;
        });

        mockAuthenticateUser.mockReturnValueOnce(true);
        jest.spyOn(ProductDAO.prototype, "changeProductQuantity").mockResolvedValueOnce(testQuantity+existingProductQuantity);

        const controller = new ProductController();
        const response = await controller.changeProductQuantity("test",testQuantity,"2024-04-05");

        expect(ProductDAO.prototype.changeProductQuantity).toHaveBeenCalledTimes(1);
        expect(ProductDAO.prototype.changeProductQuantity).toHaveBeenCalledWith("test",testQuantity,"2024-04-05");
        expect(response).toBe(testQuantity+existingProductQuantity);
    });

    test("Change product quantity - DateError", async () => {

        const testQuantity = 5;
        const existingProductQuantity = 10;

        const mockDBget = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingProductQuantity);
            return {} as Database;
        });

        mockAuthenticateUser.mockReturnValueOnce(true);
        const changeProductQuantityMock = jest.spyOn(ProductDAO.prototype, "changeProductQuantity").mockResolvedValueOnce(testQuantity+existingProductQuantity);

        const controller = new ProductController();

        await expect(async () => {
            await controller.changeProductQuantity("test",testQuantity,"2026-04-05");
        }).rejects.toThrow(DateError);
    
        expect(changeProductQuantityMock).toHaveBeenCalledTimes(0);
    });

    test("Sell product - SUCCESS", async() => {

        const testQuantity = 5;
        const existingProductQuantity = 10;

        const mockDBget = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingProductQuantity);
            return {} as Database;
        });
        mockAuthenticateUser.mockReturnValueOnce(true);
        const sellProductQuantityMock = jest.spyOn(ProductDAO.prototype, "sellProduct").mockResolvedValueOnce(existingProductQuantity-testQuantity)

        const controller = new ProductController();

        const response = await controller.sellProduct("test",testQuantity,"2024-04-05");
            
        expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledTimes(1);
        expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledWith("test",testQuantity,"2024-04-05");
        expect(response).toBe(existingProductQuantity-testQuantity);
    })

    test("Sell product - DateError", async() => {

        const testQuantity = 5;
        const existingProductQuantity = 10;

        const mockDBget = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingProductQuantity);
            return {} as Database;
        });
        mockAuthenticateUser.mockReturnValueOnce(true);
        const sellProductQuantityMock = jest.spyOn(ProductDAO.prototype, "sellProduct").mockResolvedValueOnce(existingProductQuantity-testQuantity)

        const controller = new ProductController();

        await expect(async () => {
            await controller.sellProduct("test",testQuantity,"2026-04-05");
        }).rejects.toThrow(DateError);
            
        expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledTimes(0);
    })

    test("Get products - SUCCESS", async() => {

        const existingProducts = [
            new Product(10, "test", Category.SMARTPHONE, "2024-04-13","",20)
        ];

        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(null, existingProducts);
            return {} as Database;
        });

        mockAuthenticateUser.mockReturnValueOnce(true);
        const getProductsMock = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce(existingProducts)

        const controller = new ProductController();

        const response = await controller.getProducts("category","Smartphone",null);
            
        expect(ProductDAO.prototype.getProducts).toHaveBeenCalledTimes(1);
        expect(ProductDAO.prototype.getProducts).toHaveBeenCalledWith("category","Smartphone",null);

        expect(response).toBe(existingProducts);
    })

    test("Get products - GroupingError - grouping as category but category falsy", async() => {

        const existingProducts = [
            new Product(10, "test", Category.SMARTPHONE, "2024-04-13","",20)
        ];

        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(null, existingProducts);
            return {} as Database;
        });

        mockAuthenticateUser.mockReturnValueOnce(true);
        const getProductsMock = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce(existingProducts)

        const controller = new ProductController();


        await expect(async () => {
            await controller.getProducts("category",null,null);
        }).rejects.toThrow(GroupingError);
            
        expect(ProductDAO.prototype.getProducts).toHaveBeenCalledTimes(0);
    })

    test("Get products - GroupingError - grouping as model but model falsy", async() => {

        const existingProducts = [
            new Product(10, "test", Category.SMARTPHONE, "2024-04-13","",20)
        ];

        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(null, existingProducts);
            return {} as Database;
        });

        mockAuthenticateUser.mockReturnValueOnce(true);
        const getProductsMock = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce(existingProducts)

        const controller = new ProductController();


        await expect(async () => {
            await controller.getProducts("model",null,null);
        }).rejects.toThrow(GroupingError);
            
        expect(ProductDAO.prototype.getProducts).toHaveBeenCalledTimes(0);
    })

    test("Get products - GroupingError - grouping as category but model not falsy", async() => {

        const existingProducts = [
            new Product(10, "test", Category.SMARTPHONE, "2024-04-13","",20)
        ];

        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(null, existingProducts);
            return {} as Database;
        });

        mockAuthenticateUser.mockReturnValueOnce(true);
        const getProductsMock = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce(existingProducts)

        const controller = new ProductController();


        await expect(async () => {
            await controller.getProducts("category","Smartphone","test");
        }).rejects.toThrow(GroupingError);
            
        expect(ProductDAO.prototype.getProducts).toHaveBeenCalledTimes(0);
    })

    test("Get products - GroupingError - grouping as model but category not falsy", async() => {

        const existingProducts = [
            new Product(10, "test", Category.SMARTPHONE, "2024-04-13","",20)
        ];

        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(null, existingProducts);
            return {} as Database;
        });

        mockAuthenticateUser.mockReturnValueOnce(true);
        const getProductsMock = jest.spyOn(ProductDAO.prototype, "getProducts").mockResolvedValueOnce(existingProducts)

        const controller = new ProductController();

        await expect(async () => {
            await controller.getProducts("category","Smartphone","test");
        }).rejects.toThrow(GroupingError);
            
        expect(ProductDAO.prototype.getProducts).toHaveBeenCalledTimes(0);
    })

    test("Get available products - SUCCESS", async() => {

        const existingProducts = [
            new Product(10, "test", Category.SMARTPHONE, "2024-04-13","",20)
        ];

        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(null, existingProducts);
            return {} as Database;
        });

        mockAuthenticateUser.mockReturnValueOnce(true);
        const getProductsMock = jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValueOnce(existingProducts)

        const controller = new ProductController();

        const response = await controller.getAvailableProducts("category","Smartphone",null);
            
        expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledTimes(1);
        expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledWith("category","Smartphone",null);

        expect(response).toBe(existingProducts);
    })

    test("Get available products - GroupingError - grouping as category but category falsy", async() => {

        const existingProducts = [
            new Product(10, "test", Category.SMARTPHONE, "2024-04-13","",20)
        ];

        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(null, existingProducts);
            return {} as Database;
        });

        mockAuthenticateUser.mockReturnValueOnce(true);
        const getProductsMock = jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValueOnce(existingProducts)

        const controller = new ProductController();

        await expect(async () => {
            await controller.getAvailableProducts("category",null,null);
        }).rejects.toThrow(GroupingError);
            
        expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledTimes(0);
    })

    test("Get available products - GroupingError - grouping as model but model falsy", async() => {

        const existingProducts = [
            new Product(10, "test", Category.SMARTPHONE, "2024-04-13","",20)
        ];

        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(null, existingProducts);
            return {} as Database;
        });

        mockAuthenticateUser.mockReturnValueOnce(true);
        const getProductsMock = jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValueOnce(existingProducts)

        const controller = new ProductController();


        await expect(async () => {
            await controller.getAvailableProducts("model",null,null);
        }).rejects.toThrow(GroupingError);
            
        expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledTimes(0);
    })

    test("Get available products - GroupingError - grouping as category but model not falsy", async() => {

        const existingProducts = [
            new Product(10, "test", Category.SMARTPHONE, "2024-04-13","",20)
        ];

        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(null, existingProducts);
            return {} as Database;
        });

        mockAuthenticateUser.mockReturnValueOnce(true);
        const getProductsMock = jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValueOnce(existingProducts)

        const controller = new ProductController();


        await expect(async () => {
            await controller.getAvailableProducts("category","Smartphone","test");
        }).rejects.toThrow(GroupingError);
            
        expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledTimes(0);
    })

    test("Get available products - GroupingError - grouping as model but category not falsy", async() => {

        const existingProducts = [
            new Product(10, "test", Category.SMARTPHONE, "2024-04-13","",20)
        ];

        const mockDBall = jest.spyOn(db, "all").mockImplementation((sql: string, params: any[], callback: (err: Error | null, rows: any[]) => void): Database => {
            callback(null, existingProducts);
            return {} as Database;
        });

        mockAuthenticateUser.mockReturnValueOnce(true);
        const getProductsMock = jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockResolvedValueOnce(existingProducts)

        const controller = new ProductController();


        await expect(async () => {
            await controller.getAvailableProducts("category","Smartphone","test");
        }).rejects.toThrow(GroupingError);
            
        expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledTimes(0);
    })
    

    test("Delete all products - SUCCESS", async() => {

        mockAuthenticateUser.mockReturnValueOnce(true);
        const deleteAllProductsMock = jest.spyOn(ProductDAO.prototype, "deleteAllProducts").mockResolvedValueOnce(true)

        const controller = new ProductController();

        const response = await controller.deleteAllProducts();
            
        expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalledTimes(1);
        expect(ProductDAO.prototype.deleteAllProducts).toHaveBeenCalledWith();

        expect(response).toBe(true);
    })

    test("Delete a single product - SUCCESS", async() => {

        mockAuthenticateUser.mockReturnValueOnce(true);
        const deleteProductMock = jest.spyOn(ProductDAO.prototype, "deleteProduct").mockResolvedValueOnce(true)

        const controller = new ProductController();

        const response = await controller.deleteProduct("test");
            
        expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledTimes(1);
        expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledWith("test");

        expect(response).toBe(true);
    })
})