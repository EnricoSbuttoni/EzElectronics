import { describe, test, expect, beforeAll, afterEach, afterAll, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import { cleanup } from "../../src/db/cleanup";

import UserController from "../../src/controllers/userController"
import Authenticator from "../../src/routers/auth"
import { Role, User } from "../../src/components/user";


const baseURL = "/ezelectronics"
jest.mock("../../src/routers/auth");



//Example of a unit test for the POST ezelectronics/users route
//The test checks if the route returns a 200 success code
//The test also expects the createUser method of the controller to be called once with the correct parameters




describe("Creating a user", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("It should return a 200 code when a user is created", async () => {
        const testUser = { //Define a test user object sent to the route
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        }
        // jest.spyOn(Authenticator.prototype, "login").mockResolvedValueOnce(true)
        jest.spyOn(UserController.prototype, "createUser").mockResolvedValue(true) //Mock the createUser method of the controller
        const response = await request(app).post(`${baseURL}/users`).send(testUser) //Send a POST request to the route
        expect(response.status).toBe(200) //Check if the response status is 200
        expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1) //Check if the createUser method has been called once
        //Check if the createUser method has been called with the correct parameters
        expect(UserController.prototype.createUser).toHaveBeenCalledWith(testUser.username,
            testUser.name,
            testUser.surname,
            testUser.password,
            testUser.role)
    }, 30000);

    test("It should return a 422 code if the body is not well-formatted", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        }

        jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(true);

        const response = await request(app).post(`${baseURL}/users/`).send({});
        expect(response.status).toBe(422);
        expect(UserController.prototype.createUser).toHaveBeenCalledTimes(0);
    }, 30000);


    afterAll(() => {
        jest.clearAllMocks();
    });
});






describe("Get all users", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("It should return a 200 code", async () => {
        const usersArray: User[] = [
            new User("username_1", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14"),
            new User("username_2", "user", "surname", Role.CUSTOMER, "Via Rossi 16", "1983-06-14")
        ]
        const testAdmin = new User("username_admin", "user", "surname", Role.ADMIN, "Via Rossi 16", "1983-06-14");
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testAdmin;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(UserController.prototype, "getUsers").mockResolvedValue(usersArray) //Mock the createUser method of the controller
        const response = await request(app).get(`${baseURL}/users`)
        expect(response.status).toBe(200) //Check if the response status is 200
        expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1) //Check if the getUserByUsername method has been called once
    }, 30000);

    test("It should return a 401 code if the user is not logged in", async () => {

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 })
        });

        jest.spyOn(UserController.prototype, "getUsers");
        const response = await request(app).get(`${baseURL}/users/`);
        expect(response.status).toBe(401);
        expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(0);
    }, 30000);

    test("It should return a 401 code if the user is not an admin", async () => {

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 })
        });


        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not an admin", status: 401 })
        });

        jest.spyOn(UserController.prototype, "getUsers");
        const response = await request(app).get(`${baseURL}/users`);
        expect(response.status).toBe(401);
        expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(0);
    }, 30000);



    afterAll(() => {
        jest.clearAllMocks();
    });
});



describe("Get users by role", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("It should return a 200 code", async () => {
        const request_role = Role.MANAGER
        const usersArray: User[] = [
            new User("username_1", "user", "surname", Role.MANAGER, "Via Verdi 8", "2001-12-14"),
            new User("username_2", "user", "surname", Role.MANAGER, "Via Rossi 16", "1983-06-14")
        ]
        const testAdmin = new User("username_admin", "user", "surname", Role.ADMIN, "Via Rossi 16", "1983-06-14");
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testAdmin;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(UserController.prototype, "getUsersByRole").mockResolvedValue(usersArray) //Mock the createUser method of the controller
        const response = await request(app).get(`${baseURL}/users/roles/${request_role}`)
        expect(response.status).toBe(200) //Check if the response status is 200
        expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(1) //Check if the getUserByUsername method has been called once
    }, 30000);

    test("It should return a 422 code if the role does not exist", async () => {
        const request_role = 'randomValue'
        const testAdmin = new User("username_admin", "user", "surname", Role.ADMIN, "Via Rossi 16", "1983-06-14");
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testAdmin;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(UserController.prototype, "getUsersByRole");
        const response = await request(app).get(`${baseURL}/users/roles/${request_role}`);
        expect(response.status).toBe(422);
        expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(0);
    }, 30000);

    test("It should return a 401 code if the user is not an admin", async () => {
        const request_role = 'randomValue'
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not an admin", status: 401 });
        });

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return next();
        });

        jest.spyOn(UserController.prototype, "getUsersByRole");
        const response = await request(app).get(`${baseURL}/users/roles/${request_role}`);

        expect(response.status).toBe(401);
        expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(0);
    }, 30000);

    test("It should return a 401 code if the user is not logged in", async () => {
        const request_role = 'randomValue'

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 })
        });

        jest.spyOn(UserController.prototype, "getUsersByRole");
        const response = await request(app).get(`${baseURL}/users/roles/${request_role}`);
        expect(response.status).toBe(401);
        expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(0);
    }, 30000);


    afterAll(() => {
        jest.clearAllMocks();
    });
});








