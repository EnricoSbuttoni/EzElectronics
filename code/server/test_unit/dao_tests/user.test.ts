import { describe, test, expect, beforeAll, afterEach, afterAll, jest } from "@jest/globals"

import UserController from "../../src/controllers/userController"
import UserDAO from "../../src/dao/userDAO"
import crypto from "crypto"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import { UserNotFoundError } from "../../src/errors/userError"

jest.mock("crypto")
jest.mock("../../src/db/db.ts")



describe("Check the credentials during login", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });


    //It then calls getIsUserAuthenticated and expects it to resolve true (authenticated user)
    test("getIsUserAuthenticated with correct credentials should resolve true", async () => {
        const userDAO = new UserDAO()
        //It mocks the database get method
        const mockDBRun = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            //Create the user row
            const row = {
                username: "username",
                password: "hashedPassword",
                salt: "salt"
            }
            callback(null, row)
            return {} as Database
        });

        const mockTimingSafeEqual = jest.spyOn(crypto, "timingSafeEqual").mockImplementationOnce((passwordHex, hashedPassword) => {
            return true
        })

        const result = await userDAO.getIsUserAuthenticated("username", "password")
        expect(result).toBe(true)
    })

    test("getIsUserAuthenticated with wrong username should resolve false", async () => {
        const userDAO = new UserDAO()
        const mockDBRun = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            //Create the user row
            const row = {
                username: "username",
                password: "hashedPassword",
                salt: "salt"
            }
            callback(null, row)
            return {} as Database
        });

        const result = await userDAO.getIsUserAuthenticated("wrongUsername", "password")
        expect(result).toBe(false)
    })


    afterAll(() => {
        jest.clearAllMocks();
    });
});






describe("Create a user in the DB", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    //It mocks the database run method to simulate a successful insertion and the crypto randomBytes and scrypt methods to simulate the hashing of the password
    //It then calls the createUser method and expects it to resolve true
    test("It should resolve true", async () => {
        const userDAO = new UserDAO()
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        const mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementationOnce((size) => {
            return (Buffer.from("salt"))
        })
        const mockScrypt = jest.spyOn(crypto, "scrypt").mockImplementationOnce(async (password, salt, keylen) => {
            return Buffer.from("hashedPassword")
        })
        const result = await userDAO.createUser("username", "name", "surname", "password", "role")
        expect(result).toBe(true)
    })


    afterAll(() => {
        jest.clearAllMocks();
    });
});









describe("Get a user from the DB by username", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });


    test("It should resolve the user row", async () => {
        const userDAO = new UserDAO()
        const mockDBRun = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            //Create the user row
            const row = {
                username: 'username',
                name: 'newName',
                surname: 'newSurname',
                address: 'newAddress',
                birthdate: '01/01/1980'
            };
            callback(null, row)
            return {} as Database
        });
        const result = await userDAO.getUserByUsername('username')
        expect(result.username).toBe('username')
        expect(result.name).toBe('newName')
        expect(result.surname).toBe('newSurname')
        expect(result.address).toBe('newAddress')
        expect(result.birthdate).toBe('01/01/1980')
    })


    test("It should resolve UserNotFoundError() using a username that's not in the DB", async () => {
        const userDAO = new UserDAO()
        const mockDBRun = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        await expect(userDAO.getUserByUsername("unknownUsername")).rejects.toThrow(UserNotFoundError);
    })


    afterAll(() => {
        jest.clearAllMocks();
    });
});






