import { test, expect, jest,describe,beforeAll,beforeEach } from "@jest/globals";
import ReviewController from "../../src/controllers/reviewController";
import ReviewDAO from "../../src/dao/reviewDAO";
import { Role, User } from "../../src/components/user";
import { ProductReview } from '../../src/components/review';
import { ExistingReviewError, NoReviewProductError } from '../../src/errors/reviewError';
import { ProductNotFoundError } from "../../src/errors/productError";

jest.mock("../../src/dao/reviewDAO");

describe("ReviewController", () => {
    let reviewController: ReviewController;
    let mockUser: User;

    beforeEach(() => {
        reviewController = new ReviewController();
        mockUser = new User("test_user", "Test", "Test", Role.CUSTOMER, "test_address", "2001-12-14");
        jest.clearAllMocks();
    });

    test("addReview - success", async () => {
        jest.spyOn(ReviewDAO.prototype, 'addReview').mockResolvedValue(undefined);
        await reviewController.addReview('model1', mockUser, 5, 'Great product');
        expect(ReviewDAO.prototype.addReview).toHaveBeenCalledWith('model1', mockUser.username, 5, 'Great product', expect.any(String));
    });

    test('addReview should handle NoExistingReviewError', async () => {
        
        jest.spyOn(ReviewDAO.prototype, 'addReview').mockRejectedValue(new ExistingReviewError());

    
        await expect(reviewController.addReview("model1", mockUser, 5, "Excellent product"))
            .rejects
            .toThrow(ExistingReviewError);
        });
    test("addReview - failure with invalid rating", async () => {
        await expect(reviewController.addReview('model1', mockUser, 6, 'Too good')).rejects.toThrow("Invalid rating");
    });

    test("addReview - boundary ratings", async () => {
        jest.spyOn(ReviewDAO.prototype, 'addReview').mockResolvedValue(undefined);
        await reviewController.addReview('model1', mockUser, 1, 'Minimum rating');
        expect(ReviewDAO.prototype.addReview).toHaveBeenCalledWith('model1', mockUser.username, 1, 'Minimum rating', expect.any(String));

        await reviewController.addReview('model1', mockUser, 5, 'Maximum rating');
        expect(ReviewDAO.prototype.addReview).toHaveBeenCalledWith('model1', mockUser.username, 5, 'Maximum rating', expect.any(String));
    });

    test('addReview should handle ProductNotFoundError', async () => {
        jest.spyOn(ReviewDAO.prototype, 'addReview').mockRejectedValue(new ProductNotFoundError());
    
        await expect(reviewController.addReview("model1", mockUser, 5, "Excellent product"))
            .rejects
            .toThrow(ProductNotFoundError);
    });
    

    test("addReview should throw 'internal server error' for generic errors", async () => {

        const error = new Error("Database failure");
        jest.spyOn(ReviewDAO.prototype, 'addReview').mockRejectedValue(error);

        await expect(reviewController.addReview('model1', mockUser, 3, 'Good product'))
            .rejects
            .toThrow("internal server error");
        expect(ReviewDAO.prototype.addReview).toHaveBeenCalledWith('model1', mockUser.username, 3, 'Good product', expect.any(String));
        jest.restoreAllMocks();
    });
    

    test("getProductReviews - retrieves data", async () => {
        const mockReviews = [
            new ProductReview('model1', 'testUser', 5, '2023-01-01', 'Nice')
        ];
        jest.spyOn(ReviewDAO.prototype, 'getProductReviews').mockResolvedValue(mockReviews);
        const reviews = await reviewController.getProductReviews('model1');
        expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledWith('model1');
        expect(reviews).toEqual(mockReviews);
    });

    test("getProductReviews - no reviews found throws NoReviewProductError", async () => {
        jest.spyOn(ReviewDAO.prototype, 'getProductReviews').mockRejectedValue(new NoReviewProductError());
        await expect(reviewController.getProductReviews('model1'))
            .rejects
            .toThrow(NoReviewProductError);
        expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledWith('model1');
    });

    test("getProductReviews - multiple reviews", async () => {
        const mockReviews = [
            new ProductReview('model1', 'testUser1', 5, '2023-01-01', 'Nice'),
            new ProductReview('model1', 'testUser2', 4, '2023-01-02', 'Good')
        ];
        jest.spyOn(ReviewDAO.prototype, 'getProductReviews').mockResolvedValue(mockReviews);
        const reviews = await reviewController.getProductReviews('model1');
        expect(reviews).toHaveLength(2);
        expect(reviews).toEqual(mockReviews);
    });

   

    test("deleteReview - success", async () => {
        jest.spyOn(ReviewDAO.prototype, 'deleteReview').mockResolvedValue(undefined);
        await reviewController.deleteReview('model1', mockUser);
        expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledWith('model1', mockUser.username);
    });

    test("deleteReview - throws NoReviewProductError", async () => {
        jest.spyOn(ReviewDAO.prototype, 'deleteReview').mockRejectedValue(new NoReviewProductError());

        await expect(reviewController.deleteReview('model1', mockUser))
            .rejects
            .toThrow(NoReviewProductError);

        expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledWith('model1', mockUser.username);
        
    });

    test("deleteReview - throws ProductNotFoundError", async () => {
        jest.spyOn(ReviewDAO.prototype, 'deleteReview').mockRejectedValue(new ProductNotFoundError());

        await expect(reviewController.deleteReview('model1', mockUser))
            .rejects
            .toThrow(ProductNotFoundError);

        expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledWith('model1', mockUser.username);
    
    });

    test("deleteReview - throws generic error as internal server error", async () => {
        jest.spyOn(ReviewDAO.prototype, 'deleteReview').mockRejectedValue(new Error("Failed to delete review"));

        await expect(reviewController.deleteReview('model1', mockUser))
            .rejects
            .toThrow("internal server error");

        expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledWith('model1', mockUser.username);
    });

    test("deleteReviewsOfProduct - success", async () => {
        jest.spyOn(ReviewDAO.prototype, 'deleteReviewsOfProduct').mockResolvedValue(undefined);
        await reviewController.deleteReviewsOfProduct('model1');
        expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith('model1');
    });
    test("deleteReviewsOfProduct - no reviews to delete", async () => {
        jest.spyOn(ReviewDAO.prototype, 'deleteReviewsOfProduct').mockResolvedValue(undefined);
        const result = await reviewController.deleteReviewsOfProduct('model1');
        expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith('model1');
        expect(result).toBeUndefined();
    });

    test("deleteReviewsOfProduct - product not found error", async () => {
        const productNotFoundError = new ProductNotFoundError();
        jest.spyOn(ReviewDAO.prototype, 'deleteReviewsOfProduct').mockRejectedValue(productNotFoundError);
        await expect(reviewController.deleteReviewsOfProduct('nonexistent_model')).rejects.toThrow(productNotFoundError);
    });

    test("deleteReviewsOfProduct should throw 'internal server error' for generic errors", async () => {
        const error = new Error("Unexpected failure");
        jest.spyOn(ReviewDAO.prototype, 'deleteReviewsOfProduct').mockRejectedValue(error);
        await expect(reviewController.deleteReviewsOfProduct('model1'))
            .rejects
            .toThrow("internal server error");
        expect(ReviewDAO.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith('model1');
    });
    

    test("deleteAllReviews - success", async () => {
        jest.spyOn(ReviewDAO.prototype, 'deleteAllReviews').mockResolvedValue(undefined);
        await reviewController.deleteAllReviews();
        expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalled();
    });

    test("deleteAllReviews - throws error on failure", async () => {
        const error = new Error("Database error");
        jest.spyOn(ReviewDAO.prototype, 'deleteAllReviews').mockRejectedValue(error);
        
        await expect(reviewController.deleteAllReviews())
            .rejects
            .toThrow(error);

        expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalled();
    });


});
