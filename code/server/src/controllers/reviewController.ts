import { ProductReview } from "../components/review";
import { User } from "../components/user";
import ReviewDAO from "../dao/reviewDAO";
import { ExistingReviewError, NoReviewProductError } from '../errors/reviewError';
import { ProductNotFoundError } from "../errors/productError";


class ReviewController {
    private dao: ReviewDAO

    constructor() {
        this.dao = new ReviewDAO();
    }

    async addReview(model: string, user: User, score: number, comment: string): Promise<void> {
        if (score < 1 || score > 5) {
            throw new Error("Invalid rating");
        }
        try {
            const date = new Date().toLocaleDateString('en-CA'); 
            await this.dao.addReview(model, user.username, score, comment, date);
        } catch (error) {
            if (error instanceof ExistingReviewError) {
               
                throw error;
            } else if (error instanceof ProductNotFoundError) {
               
                throw error; 
            } else {
               
               throw new Error("internal server error"); 
            }
        }
    }

    async getProductReviews(model: string): Promise<ProductReview[]> {
        try {
            return await this.dao.getProductReviews(model);
        } catch (error) {
            
               
            throw error;
               
            }
        
    }

    async deleteReview(model: string, user: User): Promise<void> {
        try {
            await this.dao.deleteReview(model, user.username);
        } catch (error) {
            if (error instanceof NoReviewProductError) {
                
                throw error;
            } else if (error instanceof ProductNotFoundError) {
                
                throw error;}
            else { 
                throw new Error("internal server error");

        
                
            }
        }
    }

    async deleteReviewsOfProduct(model: string): Promise<void> {
        try {
            await this.dao.deleteReviewsOfProduct(model);
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
               
                throw error;
            } else {
                    
                    throw new Error("internal server error");
            }
        }
    }
    async deleteAllReviews(): Promise<void> {
        try {
            await this.dao.deleteAllReviews();
        } catch (error) {
            throw error;
        }
    }
}

export default ReviewController;