describe("Get users from the database", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });


    test("It should resolve the user rows", async () => {
        const userDAO = new UserDAO()
        const mockDBRun = jest.spyOn(db, "all").mockImplementationOnce((sql, callback) => {
            //Create the user rows
            const rows = [
                {
                    username: 'username_001',
                    name: 'name_001',
                    surname: 'surname_001',
                    role: 'Customer',
                    password: 'hashedPassword_001',
                    salt: 'salt_001',
                    address: 'address_001',
                    birthdate: '01/01/1980'
                },
                {
                    username: 'username_002',
                    name: 'name_002',
                    surname: 'surname_002',
                    role: 'Manager',
                    password: 'hashedPassword_002',
                    salt: 'salt_002',
                    address: 'address_002',
                    birthdate: '06/06/1990'
                }
            ];
            callback(null, rows)
            return {} as Database
        });
        const result = await userDAO.getUsers()
        expect(result[0].username).toBe('username_001')
        expect(result[0].name).toBe('name_001')
        expect(result[0].surname).toBe('surname_001')
        expect(result[0].role).toBe('Customer')
        expect(result[0].address).toBe('address_001')
        expect(result[0].birthdate).toBe('01/01/1980')
        expect(result[1].username).toBe('username_002')
        expect(result[1].name).toBe('name_002')
        expect(result[1].surname).toBe('surname_002')
        expect(result[1].role).toBe('Manager')
        expect(result[1].address).toBe('address_002')
        expect(result[1].birthdate).toBe('06/06/1990')

    })

    test("It should resolve UserNotFoundError when the DB returns an empty row", async () => {
        const userDAO = new UserDAO()
        const mockDBRun = jest.spyOn(db, "all").mockImplementationOnce((sql, callback) => {
            callback(null)
            return {} as Database
        });
        await expect(userDAO.getUsers()).rejects.toThrow(UserNotFoundError);
    })




    afterAll(() => {
        jest.clearAllMocks();
    });
});






describe("Get users by role", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    test("It should resolve the user rows based on the role", async () => {
        const userDAO = new UserDAO()
        const mockDBRun = jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            //Create the user rows
            const rows = [
                {
                    username: 'username_001',
                    name: 'name_001',
                    surname: 'surname_001',
                    role: 'Manager',
                    password: 'hashedPassword_001',
                    salt: 'salt_001',
                    address: 'address_001',
                    birthdate: '01/01/1980'
                },
                {
                    username: 'username_002',
                    name: 'name_002',
                    surname: 'surname_002',
                    role: 'Manager',
                    password: 'hashedPassword_002',
                    salt: 'salt_002',
                    address: 'address_002',
                    birthdate: '06/06/1990'
                }
            ];
            callback(null, rows)
            return {} as Database
        });
        const result = await userDAO.getUsersByRole('Manager')
        expect(result[0].username).toBe('username_001')
        expect(result[0].name).toBe('name_001')
        expect(result[0].surname).toBe('surname_001')
        expect(result[0].role).toBe('Manager')
        expect(result[0].address).toBe('address_001')
        expect(result[0].birthdate).toBe('01/01/1980')
        expect(result[1].username).toBe('username_002')
        expect(result[1].name).toBe('name_002')
        expect(result[1].surname).toBe('surname_002')
        expect(result[1].role).toBe('Manager')
        expect(result[1].address).toBe('address_002')
        expect(result[1].birthdate).toBe('06/06/1990')
    })


    test("It should throws UserNotFoundError if there is no row", async () => {
        const userDAO = new UserDAO()
        // Mock the database run method
        const mockDBRun = jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        await expect(userDAO.getUsersByRole('Manager')).rejects.toThrow(UserNotFoundError);
    })

    afterAll(() => {
        jest.clearAllMocks();
    });
});



describe("Delete user", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });


    test("It should resolve true", async () => {
        const userDAO = new UserDAO()

        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(null)
            return {} as Database
        });

        expect(await userDAO.deleteUser("usernameToDelete")).toBe(true)
    })



    afterAll(() => {
        jest.clearAllMocks();
    });
});


describe("Delete all non-admin users from the database", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });


    test("It should resolve true", async () => {
        const userDAO = new UserDAO()
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, callback) => {
            callback()
            return {} as Database
        });

        const result = await userDAO.deleteAll()
        expect(result).toBe(true)
    })



    afterAll(() => {
        jest.clearAllMocks();
    });
});








describe("Update user information", () => {
    beforeAll(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetModules();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    test("It should resolve the updated user row", async () => {
        const userDAO = new UserDAO()
        const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
            callback(null)
            return {} as Database
        });
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            //Create the user row
            const row = {
                username: 'username',
                name: 'newName',
                surname: 'newSurname',
                address: 'newAddress',
                birthdate: '01/01/1980'
            };
            callback(null, row)
            return {} as Database
        });
        const result = await userDAO.updateUserInfo('name', 'surname', 'address', '01/01/1980', 'username')
        expect(result.username).toBe('username')
        expect(result.name).toBe('newName')
        expect(result.surname).toBe('newSurname')
        expect(result.address).toBe('newAddress')
        expect(result.birthdate).toBe('01/01/1980')
    })

    afterAll(() => {
        jest.clearAllMocks();
    });
});
