import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals";
import db from "../../src/db/db";
import ReviewDAO from "../../src/dao/reviewDAO";
import { ProductReview } from "../../src/components/review";
import { ProductNotFoundError } from "../../src/errors/productError";
import { ExistingReviewError, NoReviewProductError } from "../../src/errors/reviewError";

jest.mock("../../src/db/db");

function mockDBGetProductExists() {
    return jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
        callback(null, { count: 1 }); 
        return db;
    });
}

function mockDBGetReviewDoesNotExist() {
    return jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
        callback(null, { count: 0 }); 
        return db;
    });
}

function mockDBRunSuccess() {
    return jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        if (callback) {
            callback(null); 
        }
        return db;
    });
}

describe("ReviewDAO tests", () => {
    let reviewDAO: ReviewDAO;

    beforeAll(() => {
        reviewDAO = new ReviewDAO();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    test("addReview should successfully add a review", async () => {
        const mockDBGet = mockDBGetProductExists().mockImplementationOnce((sql, params, callback) => {
            callback(null, { count: 0 }); 
            return db;
        });
        const mockDBRun = mockDBRunSuccess();

        await expect(reviewDAO.addReview("modelX", "userY", 5, "Great product", "2023-01-01")).resolves.toBeUndefined();

        mockDBGet.mockRestore();
        mockDBRun.mockRestore();
    });

    test("addReview should throw ProductNotFoundError if product does not exist", async () => {
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 0 }); 
            return db; 
        });

        await expect(reviewDAO.addReview("modelX", "userY", 5, "Great product", "2023-01-01")).rejects.toThrow(ProductNotFoundError);
    });

    test("addReview should throw ExistingReviewError if review already exists", async () => {
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { count: 1 }); 
            return db; 
        }).mockImplementationOnce((sql, params, callback) => {
            callback(null, { count: 1 });
            return db; 
        });

        await expect(reviewDAO.addReview("modelX", "userY", 5, "Great product", "2023-01-01")).rejects.toThrow(ExistingReviewError);
    });

    test("addReview should handle database errors on insert", async () => {
        mockDBGetProductExists();
        mockDBGetReviewDoesNotExist();


    jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error")); 
            return db;
        });

        await expect(reviewDAO.addReview("modelX", "userY", 5, "Great product", "2023-01-01")).rejects.toThrow("Database error");
    });

    test("addReview should handle database errors on product existence check", async () => {
        
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error"), null); 
            return db;
        });

        
        await expect(reviewDAO.addReview("modelX", "userY", 5, "Great product", "2023-01-01"))
            .rejects.toThrow("Database error");

        
        jest.restoreAllMocks();
    });
    
    test("addReview should handle database errors on review existence check", async () => {
        
        jest.spyOn(db, "get")
            .mockImplementationOnce((sql, params, callback) => {
                callback(null, { count: 1 }); 
                return db;
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(new Error("Database error"), null); 
                return db;
            });

        
        await expect(reviewDAO.addReview("modelX", "userY", 5, "Great product", "2023-01-01"))
            .rejects.toThrow("Database error");

        
        jest.restoreAllMocks();
    });
    
    test("getProductReviews should retrieve reviews for a product", async () => {
        // Mock the db.get method to simulate checking if the product exists
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            // Simulate that the product exists by calling the callback with a count of 1
            callback(null, { count: 1 });
            return db;
        });
    
        // Mock the db.all method to simulate fetching reviews for the product
        const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, [
                { model: "modelX", username: "userY", score: 5, date: "2023-01-01", comment: "Great Product" }
            ]);
            return db
        });
    
        const reviews = await reviewDAO.getProductReviews("modelX");
        expect(reviews).toEqual([new ProductReview("modelX", "userY", 5, "2023-01-01", "Great Product")]);
    
        // Restore the mocks after the test
        mockDBGet.mockRestore();
        mockDBAll.mockRestore();
    });

    test("getProductReviews should handle database errors", async () => {
        // Mock db.get to simulate checking product existence
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            // Simulate product exists with a count of 1
            callback(null, { count: 1 });
            return db
        });
    
        // Mock db.all to simulate a database error when fetching reviews
        const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error"), null);  // Simulate an error
            return db
        });

    
        // Expect the DAO method to throw an error due to the db.all failure
        await expect(reviewDAO.getProductReviews("modelX")).rejects.toThrow("Database error");
    
        // Restore the mocks after the test
        jest.restoreAllMocks();
    });

    test("should throw ProductNotFoundError if product does not exist", async () => {
        // Mock db.get to simulate that the product does not exist
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 0 });
            return db;
        });

        await expect(reviewDAO.getProductReviews("nonexistent"))
            .rejects
            .toThrow(ProductNotFoundError);
    });

    test("deleteReview should successfully delete a review", async () => {
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 1 }); 
            return db; 
        });

        const mockDBRun = mockDBRunSuccess();


