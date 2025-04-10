import { test, expect, jest,beforeAll, afterAll,afterEach,describe } from "@jest/globals"
import CartController from "../../src/controllers/cartController"
import CartDao from "../../src/dao/cartDAO"
import UserDAO from "../../src/dao/userDAO";
import UserController from "../../src/controllers/userController";
import { Category, Product } from "../../src/components/product";
import { User, Role } from "../../src/components/user";
import { Cart, ProductInCart } from "../../src/components/cart";
import { CartNotFoundError } from "../../src/errors/cartError";
import { ProductNotFoundError } from "../../src/errors/productError";
import { Database } from "sqlite3";
import CartDAO from "../../src/dao/cartDAO";

afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
});
afterAll(()=>{

})

//Example of a unit test for the createUser method of the UserController
//The test checks if the method returns true when the DAO method returns true
//The test also expects the DAO method to be called once with the correct parameters
const mockAuthenticateUser = jest.fn()
describe("CONTROLLER TEST",()=>{
    beforeAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });
    jest.mock("../../src/dao/cartDAO");
    test("Adding product to empty cart with authenticated user - Success", async () => {
        const testUser = new User("test_user", "Test", "Test", Role.CUSTOMER, "test_address", "2001-12-14"); // Create User instance
        const testProduct = new Product(1, "test", Category.SMARTPHONE, "2024-04-05", "test", 10);
    
        mockAuthenticateUser.mockReturnValueOnce(true); // User is authenticated
        jest.spyOn(CartDao.prototype, "addProduct").mockResolvedValueOnce(true); // Mock adding product
    
        const controller = new CartController(); // Inject mock authentication
    
        const response = await controller.addToCart(testUser, testProduct.model);
    
        expect(CartDao.prototype.addProduct).toHaveBeenCalledTimes(1); // Add product called with correct user and product IDs
        expect(CartDao.prototype.addProduct).toHaveBeenCalledWith(testUser.username, testProduct.model);
        expect(response).toBe(true); // Successful addition
    });
    
    
    test("Removing Product from Cart", async () => {
        const testUser = new User("test_user", "Test", "Test", Role.CUSTOMER, "test_address", "2001-12-14"); // Create User instance
        const testProduct = new Product(1, "test", Category.SMARTPHONE, "2024-04-05", "test", 10);
    
        mockAuthenticateUser.mockReturnValueOnce(true); // User is authenticated
        jest.spyOn(CartDao.prototype, "removeFromCart").mockResolvedValueOnce(true); // Mock adding product
    
        const controller = new CartController(); // Inject mock authentication
    
        const response = await controller.removeProductFromCart(testUser, testProduct.model);
    
        expect(CartDao.prototype.removeFromCart).toHaveBeenCalledTimes(1); // Add product called with correct user and product IDs
        expect(CartDao.prototype.removeFromCart).toHaveBeenCalledWith(testUser.username, testProduct.model);
        expect(response).toBe(true); // Successful addition
    
    });
    
    test("Removing all Products from Cart", async () => {
        const testUser = new User("test_user", "Test", "Test", Role.CUSTOMER, "test_address", "2001-12-14"); // Create User instance
    
        mockAuthenticateUser.mockReturnValueOnce(true); // User is authenticated
        jest.spyOn(CartDao.prototype, "removeAllfromCart").mockResolvedValueOnce(true); // Mock adding product
    
        const controller = new CartController(); // Inject mock authentication
    
        const response = await controller.clearCart(testUser);
    
        expect(CartDao.prototype.removeAllfromCart).toHaveBeenCalledTimes(1); // Add product called with correct user and product IDs
        expect(CartDao.prototype.removeAllfromCart).toHaveBeenCalledWith(testUser.username);
        expect(response).toBe(true); // Successful addition
    
    });
    
    test("Retrieve Cart with element", async () => {
        const testUser = new User("test_user", "Test", "Test", Role.CUSTOMER, "test_address", "2001-12-14"); // Create User instance
        const testProduct = new Product(1, "test", Category.SMARTPHONE, "2024-04-05", "test", 10);
        const productinCart = new ProductInCart("test",1,Category.SMARTPHONE,1)
        const testCart= new Cart("test_user",false,"",1,[productinCart]);
    
        mockAuthenticateUser.mockReturnValueOnce(testCart); // User is authenticated
        const mockGet=jest.spyOn(CartDao.prototype, "getCart").mockResolvedValueOnce(testCart);
         // Mock adding product
        
        // Creazione di un'istanza del controller del carrello
        const controller = new CartController(); 
        const response = await controller.getCart(testUser);
    
        // Verificare che la funzione getCart del DAO sia stata chiamata una volta
        expect(mockGet).toHaveBeenCalledTimes(1);
        
        // Verificare che la funzione getCart del DAO sia stata chiamata con il nome utente corretto
        expect(CartDao.prototype.getCart).toHaveBeenCalledWith(testUser.username);
        mockGet.mockRestore();

    });
    
    test("Retrieve Cart with no element", async () => {
        const testUser = new User("test_user", "Test", "Test", Role.CUSTOMER, "test_address", "2001-12-14"); // Create User instance
        const testProduct = new Product(1, "test", Category.SMARTPHONE, "2024-04-05", "test", 10);
        const testCart= new Cart("test_user",false,"",1,[]);
    
        mockAuthenticateUser.mockReturnValueOnce(testCart); // User is authenticated
        const mockGet=jest.spyOn(CartDao.prototype, "getCart").mockResolvedValueOnce(testCart);
        
        // Creazione di un'istanza del controller del carrello
        const controller = new CartController(); 
        const response = await controller.getCart(testUser);
    
        // Aggiungere il prodotto al carrello
       // await controller.addToCart(testUser, testProduct.model);
        
        // Verificare che la funzione getCart del DAO sia stata chiamata una volta
        expect(mockGet).toHaveBeenCalledTimes(1);
        
        // Verificare che la funzione getCart del DAO sia stata chiamata con il nome utente corretto
        expect(CartDao.prototype.getCart).toHaveBeenCalledWith(testUser.username);
        mockGet.mockRestore();
    });
    
    test("Checkout Cart", async()=>{
        const testUser = new User("test_user", "Test", "Test", Role.CUSTOMER, "test_address", "2001-12-14"); // Create User instance
        const testProduct = new Product(1, "test", Category.SMARTPHONE, "2024-04-05", "test", 10);
        const productinCart = new ProductInCart("test",1,Category.SMARTPHONE,1)
        const testCart= new Cart("test_user",false,"",1,[productinCart]);
    
        mockAuthenticateUser.mockReturnValueOnce(testCart); // User is authenticated
        jest.spyOn(CartDao.prototype, "checkoutCart").mockResolvedValueOnce(true);
        
        // Creazione di un'istanza del controller del carrello
        const controller = new CartController(); 
        const response = await controller.checkoutCart(testUser);
    
        // Aggiungere il prodotto al carrello
       // await controller.addToCart(testUser, testProduct.model);
        
        // Verificare che la funzione getCart del DAO sia stata chiamata una volta
        expect(CartDao.prototype.checkoutCart).toHaveBeenCalledTimes(1);
        
        // Verificare che la funzione getCart del DAO sia stata chiamata con il nome utente corretto
        expect(CartDao.prototype.checkoutCart).toHaveBeenCalledWith(testUser.username);
    });
    
    test("Retrieve all Carts", async()=>{
        const testUser = new User("test_user", "Test", "Test", Role.CUSTOMER, "test_address", "2001-12-14"); // Create User instance
        const productinCart = new ProductInCart("test",1,Category.SMARTPHONE,1)
        const testCart= new Cart("test_user",false,"",1,[productinCart]);
        const testCart1= new Cart("test_user",false,"",10,[productinCart]);
        const carts:Cart[]=[];
        carts.push(testCart);
        carts.push(testCart1);
        mockAuthenticateUser.mockReturnValueOnce(carts); // User is authenticated
        jest.spyOn(CartDao.prototype, "getAllCarts").mockResolvedValueOnce(carts);
        
        // Creazione di un'istanza del controller del carrello
        const controller = new CartController(); 
        const response = await controller.getAllCarts();
    
        // Aggiungere il prodotto al carrello
       // await controller.addToCart(testUser, testProduct.model);
        
        // Verificare che la funzione getCart del DAO sia stata chiamata una volta
        expect(CartDao.prototype.getAllCarts).toHaveBeenCalledTimes(1);
        
        // Verificare che la funzione getCart del DAO sia stata chiamata con il nome utente corretto
        expect(CartDao.prototype.getAllCarts).toHaveBeenCalledWith();
    });


    test("Retrieve all Carts of a single User", async()=>{
        const testUser = new User("test_user", "Test", "Test", Role.CUSTOMER, "test_address", "2001-12-14"); // Create User instance
        const productinCart = new ProductInCart("test",1,Category.SMARTPHONE,1)
        const testCart= new Cart("test_user",false,"",1,[productinCart]);
        const testCart1= new Cart("test_user",false,"",10,[productinCart]);
        const carts:Cart[]=[];
        carts.push(testCart);
        carts.push(testCart1);
        mockAuthenticateUser.mockReturnValueOnce(carts); // User is authenticated
        jest.spyOn(CartDao.prototype, "retrieveCarts").mockResolvedValueOnce(carts);
        
        // Creazione di un'istanza del controller del carrello
        const controller = new CartController(); 
        const response = await controller.getCustomerCarts(testUser);
        
        // Verificare che la funzione getCart del DAO sia stata chiamata una volta
        expect(CartDao.prototype.retrieveCarts).toHaveBeenCalledTimes(1);
        
        // Verificare che la funzione getCart del DAO sia stata chiamata con il nome utente corretto
        expect(CartDao.prototype.retrieveCarts).toHaveBeenCalledWith(testUser.username);
    })
    
    
    test("Delete all carts", async()=>{
        const testUser = new User("test_user", "Test", "Test", Role.CUSTOMER, "test_address", "2001-12-14"); // Create User instance
        
        jest.spyOn(CartDao.prototype, "deleteAllCarts").mockResolvedValueOnce(true);
        
        // Creazione di un'istanza del controller del carrello
        const controller = new CartController(); 
        const response = await controller.deleteAllCarts();
    
        // Aggiungere il prodotto al carrello
       // await controller.addToCart(testUser, testProduct.model);
        
        // Verificare che la funzione getCart del DAO sia stata chiamata una volta
        expect(CartDao.prototype.deleteAllCarts).toHaveBeenCalledTimes(1);
        
        // Verificare che la funzione getCart del DAO sia stata chiamata con il nome utente corretto
        expect(CartDao.prototype.deleteAllCarts).toHaveBeenCalledWith();
    })

})