describe("Get user by username", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("It should return a 200 code", async () => {
        const testUser = new User("username_1", "user", "surname", Role.MANAGER, "Via Verdi 8", "2001-12-14");
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testUser;
            return next();
        });
        jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValue(testUser) //Mock the createUser method of the controller
        const response = await request(app).get(`${baseURL}/users/${testUser.username}`)
        expect(response.status).toBe(200) //Check if the response status is 200
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1) //Check if the getUserByUsername method has been called once
    }, 30000);

    test("It should return a 401 code if the user is not logged in", async () => {
        const testUser = new User("username_1", "user", "surname", Role.MANAGER, "Via Verdi 8", "2001-12-14");
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "Unauthenticated user", status: 401 })
        });

        jest.spyOn(UserController.prototype, "getUserByUsername");
        const response = await request(app).get(`${baseURL}/users/${testUser.username}`);
        expect(response.status).toBe(401);
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(0);
    }, 30000);

    test("It should return a 401 code if a non-admin user is trying to get another user", async () => {
        const testUser = new User("username_1", "user", "surname", Role.MANAGER, "Via Verdi 8", "2001-12-14");
        const anotherUser = new User("username_2", "user", "surname", Role.CUSTOMER, "Via Blu 5", "1992-9-1");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testUser
            return next();
        });
        jest.spyOn(UserController.prototype, "getUserByUsername");
        const response = await request(app).get(`${baseURL}/users/${anotherUser.username}`);

        expect(response.status).toBe(401);
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(0);
    }, 30000);

    test("It should return a 200 code if an admin user is trying to get another user", async () => {
        const testUser = new User("username_1", "user", "surname", Role.ADMIN, "Via Verdi 8", "2001-12-14");
        const anotherUser = new User("username_2", "user", "surname", Role.CUSTOMER, "Via Blu 5", "1992-9-1");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testUser
            return next();
        });
        jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValue(anotherUser) //Mock the createUser method of the controller
        const response = await request(app).get(`${baseURL}/users/${anotherUser.username}`);

        expect(response.status).toBe(200);
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
    }, 30000);

    afterAll(() => {
        jest.clearAllMocks();
    });
});


describe("Delete a user", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("It should return a 200 code when the user is eliminated", async () => {

        const testCustomer = new User("user", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });
        // jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementationOnce((req, res, next) => {
        //     return next();
        // });
        jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValueOnce(true);

        const response = await request(app).delete(`${baseURL}/users/${testCustomer.username}`);

        expect(response.status).toBe(200);
        expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(1);
    }, 30000);


    test("It should return a 200 code when the user is eliminated by an admin", async () => {

        const testCustomer = new User("username_customer", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");
        const testAdmin = new User("username_admin", "user", "surname", Role.ADMIN, "Via Rossi 16", "1983-06-14");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testAdmin;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementationOnce((req, res, next) => {
            return next();
        });
        jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValueOnce(true);

        const response = await request(app).delete(`${baseURL}/users/${testCustomer.username}`);

        expect(response.status).toBe(200);
        expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(1);
    }, 30000);


    test("It should return a 401 code when the user is eliminated by another non-admin user", async () => {

        const testCustomer1 = new User("username_customer_1", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");
        const testCustomer2 = new User("username_customer_2", "user", "surname", Role.CUSTOMER, "Via Rossi 16", "1983-06-14");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer2;
            return next();
        });
        jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValueOnce(false);

        const response = await request(app).delete(`${baseURL}/users/${testCustomer1.username}`);

        expect(response.status).toBe(401);
        expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(0);
    }, 30000);


    afterAll(() => {
        jest.clearAllMocks();
    });
});



describe("Delete all users", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test("It should return a 200 code when all non-admin users are eliminated", async () => {

        const testAdmin = new User("username_admin", "user", "surname", Role.ADMIN, "Via Rossi 16", "1983-06-14");
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testAdmin;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementationOnce((req, res, next) => {
            return next();
        });
        jest.spyOn(UserController.prototype, "deleteAll").mockResolvedValueOnce(true);

        const response = await request(app).delete(baseURL + '/users').send();
        expect(response.status).toBe(200);
        expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(1);
    });


    test("It should return a 401 code when a non-admin user try to call it", async () => {
        const testCustomer = new User("username_customer", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementationOnce((req, res, next) => {
            return res.status(401).json({ error: "User is not an admin", status: 401 });
        });
        jest.spyOn(UserController.prototype, "deleteAll").mockResolvedValueOnce(true);

        const response = await request(app).delete(baseURL + '/users').send();
        expect(response.status).toBe(401);
        expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(0);
    });

    afterAll(() => {
        jest.clearAllMocks();
    });
});




