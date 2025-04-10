import express, { Router } from "express"
import Authenticator from "./auth"
import { body, param } from "express-validator"
import { User } from "../components/user"
import ErrorHandler from "../helper"
import UserController from "../controllers/userController"
import { UnauthorizedUserError } from "../errors/userError"
import { UserNotFoundError } from "../errors/userError"

/**
 * Represents a class that defines the routes for handling users.
 */
class UserRoutes {
    private router: Router
    private authService: Authenticator
    private errorHandler: ErrorHandler
    private controller: UserController

    /**
     * Constructs a new instance of the UserRoutes class.
     * @param authenticator The authenticator object used for authentication.
     */
    constructor(authenticator: Authenticator) {
        this.authService = authenticator
        this.router = express.Router()
        this.errorHandler = new ErrorHandler()
        this.controller = new UserController()
        this.initRoutes()
    }

    /**
     * Get the router instance.
     * @returns The router instance.
     */
    getRouter(): Router {
        return this.router
    }

    /**
     * Initializes the routes for the user router.
     * 
     * @remarks
     * This method sets up the HTTP routes for creating, retrieving, updating, and deleting user data.
     * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
     */
    initRoutes() {

        /**
         * Route for creating a user.
         * It does not require authentication.
         * It requires the following body parameters:
         * - username: string. It cannot be empty and it must be unique (an existing username cannot be used to create a new user)
         * - name: string. It cannot be empty.
         * - surname: string. It cannot be empty.
         * - password: string. It cannot be empty.
         * - role: string (one of "Manager", "Customer", "Admin")
         * It returns a 200 status code.
         */
        this.router.post(
            "/",
            // Parameters validation
            body("username").isString().isLength({ min: 1 }), //the request body must contain an attribute named "username", the attribute must be a non-empty string,
            body("surname").isString().isLength({ min: 1 }), //the request body must contain an attribute named "surname", the attribute must be a non-empty string
            body("name").isString().isLength({ min: 1 }), //the request body must contain an attribute named "name", the attribute must be a non-empty string
            body("password").isString().isLength({ min: 1 }), //the request body must contain an attribute named "password", the attribute must be a non-empty string
            body("role").isString().isIn(["Manager", "Customer", "Admin"]), //the request body must contain an attribute named "role", the attribute must be a string and its value must be one of the two allowed options
            this.errorHandler.validateRequest, //middleware defined in `helper.ts`, checks the result of all the evaluations performed above and returns a 422 error if at least one fails or continues if there are no issues

            (req: any, res: any, next: any) => this.controller.createUser(req.body.username, req.body.name, req.body.surname, req.body.password, req.body.role)
                .then(() => res.status(200).end())
                .catch((err) => {
                    next(err)
                })
        )

        /**
         * Route for retrieving all users.
         * It requires the user to be logged in and to be an admin.
         * It returns an array of users.
         */
        this.router.get(
            "/",
            this.authService.isLoggedIn,
            this.authService.isAdmin,
            (req: any, res: any, next: any) => this.controller.getUsers().then((users: User[]) => res.status(200).json(users))
                .catch((err) => next(err))
        )

        /**
         * Route for retrieving all users of a specific role.
         * It requires the user to be logged in and to be an admin.
         * It expects the role of the users in the request parameters: the role must be one of ("Manager", "Customer", "Admin").
         * It returns an array of users.
         */
        this.router.get(
            "/roles/:role",
            this.authService.isLoggedIn,
            this.authService.isAdmin,
            (req: any, res: any, next: any) => {
                if (["Manager", "Customer", "Admin"].includes(req.params.role)) {
                    this.controller.getUsersByRole(req.params.role)
                        .then((users: User[]) => res.status(200).json(users))
                        .catch((err) => next(err))
                }
                else {
                    res.status(422).json('Role not found').end()
                }

            }
        )

        /**
         * Route for retrieving a user by its username.
         * It requires the user to be authenticated: users with an Admin role can retrieve data of any user, users with a different role can only retrieve their own data.
         * It expects the username of the user in the request parameters: the username must represent an existing user.
         * It returns the user.
         */
        this.router.get(
            "/:username",
            this.authService.isLoggedIn,
            (req: any, res: any, next: any) => {
                if ((req.user.username == req.params.username) || (req.user.role == 'Admin')) {
                    this.controller.getUserByUsername(req.user, req.params.username)
                        .then((user: User) => res.status(200).json(user))
                        .catch((err) => next(err))
                }
                else {
                    res.status(401).end()
                }
            }
        )

        /**
         * Route for deleting a user.
         * It requires the user to be authenticated: users with an Admin role can delete the data of any user (except other Admins), users with a different role can only delete their own data.
         * It expects the username of the user in the request parameters: the username must represent an existing user.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/:username",
            this.authService.isLoggedIn,
            (req: any, res: any, next: any) => {
                if (((req.user.role === 'Admin') || (req.user.username === req.params.username))) {
                    this.controller.deleteUser(req.user, req.params.username)
                        .then(() => res.status(200).end())
                        .catch((err: any) => {
                            if (err instanceof UnauthorizedUserError)
                                res.status(401).end()
                            if (err instanceof UserNotFoundError)
                                res.status(404).end()
                        })
                }
                else {
                    res.status(401).end()
                }
            }
        )


        /**
         * Route for deleting all users.
         * It requires the user to be logged in and to be an admin.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/",
            this.authService.isLoggedIn,
            this.authService.isAdmin,
            (req: any, res: any, next: any) => this.controller.deleteAll()
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )

        /**
         * Route for updating the information of a user.
         * It requires the user to be authenticated.
         * It expects the username of the user to edit in the request parameters: if the user is not an Admin, the username must match the username of the logged in user. Admin users can edit other non-Admin users.
         * It requires the following body parameters:
         * - name: string. It cannot be empty.
         * - surname: string. It cannot be empty.
         * - address: string. It cannot be empty.
         * - birthdate: date. It cannot be empty, it must be a valid date in format YYYY-MM-DD, and it cannot be after the current date
         * It returns the updated user.
         */
        this.router.patch(
            "/:username",
            this.authService.isLoggedIn,
            body("surname").isString().isLength({ min: 1 }), //the request body must contain an attribute named "surname", the attribute must be a non-empty string
            body("name").isString().isLength({ min: 1 }), //the request body must contain an attribute named "name", the attribute must be a non-empty string
            body("address").isString().isLength({ min: 1 }), //the request body must contain an attribute named "address", the attribute must be a non-empty string
            body("birthdate").isDate({ format: 'YYYY-MM-DD' }), //the request body must contain an attribute named "birthdate", the attribute must be a date format
            this.errorHandler.validateRequest, //middleware defined in `helper.ts`, checks the result of all the evaluations performed above and returns a 422 error if at least one fails or continues if there are no issues
            async (req: any, res: any, next: any) => {
                try {
                    if (!((req.user.username == req.params.username) || (req.user.role === 'Admin')))   // Only if the user is not and admin and the user.username and requested.username differs, throw error.
                    {
                        res.status(401).end()
                    }
                    else {
                        // Birthdate is not in the past
                        const birthdate = new Date(req.body.birthdate);
                        if (birthdate.getTime() > Date.now()) {
                            res.status(400).end()
                        }
                        else {
                            // Check if the user exists before updating
                            const userToUpdate = await this.controller.getUserByUsername(req.user, req.params.username);

                            // Only update if user exists and authorized
                            if (userToUpdate) {
                                this.controller.updateUserInfo(req.user, req.body.name, req.body.surname, req.body.address, req.body.birthdate, req.params.username)
                                    .then((user: User) => {
                                        res.status(200).json(user)
                                    })
                                    .catch((err: any) => next(err))
                            } else {
                                res.status(404).end(); // User not found
                            }
                        }

                    }
                } catch (err) {
                    next(err); // Handle other errors
                }
            }
        )
    }
}

