import { describe, test, expect, beforeAll, afterEach, afterAll, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../index"
import { cleanup } from "../src/db/cleanup";
import UserController from "../src/controllers/userController"
import UserDAO from "../src/dao/userDAO";
import Authenticator from "../src/routers/auth";
import { User } from "../src/components/user";
import db from "../src/db/db"
const baseURL = "/ezelectronics"


// 1. Defines the base route path, a user object, and a string for storing the cookie
const admin = { username: "admin_test", name: "admin_test", surname: "admin_test", password: "admin_test", role: "Admin" }
const customer = { username: "customer_test", name: "customer_test", surname: "customer_test", password: "customer_test", role: "Customer" }
const manager = { username: "manager_test", name: "manager_test", surname: "manager_test", password: "manager_test", role: "Manager" }

let adminCookie: string
let customerCookie: string
let managerCookie: string

// 2. Defines a function that calls the POST route for creating a new user
const postUser = async (userInfo: any) => {
    await request(app)
        .post(`${baseURL}/users`)
        .send(userInfo)
        .expect(200)
}

// 3. Defines a function that performs login and returns the cookie
const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${baseURL}/sessions`)
            .send(userInfo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.header["set-cookie"][0])
            })
    })
}



describe("Login FR1.1", () => {
    beforeAll(async () => {
        await postUser(customer)    // Create the user before the login
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    }, 30000);


    afterEach(() => {
        cleanup()
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    test("Successfull login: It should resolve with code 200", async () => {
        jest.spyOn(Authenticator.prototype, "login")
        const response = await request(app).post(`${baseURL}/sessions`).send(customer);
        expect(response.status).toBe(200)
    })

    afterAll(() => {
        jest.clearAllMocks();
    });
});



describe("Logout FR1.2", () => {
    beforeAll(async () => {
        await postUser(customer)
        customerCookie = await login(customer)
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    }, 30000);

    afterEach(() => {
        cleanup()
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    test("It should resolve with code 200", async () => {
        jest.spyOn(Authenticator.prototype, "logout")
        const authenticator = new Authenticator(app)
        const response = await request(app).delete(baseURL + "/sessions/current").set("Cookie", customerCookie)
        expect(response.status).toBe(200) //Check if the response status is 200
    })



    afterAll(() => {
        jest.clearAllMocks();
    });
});




describe("Add a user to the DB FR1.3", () => {
    beforeAll(async () => {
        await postUser(admin)
        adminCookie = await login(admin)
        await postUser(customer)
        customerCookie = await login(customer)
        await postUser(manager)
        managerCookie = await login(manager)
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    }, 30000);


    afterEach(() => {
        cleanup()
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    test("Adding an user in the DB interacting with UserDAO", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        }
        jest.spyOn(UserDAO.prototype, "createUser")
        const userDAO = new UserDAO()
        const result = await userDAO.createUser(testUser.username,
            testUser.name,
            testUser.surname,
            testUser.password,
            testUser.role)

        expect(result).toBe(true)
        expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1)
        expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
            testUser.name,
            testUser.surname,
            testUser.password,
            testUser.role)
    })

    test("Adding an user in the DB interacting with UserDAO + userController", async () => {
        const testUser = {
            username: "username_test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        }
        jest.spyOn(UserController.prototype, "createUser")
        jest.spyOn(UserDAO.prototype, "createUser")

        const userController = new UserController()
        const result = await userController.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role)
        expect(result).toBe(true)
        expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1) //Check if the createUser method has been called once

        // Check if the createUser method has been called with the correct parameters
        expect(UserController.prototype.createUser).toHaveBeenCalledWith(testUser.username,
            testUser.name,
            testUser.surname,
            testUser.password,
            testUser.role)

        expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1)
        expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role)
    })



    test("Final: adding an user in the DB interacting with UserDAO + userController + Routes", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        }
        jest.spyOn(UserController.prototype, "createUser")
        jest.spyOn(UserDAO.prototype, "createUser")

        const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
        expect(response.status).toBe(200) //Check if the response status is 200
        expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1) //Check if the createUser method has been called once
        // Check if the createUser method has been called with the correct parameters
        expect(UserController.prototype.createUser).toHaveBeenCalledWith(testUser.username,
            testUser.name,
            testUser.surname,
            testUser.password,
            testUser.role)
        expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1)
        expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role)
    })

    test("Final: It should return a 422 error code: wrong role", async () => {
        const testUser = { //Define a test user object sent to the route
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "nonExistingRole"
        }
        jest.spyOn(UserController.prototype, "createUser") //Spy the createUser method of the controller
        const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
        expect(response.status).toBe(422) //Check if the response status is 422
        expect(UserController.prototype.createUser).toHaveBeenCalledTimes(0) //Check if the createUser method has not been called
    })

    test("Final: It should return a 422 error code: no username", async () => {
        const testUser = {
            name: "test",
            surname: "test",
            password: "test",
            role: "nonExistingRole"
        }
        jest.spyOn(UserController.prototype, "createUser") //Spy the createUser method of the controller
        const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
        expect(response.status).toBe(422)
        expect(UserController.prototype.createUser).toHaveBeenCalledTimes(0) //Check if the createUser method has not been called
    })


    test("Final: It should return a 422 error code: no name", async () => {
        const testUser = {
            username: "test",
            surname: "test",
            password: "test",
            role: "nonExistingRole"
        }
        jest.spyOn(UserController.prototype, "createUser") //Spy the createUser method of the controller
        const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
        expect(response.status).toBe(422)
        expect(UserController.prototype.createUser).toHaveBeenCalledTimes(0) //Check if the createUser method has not been called
    })


    test("Final:  should return a 422 error code: no surname", async () => {
        const testUser = {
            username: "test",
            name: "test",
            password: "test",
            role: "nonExistingRole"
        }
        jest.spyOn(UserController.prototype, "createUser") //Spy the createUser method of the controller
        const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
        expect(response.status).toBe(422)
        expect(UserController.prototype.createUser).toHaveBeenCalledTimes(0) //Check if the createUser method has not been called
    })


    test("Final: It should return a 422 error code: no password", async () => {
        const testUser = {
            username: "test",
            name: "test",
            surname: "test",
            role: "Customer"
        }
        jest.spyOn(UserController.prototype, "createUser") //Spy the createUser method of the controller
        const response = await request(app).post(baseURL + "/users").send(testUser) //Send a POST request to the route
        expect(response.status).toBe(422)
        expect(UserController.prototype.createUser).toHaveBeenCalledTimes(0) //Check if the createUser method has not been called
    })


    afterAll(() => {
        jest.clearAllMocks();
    });
});





describe("Show list of users FR2.1", () => {
    beforeAll(async () => {
        await postUser(admin)
        adminCookie = await login(admin)
        await postUser(customer)
        customerCookie = await login(customer)
        await postUser(manager)
        managerCookie = await login(manager)
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    }, 30000);


    afterEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    test("Retrieve all users saved on the DB: interacting with UserDAO", async () => {
        jest.spyOn(UserDAO.prototype, "getUsers")
        const userDAO = new UserDAO();
        const result = await userDAO.getUsers();
        expect(UserDAO.prototype.getUsers).toHaveBeenCalledTimes(1)
        result.forEach((user) => {
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('name');
            expect(user).toHaveProperty('surname');
            expect(user).toHaveProperty('address');
            expect(user).toHaveProperty('birthdate');
            expect(user).toHaveProperty('role');
        })
    })

    test("Retrieve all users saved on the DB: interacting with UserDAO + userController", async () => {
        jest.spyOn(UserController.prototype, "getUsers")
        jest.spyOn(UserDAO.prototype, "getUsers")
        const userController = new UserController()
        const result = await userController.getUsers();
        expect(UserDAO.prototype.getUsers).toHaveBeenCalledTimes(1)
        result.forEach((user) => {
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('name');
            expect(user).toHaveProperty('surname');
            expect(user).toHaveProperty('address');
            expect(user).toHaveProperty('birthdate');
            expect(user).toHaveProperty('role');

        })
    })



    test("Final: Retrieve all users saved on the DB interacting with UserDAO + userController + Routes", async () => {

        jest.spyOn(UserController.prototype, "getUsers")
        jest.spyOn(UserDAO.prototype, "getUsers")

        const response = await request(app).get(baseURL + "/users").set("Cookie", adminCookie)
        expect(response.status).toBe(200) //Check if the response status is 200
        expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1)
        response.body.forEach((user : User) => {
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('name');
            expect(user).toHaveProperty('surname');
            expect(user).toHaveProperty('address');
            expect(user).toHaveProperty('birthdate');
            expect(user).toHaveProperty('role');
        })
    })
    afterAll(() => {
        cleanup()
        jest.clearAllMocks();
    });
});



describe("Show list of users by role FR2.2", () => {
    beforeAll(async () => {
        await postUser(admin)
        adminCookie = await login(admin)
        await postUser(customer)
        customerCookie = await login(customer)
        await postUser(manager)
        managerCookie = await login(manager)
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    }, 30000);


    afterEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    test("Retrieve users by role saved on the DB: interacting with UserDAO", async () => {
        jest.spyOn(UserDAO.prototype, "getUsersByRole")
        const roleToSearch = 'Customer'
        const userDAO = new UserDAO();
        const result = await userDAO.getUsersByRole(roleToSearch);
        expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1)
        result.forEach((user) => {
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('name');
            expect(user).toHaveProperty('surname');
            expect(user).toHaveProperty('address');
            expect(user).toHaveProperty('birthdate');
            expect(user.role).toBe(roleToSearch);
        })
    })

    test("Retrieve users by role saved on the DB: interacting with UserDAO + userController", async () => {
        const roleToSearch = 'Customer'
        jest.spyOn(UserController.prototype, "getUsersByRole")
        jest.spyOn(UserDAO.prototype, "getUsersByRole")
        const userController = new UserController()
        const result = await userController.getUsersByRole(roleToSearch);
        expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1)
        result.forEach((user) => {
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('name');
            expect(user).toHaveProperty('surname');
            expect(user).toHaveProperty('address');
            expect(user).toHaveProperty('birthdate');
            expect(user.role).toBe(roleToSearch);
        })
    })

    test("Final: Retrieve users by role saved on the DB interacting with UserDAO + userController + Routes", async () => {
        const roleToSearch = 'Customer'
        jest.spyOn(UserController.prototype, "getUsersByRole")
        const response = await request(app).get(`${baseURL}/users/roles/${roleToSearch}`).set("Cookie", adminCookie)
        expect(response.status).toBe(200) //Check if the response status is 200
        expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(1)
        response.body.forEach((user : User) => {
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('name');
            expect(user).toHaveProperty('surname');
            expect(user).toHaveProperty('address');
            expect(user).toHaveProperty('birthdate');
            expect(user.role).toBe(roleToSearch);
        })
    })
    afterAll(() => {
        cleanup()
        jest.clearAllMocks();
    });
});





// FR2.3
describe("Show a user FR2.3", () => {
    beforeAll(async () => {
        await postUser(admin)
        adminCookie = await login(admin)
        await postUser(customer)
        customerCookie = await login(customer)
        await postUser(manager)
        managerCookie = await login(manager)
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    }, 30000);


    afterEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    test("Retrieve user info: interacting with UserDAO", async () => {
        jest.spyOn(UserDAO.prototype, "getUserByUsername")
        const usernameToSearch = 'customer_test'
        const userDAO = new UserDAO();
        const result = await userDAO.getUserByUsername(usernameToSearch);
        expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1)
        expect(result.username).toBe(usernameToSearch)
    })

    test("Retrieve user info: interacting with UserDAO + userController", async () => {
        const usernameToSearch = 'customer_test'
        const userDAO = new UserDAO()
        const userController = new UserController()

        jest.spyOn(UserController.prototype, "getUserByUsername")
        const adminUser = await userDAO.getUserByUsername("admin_test")
        const result = await userController.getUserByUsername(adminUser, usernameToSearch);
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1)
        expect(result.username).toBe(usernameToSearch)
    })

    test("Final: Retrieve user info interacting with UserDAO + userController + Routes", async () => {
        const usernameToSearch = 'customer_test'
        jest.spyOn(UserController.prototype, "getUserByUsername")
        const response = await request(app).get(`${baseURL}/users/${usernameToSearch}`).set("Cookie", adminCookie)
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1)
        expect(response.status).toBe(200) //Check if the response status is 200
        expect(response.body['username']).toBe(usernameToSearch)
    })
    afterAll(() => {
        cleanup()
        jest.clearAllMocks();
    });
});


// FR2.4
describe("Update a user FR2.4", () => {
    beforeAll(async () => {
        await postUser(admin)
        adminCookie = await login(admin)
        await postUser(customer)
        customerCookie = await login(customer)
        await postUser(manager)
        managerCookie = await login(manager)
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    }, 30000);


    afterEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    test("Update user info: interacting with UserDAO", async () => {
        const userDAO = new UserDAO()
        jest.spyOn(UserDAO.prototype, "updateUserInfo")

        const result = await userDAO.updateUserInfo('newName', 'newSurname', 'newAddress', '01/01/1980', 'customer_test')
        expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(1)
        expect(result.username).toBe('customer_test')
        expect(result.name).toBe('newName')
        expect(result.surname).toBe('newSurname')
        expect(result.address).toBe('newAddress')
        expect(result.birthdate).toBe('01/01/1980')
    })

    test("Update user info: interacting with UserDAO + userController", async () => {
        const usernameToUpdate = 'customer_test'

        const userDAO = new UserDAO()
        const userController = new UserController()

        jest.spyOn(UserController.prototype, "updateUserInfo")
        const adminUser = await userDAO.getUserByUsername("admin_test")
        const result = await userController.updateUserInfo(adminUser, 'newName', 'newSurname', 'newAddress', '01/01/1980', usernameToUpdate);
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(1)
        expect(result.username).toBe(usernameToUpdate)
        expect(result.name).toBe('newName')
        expect(result.surname).toBe('newSurname')
        expect(result.address).toBe('newAddress')
        expect(result.birthdate).toBe('01/01/1980')
    })

    test("Final: Update user info interacting with UserDAO + userController + Routes", async () => {
        const usernameToUpdate = 'customer_test'
        // const testCustomer = {}("username_customer", "user", "surname", "Via Verdi 8", "2001-12-14");
        jest.spyOn(UserController.prototype, "updateUserInfo")
        const response = await request(app).patch(`${baseURL}/users/${usernameToUpdate}`).set("Cookie", adminCookie).send({
            name : "updatedName",
            surname : "updatedSurname",
            address : "sameAddress",
            birthdate : "2001-12-14"
        })
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(1)
        expect(response.status).toBe(200) //Check if the response status is 200
        expect(response.body['username']).toBe(usernameToUpdate)
    })
    afterAll(() => {
        cleanup()
        jest.clearAllMocks();
    });
});


// FR2.5
describe("Delete non-admin account FR2.5", () => {
    beforeAll(async () => {
        await postUser(admin)
        adminCookie = await login(admin)
        await postUser(customer)
        customerCookie = await login(customer)
        await postUser(manager)
        managerCookie = await login(manager)
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    }, 30000);


    afterEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    test("Delete a non-admin user: interacting with UserDAO", async () => {
        const userDAO = new UserDAO()
        const userToDelete = 'customer_test'
        jest.spyOn(UserDAO.prototype, "deleteUser")

        const result = await userDAO.deleteUser(userToDelete)
        expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1)
        expect(result).toBe(true)
    })

    test("Delete a non-admin user: interacting with UserDAO + userController", async () => {
        await postUser(customer)
        const usernameToDelete = 'customer_test'
        const userDAO = new UserDAO()
        const userController = new UserController()
        jest.spyOn(UserController.prototype, "deleteUser")
        const adminUser = await userDAO.getUserByUsername("admin_test")
        const result = await userController.deleteUser(adminUser, usernameToDelete);
        expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(1)
        expect(result).toBe(true)
    })

    test("Final: Delete a user interacting with UseraDAO + UserController + Routes", async () => {
        const username = 'manager_test'
        jest.spyOn(UserController.prototype, "deleteUser") //Spy deleteUser method of the controller
        const response = await request(app).delete(`${baseURL}/users/${username}`).set("Cookie", adminCookie)
        expect(response.status).toBe(200) //Check if the response status is 200
        expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(1) //Check if the deleteUser method has been called once
        expect(UserController.prototype.deleteUser).toHaveBeenCalledWith(
            expect.objectContaining({
                "username": "admin_test",
                "name": "admin_test",
                "surname": "admin_test",
                "role": "Admin"
            }),
            username
        )
    })
    afterAll(() => {
        cleanup()
        jest.clearAllMocks();
    });
});


// FR2.6
describe("Delete all non-admin accounts FR2.6", () => {
    beforeAll(async () => {
        await postUser(admin)
        adminCookie = await login(admin)
        await postUser(customer)
        customerCookie = await login(customer)
        await postUser(manager)
        managerCookie = await login(manager)
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    }, 30000);

    afterEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    test("Delete all non-admin users: interacting with UserDAO", async () => {
        const userDAO = new UserDAO()
        jest.spyOn(UserDAO.prototype, "deleteAll")

        const result = await userDAO.deleteAll()
        expect(UserDAO.prototype.deleteAll).toHaveBeenCalledTimes(1)
        expect(result).toBe(true)
    })

    test("Delete all non-admin users: interacting with UserDAO + userController", async () => {
        const userController = new UserController()
        jest.spyOn(UserController.prototype, "deleteAll")
        const result = await userController.deleteAll();
        expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(1)
        expect(result).toBe(true)
    })

    test("Final: Delete all non-admin users interacting with UseraDAO + UserController + Routes", async () => {
        jest.spyOn(UserController.prototype, "deleteAll") //Spy deleteUser method of the controller
        const response = await request(app).delete(`${baseURL}/users`).set("Cookie", adminCookie)
        expect(response.status).toBe(200) //Check if the response status is 200
        expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(1) //Check if the deleteUser method has been called once
        expect(UserController.prototype.deleteAll).toHaveBeenCalledWith();
    })

    afterAll(() => {
        cleanup()
        jest.clearAllMocks();
    });
});



