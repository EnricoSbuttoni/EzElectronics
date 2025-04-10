import {test, expect, jest, afterEach,describe,beforeAll} from "@jest/globals"
import ProductDAO from "../../src/dao/productDAO";
import { Category, Product } from "../../src/components/product";
import db from "../../src/db/db";
import { Database } from "sqlite3";
import { ProductAlreadyExistsError, ProductNotFoundError, ProductSoldError } from "../../src/errors/productError";
import { DateError } from "../../src/utilities";

describe("DAO TEST", ()=>{
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("Register new Products - SUCCESS", async () => {
        const Dao = new ProductDAO();
    
        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            callback(null);
            return {} as Database;
        });
    
    
        const response = await Dao.registerProducts("test", Category.SMARTPHONE, 10, null, 10, "2024-04-12");
        expect(mockDBrun).toHaveBeenCalledTimes(1);
        expect(response).toBeUndefined();
    });

    test("Register new Products - ProductAlreadyExistsError", async () => {
        const Dao = new ProductDAO();
    
        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            const err = new Error("UNIQUE constraint failed: products.model")
            callback(err);
            return {} as Database;
        });
    
        expect(mockDBrun).toHaveBeenCalledTimes(0);
        expect(async() => {
            await Dao.registerProducts("test", Category.SMARTPHONE, 10, null, 10, "2024-04-12");
        }).rejects.toThrow(ProductAlreadyExistsError);

    });

    test("Change product quantity - SUCCESS", async () => {
        const Dao = new ProductDAO();

        const existingArrivalDate = {arrivalDate: "2024-04-01"};
        const finalQuantity = {quantity: 10};

        const mockDBget = jest.spyOn(db, "get").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingArrivalDate); 
            return {} as Database;
        }).mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, finalQuantity); 
            return {} as Database;
        });
    
        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            callback(null); 
            return {} as Database;
        });

        const response = await Dao.changeProductQuantity("test",5,"2024-04-05");
        
        expect(mockDBget).toHaveBeenCalledTimes(2);
        expect(mockDBrun).toHaveBeenCalledTimes(1);
        expect(response).toBe(10);
    });

    test("Change product quantity - ProductNotFoundError", async () => {
        const Dao = new ProductDAO();

        const mockDBget = jest.spyOn(db, "get").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, undefined); 
            return {} as Database;
        });

        expect(async() => {
            await Dao.changeProductQuantity("test",5,"2024-04-05");
        }).rejects.toThrow(ProductNotFoundError);
        
        expect(mockDBget).toHaveBeenCalledTimes(1);
    });

    test("Change product quantity - DateError", async () => {
        const Dao = new ProductDAO();

        const existingArrivalDate = "2026-04-01";

        const mockDBget = jest.spyOn(db, "get").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingArrivalDate); 
            return {} as Database;
        });

        expect(async() => {
            await Dao.changeProductQuantity("test",5,"2024-04-05");
        }).rejects.toThrow(DateError);
        
        expect(mockDBget).toHaveBeenCalledTimes(1);
    });

    test("Sell product - SUCCESS", async () => {
        const Dao = new ProductDAO();

        const existingArrivalDate = {arrivalDate: "2024-04-01"};
        const existingQuantity = {quanityt: 10};
        const testQuantity = 5;
        const finalQuantity = {quantity: 5};

        const mockDBget = jest.spyOn(db, "get").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingArrivalDate); 
            return {} as Database;
        }).mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingQuantity); 
            return {} as Database;
        }).mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, finalQuantity); 
            return {} as Database;
        });

        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            callback(null); 
            return {} as Database;
        });

        const response = await Dao.sellProduct("test", testQuantity, "2024-04-12");

        expect(mockDBget).toHaveBeenCalledTimes(3);
        expect(mockDBrun).toHaveBeenCalledTimes(1);
        expect(response).toBe(5);
    });

    test("Sell product - ProductNotFoundError - 1st query", async () => {
        const Dao = new ProductDAO();

        const testQuantity = 5;

        const mockDBget = jest.spyOn(db, "get").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, undefined); 
            return {} as Database;
        });

        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            callback(null); 
            return {} as Database;
        });

        expect(async() => {
            await Dao.sellProduct("test",testQuantity,"2024-04-05");
        }).rejects.toThrow(ProductNotFoundError);

        expect(mockDBget).toHaveBeenCalledTimes(1);
        expect(mockDBrun).toHaveBeenCalledTimes(0);
    });

    test("Sell product - DateError", async () => {
        const Dao = new ProductDAO();

        const existingArrivalDate = "2026-04-01";
        const testQuantity = 5;

        const mockDBget = jest.spyOn(db, "get").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingArrivalDate); 
            return {} as Database;
        });

        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            callback(null); 
            return {} as Database;
        });

        expect(async() => {
            await Dao.sellProduct("test",testQuantity,"2024-04-05");
        }).rejects.toThrow(DateError);

        expect(mockDBget).toHaveBeenCalledTimes(1);
        expect(mockDBrun).toHaveBeenCalledTimes(0);
    });

    test("Sell product - ProductNotFoundError - 2nd query", async () => {
        const Dao = new ProductDAO();

        const existingArrivalDate = {arrivalDate: "2024-04-01"};
        const testQuantity = 5;

        const mockDBget = jest.spyOn(db, "get").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingArrivalDate); 
            return {} as Database;
        }).mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, undefined); 
            return {} as Database;
        });

        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            callback(null); 
            return {} as Database;
        });

        expect(async() => {
            await Dao.sellProduct("test",testQuantity,"2024-04-05");
        }).rejects.toThrow(ProductNotFoundError);

        expect(mockDBget).toHaveBeenCalledTimes(2);
        expect(mockDBrun).toHaveBeenCalledTimes(0);
    });

    test("Sell product - ProductSoldError - 1st case", async () => {
        const Dao = new ProductDAO();

        const existingArrivalDate = {arrivalDate: "2024-04-01"};
        const existingQuantity = {quantity: 0};
        const testQuantity = 5;

        const mockDBget = jest.spyOn(db, "get").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingArrivalDate); 
            return {} as Database;
        }).mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingQuantity); 
            return {} as Database;
        });

        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            callback(null); 
            return {} as Database;
        });

        expect(async() => {
            await Dao.sellProduct("test",testQuantity,"2024-04-05");
        }).rejects.toThrow(ProductSoldError);

        expect(mockDBget).toHaveBeenCalledTimes(2);
        expect(mockDBrun).toHaveBeenCalledTimes(0);
    });

    test("Sell product - ProductSoldError - 2nd case", async () => {
        const Dao = new ProductDAO();

        const existingArrivalDate = {arrivalDate: "2024-04-01"};
        const existingQuantity = {quantity: 4};
        const testQuantity = 5;

        const mockDBget = jest.spyOn(db, "get").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingArrivalDate); 
            return {} as Database;
        }).mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingQuantity); 
            return {} as Database;
        });

        const mockDBrun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            callback(null); 
            return {} as Database;
        });

        expect(async() => {
            await Dao.sellProduct("test",testQuantity,"2024-04-05");
        }).rejects.toThrow(ProductSoldError);

        expect(mockDBget).toHaveBeenCalledTimes(2);
        expect(mockDBrun).toHaveBeenCalledTimes(0);
    });

    test("Get products - SUCCESS - grouping = null", async () => {
        const Dao = new ProductDAO();

        const testProduct1 = new Product(10,"test1",Category.SMARTPHONE,"2024-01-04",null,10);
        const testProduct2 = new Product(10,"test2",Category.LAPTOP,"2024-05-04",null,10);
        const existingProducts = [testProduct1,testProduct2];


        const mockDBall = jest.spyOn(db, "all").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingProducts); 
            return {} as Database;
        });

        const response = await Dao.getProducts(null, null, null);

        expect(mockDBall).toHaveBeenCalledTimes(1);
        expect(response).toStrictEqual(existingProducts);
    });

    test("Get products - SUCCESS - grouping = model", async () => {
        const Dao = new ProductDAO();

        const testProduct1 = new Product(10,"test1",Category.SMARTPHONE,"2024-01-04",null,10);
        const testProduct2 = new Product(10,"test2",Category.LAPTOP,"2024-05-04",null,10);
        const existingProducts = [testProduct1,testProduct2];


        const mockDBall = jest.spyOn(db, "all").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, [testProduct1]); 
            return {} as Database;
        });

        const response = await Dao.getProducts("model", null, "test1");

        expect(mockDBall).toHaveBeenCalledTimes(1);
        expect(response).toStrictEqual([testProduct1]);
    });

    test("Get products - SUCCESS - grouping = category", async () => {
        const Dao = new ProductDAO();

        const testProduct1 = new Product(10,"test1",Category.SMARTPHONE,"2024-01-04",null,10);
        const testProduct2 = new Product(10,"test2",Category.LAPTOP,"2024-05-04",null,10);

        const mockDBall = jest.spyOn(db, "all").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, [testProduct2]); 
            return {} as Database;
        });

        const response = await Dao.getProducts("category", "Laptop", null);

        expect(mockDBall).toHaveBeenCalledTimes(1);
        expect(response).toStrictEqual([testProduct2]);
    });

    test("Get available products - SUCCESS - grouping = null", async () => {
        const Dao = new ProductDAO();
    
        const testProduct1 = new Product(10,"test1",Category.SMARTPHONE,"2024-01-04",null,10);
        const testProduct2 = new Product(10,"test2",Category.LAPTOP,"2024-05-04",null,10);
        const existingProducts = [testProduct1,testProduct2];
    
    
        const mockDBall = jest.spyOn(db, "all").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingProducts); 
            return {} as Database;
        });
    
        const response = await Dao.getAvailableProducts(null, null, null);
    
        expect(mockDBall).toHaveBeenCalledTimes(1);
        expect(response).toStrictEqual(existingProducts);
    });
    
    test("Get available products - SUCCESS - grouping = model", async () => {
        const Dao = new ProductDAO();
    
        const testProduct1 = new Product(10,"test1",Category.SMARTPHONE,"2024-01-04",null,10);
        const testProduct2 = new Product(10,"test2",Category.LAPTOP,"2024-05-04",null,10);
        const existingProducts = [testProduct1,testProduct2];
    
    
        const mockDBall = jest.spyOn(db, "all").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, [testProduct1]); 
            return {} as Database;
        });
    
        const response = await Dao.getAvailableProducts("model", null, "test1");
    
        expect(mockDBall).toHaveBeenCalledTimes(1);
        expect(response).toStrictEqual([testProduct1]);
    });
    
    test("Get available products - SUCCESS - grouping = category", async () => {
        const Dao = new ProductDAO();
    
        const testProduct1 = new Product(10,"test1",Category.SMARTPHONE,"2024-01-04",null,10);
        const testProduct2 = new Product(10,"test2",Category.LAPTOP,"2024-05-04",null,10);
        const existingProducts = [testProduct1,testProduct2];
    
    
        const mockDBall = jest.spyOn(db, "all").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, [testProduct2]); 
            return {} as Database;
        });
    
        const response = await Dao.getAvailableProducts("category", "Laptop", null);
    
        expect(mockDBall).toHaveBeenCalledTimes(1);
        expect(response).toStrictEqual([testProduct2]);
    });

    test("Delete all products - SUCCESS", async () => {
        const Dao = new ProductDAO();

        const mockDBrun = jest.spyOn(db, "run").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            callback(null); 
            return {} as Database;
        });
    
        const response = await Dao.deleteAllProducts();
    
        expect(mockDBrun).toHaveBeenCalledTimes(1);
        expect(response).toBe(true);
    });

    test("Delete product - SUCCESS", async () => {
        const Dao = new ProductDAO();
    
        const existingModel = "test";
    
    
        const mockDBget = jest.spyOn(db, "get").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, existingModel); 
            return {} as Database;
        });

        const mockDBrun = jest.spyOn(db, "run").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            callback(null); 
            return {} as Database;
        });
    
        const response = await Dao.deleteProduct(existingModel);
    
        expect(mockDBget).toHaveBeenCalledTimes(1);
        expect(mockDBrun).toHaveBeenCalledTimes(1);
        expect(response).toBe(true);
    });

    test("Delete product - ProductNotFoundError", async () => {
        const Dao = new ProductDAO();
    
        const existingModel = "test";
    
        const mockDBget = jest.spyOn(db, "get").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
            callback(null, undefined); 
            return {} as Database;
        });

        const mockDBrun = jest.spyOn(db, "run").mockImplementationOnce((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
            callback(null); 
            return {} as Database;
        });
        
        expect(async() => {
            await Dao.deleteProduct(existingModel);
        }).rejects.toThrow(ProductNotFoundError);
    
        expect(mockDBget).toHaveBeenCalledTimes(1);
        expect(mockDBrun).toHaveBeenCalledTimes(0);
    });
 })