await expect(reviewDAO.deleteReview("modelX", "userY")).resolves.toBeUndefined();

        mockDBRun.mockRestore();
    });
    test("deleteReview should throw NoReviewProductError if review does not exist", async () => {
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {   
            callback(null, { count: 1 });
            return db;
        });
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            
            callback(null, { count: 0 });
            return db;
        });
        await expect(reviewDAO.deleteReview("modelX", "userY")).rejects.toThrow(NoReviewProductError);
        jest.restoreAllMocks();
    });

    test("deleteReview should handle database errors on review existence check", async () => {
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error"), null); 
            return db;
        });

        await expect(reviewDAO.deleteReview("modelX", "userY")).rejects.toThrow("Database error");

        jest.restoreAllMocks(); 
    });

    test("deleteReview should handle database errors during deletion", async () => {
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 1 }); 
            return db;
        });
        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error"), null); 
            return db;
        });
        await expect(reviewDAO.deleteReview("modelX", "userY")).rejects.toThrow("Database error")
        jest.restoreAllMocks(); 
    });

    test("deleteReview should throw ProductNotFoundError if product does not exist", async () => {
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { count: 0 });
            return db;
        });
        await expect(reviewDAO.deleteReview("modelX", "userY")).rejects.toThrow(ProductNotFoundError)
        jest.restoreAllMocks();
    });

    test("deleteReview should throw NoReviewProductError if review does not exist", async () => {
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { count: 1 });
            return db;
        });
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { count: 0 });
            return db;
        });
        await expect(reviewDAO.deleteReview("modelX", "userY")).rejects.toThrow(NoReviewProductError);
        jest.restoreAllMocks();
    });

    test("deleteReview should handle error during product existence check", async () => {
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("Database error"), null);
            return db;
        })
        await expect(reviewDAO.deleteReview("modelX", "userY")).rejects.toThrow("Error checking product existence: Database error");
        jest.restoreAllMocks();
    });

    test("deleteReview should handle error during review existence check", async () => {
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { count: 1 });
            return db;
        });
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("Database error"), null);
            return db;
        });
        await expect(reviewDAO.deleteReview("modelX", "userY")).rejects.toThrow("Database error");
        jest.restoreAllMocks();
    });

    test("deleteReview should handle error during delete operation", async () => {
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { count: 1 });
            return db;
        });
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { count: 1 });
            return db;
        });
        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error"));
            return db;
        });
        await expect(reviewDAO.deleteReview("modelX", "userY")).rejects.toThrow("Database error");
        jest.restoreAllMocks();
    });

    test("deleteReviewsOfProduct should delete all reviews for a product", async () => {
        const sql = "DELETE FROM reviews WHERE model = ?";
        const params = ["modelX"];
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null); 
            return db;
        });

        await expect(reviewDAO.deleteReviewsOfProduct("modelX")).resolves.toBeUndefined();
        expect(mockDBRun).toHaveBeenCalledWith(sql, params, expect.any(Function));

        mockDBRun.mockRestore();
    });
    test("deleteReviewsOfProduct should throw error if there is a database error during product existence check", async () => {
        jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
            callback(new Error("Database error"), null);
            return db; 
        });

        await expect(reviewDAO.deleteReviewsOfProduct("modelX")).rejects.toThrow("Database error");

        jest.restoreAllMocks();
    });

    test("deleteReviewsOfProduct should throw error if there is a database error during review deletion", async () => {
        
        jest.spyOn(db, 'get').mockImplementationOnce((sql, params, callback) => {
            callback(null, { count: 1 });
            return db; 
        });
        
        jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
            callback(new Error("Database error"), null);
            return db;
        });

        await expect(reviewDAO.deleteReviewsOfProduct("modelX")).rejects.toThrow("Database error");

        jest.restoreAllMocks();
    });

    test("deleteReviewsOfProduct should handle database errors during deletion", async () => {
        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error"), null); 
            return db;
        });

        await expect(reviewDAO.deleteReviewsOfProduct("modelX")).rejects.toThrow("Database error");

        jest.restoreAllMocks(); 
    });

    test("deleteReviewsOfProduct should throw ProductNotFoundError if product does not exist", async () => {
        
        jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
            callback(null, { count: 0 }); 
            return db; 
        });

        
        await expect(reviewDAO.deleteReviewsOfProduct("nonexistent_model")).rejects.toThrow(ProductNotFoundError);

        jest.restoreAllMocks();
    });

    test("deleteAllReviews should delete all reviews", async () => {
        
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(null); 
            return db; 
        });

        
        await expect(reviewDAO.deleteAllReviews()).resolves.toBeUndefined();

        
        mockDBRun.mockRestore();

        
        jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(new Error("Database error")); 
            return db; 
        });

        
        await expect(reviewDAO.deleteAllReviews()).rejects.toThrow("Database error");

        
        jest.restoreAllMocks();
    }, 10000); 
    test("deleteAllReviews should handle partial deletion errors", async () => {
        
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(new Error("Partial Database error")); 
            return db;
        });

        
        await expect(reviewDAO.deleteAllReviews()).rejects.toThrow("Partial Database error");

        
        mockDBRun.mockRestore();
        jest.restoreAllMocks();
    });

    test("deleteAllReviews should resolve when there are no reviews to delete", async () => {
        
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(null); 
            return db;
        });

        
        await expect(reviewDAO.deleteAllReviews()).resolves.toBeUndefined();

        
        mockDBRun.mockRestore();
    });
});