/**
 * Represents a class that defines the authentication routes for the application.
 */
class AuthRoutes {
    private router: Router
    private errorHandler: ErrorHandler
    private authService: Authenticator

    /**
     * Constructs a new instance of the UserRoutes class.
     * @param authenticator - The authenticator object used for authentication.
     */
    constructor(authenticator: Authenticator) {
        this.authService = authenticator
        this.errorHandler = new ErrorHandler()
        this.router = express.Router();
        this.initRoutes();
    }

    getRouter(): Router {
        return this.router
    }

    /**
     * Initializes the authentication routes.
     * 
     * @remarks
     * This method sets up the HTTP routes for login, logout, and retrieval of the logged in user.
     * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
     */
    initRoutes() {

        /**
         * Route for logging in a user.
         * It does not require authentication.
         * It expects the following parameters:
         * - username: string. It cannot be empty.
         * - password: string. It cannot be empty.
         * It returns an error if the username represents a non-existing user or if the password is incorrect.
         * It returns the logged in user.
         */
        this.router.post(
            "/",
            body("username").isString().isLength({ min: 1 }), //the request body must contain an attribute named "username", the attribute must be a non-empty string
            body("password").isString().isLength({ min: 1 }), //the request body must contain an attribute named "password", the attribute must be a non-empty string
            this.errorHandler.validateRequest,
            (req, res, next) => this.authService.login(req, res, next)
                .then((user: User) => res.status(200).json(user))
                .catch((err: any) => { res.status(401).json(err) })
        )

        /**
         * Route for logging out the currently logged in user.
         * It expects the user to be logged in.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/current",
            this.authService.isLoggedIn,
            (req, res, next) => this.authService.logout(req, res, next)
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )

        /**
         * Route for retrieving the currently logged in user.
         * It expects the user to be logged in.
         * It returns the logged in user.
         */
        this.router.get(
            "/current",
            this.authService.isLoggedIn,
            (req: any, res: any) => res.status(200).json(req.user)
        )
    }
}

export { UserRoutes, AuthRoutes }