describe("Update user info", () => {
    // Missing test for check body
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    test("It should return a 200 code when an admin updates an other user successfully", async () => {
        const testAdmin = new User("username_admin", "user", "surname", Role.ADMIN, "Via Rossi 16", "1983-06-14");
        const testCustomer = new User("username_customer", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testAdmin;
            return next();
        });
        jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementationOnce((req, res, next) => {
            return next();
        });
        jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValueOnce(testCustomer);
        jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValueOnce(testCustomer);


        const response = await request(app).patch(`${baseURL}/users/${testCustomer.username}`).send(testCustomer);
        expect(response.status).toBe(200);
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
    });

    test("It should return a 200 code when a user try to edit itself", async () => {
        const userCustomer = new User("username_customer_1", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        // const body = {'surname': userCustomer.surname, 'name' : userCustomer.name, 'address' : testCustomer.address, 'birthdate' : testCustomer.birthdate }
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = userCustomer;
            return next();
        });
        jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValueOnce(userCustomer);
        jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValueOnce(userCustomer);
        const response = await request(app).patch(`${baseURL}/users/${userCustomer.username}`).send(userCustomer);
        expect(response.status).toBe(200);
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
    }, 30000);


    test("It should return a 401 code when a non-admin user try to edit another user", async () => {
        const testCustomer1 = new User("username_customer_1", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");
        const testCustomer2 = new User("username_customer_2", "user", "surname", Role.CUSTOMER, "Via Rossi 16", "1983-06-14");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer2;
            return next();
        });

        jest.spyOn(UserController.prototype, "updateUserInfo")
        const response = await request(app).patch(`${baseURL}/users/${testCustomer1.username}`).send(testCustomer1);
        expect(response.status).toBe(401);
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(0);

    }, 30000);



    test("It should return a 422 code when the body is not respecting the format", async () => {
        const testCustomer = new User("username_customer_1", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testCustomer;
            return next();
        });

        jest.spyOn(UserController.prototype, "updateUserInfo")
        const response = await request(app).patch(`${baseURL}/users/${testCustomer.username}`).send({});
        expect(response.status).toBe(422);
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(0);

    }, 30000);

    afterAll(() => {
        jest.clearAllMocks();
    });
});



describe("Testing AuthRoutes login", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    test("It should return a 200 code when an user is logged in with valid credentials", async () => {
        const testUser = new User("username", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(Authenticator.prototype, "login").mockImplementationOnce((req, res, next) => {
            return new Promise((resolve, reject) => {
                return resolve(testUser)
            })
        });
        const response = await request(app).post(`${baseURL}/sessions`).send({ username: testUser.username, password: "VerySecurePassword" });
        expect(Authenticator.prototype.login).toBeCalledTimes(1)
        expect(response.status).toBe(200);
    });

    test("It should return a 422 code when the body of the request is not valid", async () => {
        const testUser = new User("username", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(Authenticator.prototype, "login").mockImplementationOnce((req, res, next) => {
            return new Promise((resolve, reject) => {
                return resolve(testUser)
            })
        });
        const response = await request(app).post(`${baseURL}/sessions`).send({ username: testUser.username});
        expect(Authenticator.prototype.login).toBeCalledTimes(0)
        expect(response.status).toBe(422);
    });

    test("It should return a 401 code in case of error", async () => {
        const testUser = new User("username", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(Authenticator.prototype, "login").mockImplementationOnce((req, res, next) => {
            return new Promise((resolve, reject) => {
                return reject()
            })
        });
        const response = await request(app).post(`${baseURL}/sessions`).send({ username: testUser.username, password: "VerySecurePassword" });

        expect(Authenticator.prototype.login).toBeCalledTimes(1)
        expect(response.status).toBe(401);
    });


    afterAll(() => {
        jest.clearAllMocks();
    });
});



describe("Testing AuthRoutes logout", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    test("It should return a 200 code when an user is logged out", async () => {
        const testUser = new User("username", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testUser;
            return next();
        });

        jest.spyOn(Authenticator.prototype, "logout").mockImplementationOnce((req, res, next) => {
            return new Promise((resolve, reject) => {
                return resolve(null)
            })
        });
        const response = await request(app).delete(`${baseURL}/sessions/current`);
        expect(response.status).toBe(200);
        expect(Authenticator.prototype.logout).toBeCalledTimes(1)
    });


    afterAll(() => {
        jest.clearAllMocks();
    });
});



describe("Testing AuthRoutes get currenlty logged in user", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    test("It should return a 200 code when retriving a logged in user", async () => {
        const testUser = new User("username", "user", "surname", Role.CUSTOMER, "Via Verdi 8", "2001-12-14");

        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementationOnce((req, res, next) => {
            req.user = testUser;
            return next();
        });

        const response = await request(app).get(`${baseURL}/sessions/current`);
        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({username: testUser.username, name: testUser.name, surname: testUser.surname, role:testUser.role, address: testUser.address, birthdate: testUser.birthdate});

    });


    afterAll(() => {
        jest.clearAllMocks();
    });
});