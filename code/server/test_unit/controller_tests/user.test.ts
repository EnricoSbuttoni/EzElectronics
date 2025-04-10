import { describe, test, expect, jest } from "@jest/globals"
import UserController from "../../src/controllers/userController"
import UserDAO from "../../src/dao/userDAO"
import { User, Role } from "../../src/components/user";
import { error } from "console";

jest.mock("../../src/dao/userDAO")

//Example of a unit test for the createUser method of the UserController
//The test checks if the method returns true when the DAO method returns true
//The test also expects the DAO method to be called once with the correct parameters


describe("Controller tests", () => {
    test("It should return true", async () => {
        const testUser = { //Define a test user object
            username: "test",
            name: "test",
            surname: "test",
            password: "test",
            role: "Manager"
        }
        jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(true); //Mock the createUser method of the DAO
        const controller = new UserController(); //Create a new instance of the controller
        //Call the createUser method of the controller with the test user object
        const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);

        //Check if the createUser method of the DAO has been called once with the correct parameters
        expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
            testUser.name,
            testUser.surname,
            testUser.password,
            testUser.role);
        expect(response).toBe(true); //Check if the response is true
    });


    //The test checks if the method returns an array of users when the DAO method returns User[]
    //The test also expects the DAO method to be called once with the correct parameters
    test("getUsers resolves with an array of users", async () => {
        const expectedUsers: User[] = [
            { username: "User01", name: "test", surname: "test", role: Role.MANAGER, address: 'Vicolo Stretto 45', birthdate: '' },
            { username: 'User02', name: 'testapi', surname: 'testapi', role: Role.CUSTOMER, address: 'Via Veloce 3', birthdate: '' }
        ];

        jest.spyOn(UserDAO.prototype, "getUsers").mockResolvedValueOnce(expectedUsers); //Mock the getUsers method of the DAO
        const controller = new UserController(); //Create a new instance of the controller
        //Call the getUsers method of the controller
        const response = await controller.getUsers();

        //Check if the createUser method of the DAO has been called once with the correct parameters
        expect(UserDAO.prototype.getUsers).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.getUsers).toHaveBeenCalledWith();  // getUsers has no input parameters
        expect(response).toBe(expectedUsers); //Check if the response is the array of expectedUsers
    });


    test("getUsersByRole resolves with an array of users of the specified role", async () => {
        const role = Role.MANAGER
        const expectedUsers: User[] = [
            { username: "User01", name: "manager01", surname: "01", role: role, address: '', birthdate: '' },
            { username: 'User02', name: 'manager02', surname: '02', role: role, address: '', birthdate: '' }
        ];

        jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce(expectedUsers); //Mock the getUsersByRole method of the DAO
        const controller = new UserController(); //Create a new instance of the controller
        //Call the getUsers method of the controller
        const response = await controller.getUsersByRole(role);

        //Check if the createUser method of the DAO has been called once with the correct parameters
        expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith(role);
        expect(response).toBe(expectedUsers); //Check if the response is the array of expectedUsers
    });

    test("getUserByUsername resolves with a user object", async () => {
        const admin: User = { username: "User02", name: "admin01", surname: "01", role: Role.ADMIN, address: '', birthdate: '' };

        const role = Role.MANAGER
        const usernameToSearch = 'User01'
        const expectedUser: User = { username: "User01", name: "manager01", surname: "01", role: role, address: '', birthdate: '' };
        jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(expectedUser); //Mock the getUsersByRole method of the DAO
        const controller = new UserController(); //Create a new instance of the controller
        //Call the getUsers method of the controller
        const response = await controller.getUserByUsername(admin, usernameToSearch);

        //Check if the createUser method of the DAO has been called once with the correct parameters
        expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith(usernameToSearch);
        expect(response).toBe(expectedUser); //Check if the response is the array of expectedUsers
    });



    test("deleteUser should return true", async () => {
        const testUser: User = { //Define a test user object
            username: "test",
            name: "test",
            surname: "test",
            role: Role.CUSTOMER,
            address: '',
            birthdate: ''
        }
        jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testUser); //Mock the deleteUser method of the DAO
        jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true); //Mock the deleteUser method of the DAO
        const controller = new UserController(); //Create a new instance of the controller
        //Call the deleteUser method of the controller with the test user object
        const response = await controller.deleteUser(testUser, testUser.username);

        //Check if the deleteUser method of the DAO has been called once with the correct parameters
        expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(testUser.username)
        expect(response).toBe(true); //Check if the response is true
    });


    test("deleteAll should return true", async () => {
        jest.spyOn(UserDAO.prototype, "deleteAll").mockResolvedValueOnce(true); //Mock the deleteAll method of the DAO
        const controller = new UserController(); //Create a new instance of the controller
        //Call the deleteAll method of the controller without parameters
        const response = await controller.deleteAll();

        //Check if the deleteUser method of the DAO has been called once with the correct parameters
        expect(UserDAO.prototype.deleteAll).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.deleteAll).toHaveBeenCalledWith()
        expect(response).toBe(true); //Check if the response is true
    });


    test("updateUserInfo should return the new info of the user", async () => {
        const testUpdateUser: User = { //Define a test user object
            username: "test",
            name: "test",
            surname: "test",
            role: Role.CUSTOMER,
            address: '',
            birthdate: ''
        }

        jest.spyOn(UserDAO.prototype, "updateUserInfo").mockResolvedValueOnce(testUpdateUser); //Mock the deleteAll method of the DAO
        const controller = new UserController(); //Create a new instance of the controller
        //Call the updateUserInfo method of the controller
        const response = await controller.updateUserInfo(testUpdateUser, testUpdateUser.name, testUpdateUser.surname, testUpdateUser.address, testUpdateUser.birthdate, testUpdateUser.username);

        //Check if the updateUserInfo method of the DAO has been called once with the correct parameters
        expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
        expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledWith(testUpdateUser.name, testUpdateUser.surname, testUpdateUser.address, testUpdateUser.birthdate, testUpdateUser.username)
        expect(response).toBe(testUpdateUser); //Check if the response is the updated User
    });

});


