import express, { Router } from "express"
import ErrorHandler from "../helper"
import { body, param } from "express-validator"
import ReviewController from "../controllers/reviewController"
import Authenticator from "./auth"
import { ProductReview } from "../components/review"

class ReviewRoutes {
    private controller: ReviewController
    private router: Router
    private errorHandler: ErrorHandler
    private authenticator: Authenticator

    constructor(authenticator: Authenticator) {
        this.authenticator = authenticator
        this.controller = new ReviewController()
        this.router = express.Router()
        this.errorHandler = new ErrorHandler()
        this.initRoutes()
    }

    getRouter(): Router {
        return this.router
    }

    initRoutes() {

        
        this.router.post(
            "/:model",
            this.authenticator.isLoggedIn,
            this.authenticator.isCustomer,
            [
                param('model').isString().isLength({ min: 1 }),
                body('score').isInt({ min: 1, max: 5 }),
                body('comment').isString().isLength({ min: 1 }),
            ],
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => this.controller.addReview(req.params.model, req.user, req.body.score, req.body.comment)
                .then(() => res.status(200).send())
                .catch((err: Error) => {
                    next(err)
                })
        )

        
        this.router.get(
            "/:model",
            this.authenticator.isLoggedIn,
            [
                param('model').isString().isLength({ min: 1 })
            ],
            (req: any, res: any, next: any) => this.controller.getProductReviews(req.params.model)
                .then((reviews: ProductReview[]) => res.status(200).json(reviews))
                .catch((err: Error) => next(err))
        )

        
        this.router.delete(
            "/:model",
            this.authenticator.isLoggedIn,
            this.authenticator.isCustomer,
            [
                param('model').isString().isLength({ min: 1 })
            ],
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => this.controller.deleteReview(req.params.model, req.user)
                .then(() => res.status(200).send())
                .catch((err: Error) => {
                    next(err);
                })
        )

        
        this.router.delete(
            "/:model/all",
            this.authenticator.isLoggedIn,
            this.authenticator.isAdminOrManager,
            [
                param('model').isString().isLength({ min: 1 })
            ],
            this.errorHandler.validateRequest,
            (req: any, res: any, next: any) => this.controller.deleteReviewsOfProduct(req.params.model)
                .then(() => res.status(200).send())
                .catch((err: Error) => next(err))
        )

        
        this.router.delete(
            "/",
            this.authenticator.isLoggedIn,
            this.authenticator.isAdminOrManager,
            (req: any, res: any, next: any) => this.controller.deleteAllReviews()
                .then(() => res.status(200).send())
                .catch((err: Error) => next(err))
        )
    }
}

export default ReviewRoutes;