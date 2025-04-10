import db from "../db/db";
import { Cart, ProductInCart } from "../components/cart";
import { User } from "../components/user";
import { CartNotFoundError, EmptyCartError, ProductNotInCartError } from "../errors/cartError";
import { ProductAlreadyExistsError, ProductNotFoundError, ProductSoldError } from "../errors/productError";
import dayjs from "dayjs";
import { resolve } from "path";
import { rejects } from "assert";
import { readlink } from "fs";

/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {

    // Helper functions to run SQL queries asynchronously
        runAsync(sql: string, params: any[] = [], errore: any= Error): Promise<void> {
            return new Promise((resolve, reject) => {
                db.run(sql, params, function (err: Error | null) {
                    if (err) {
                        reject(new errore());
                    } else {
                        resolve();
                    }
                });
            });
        }

        getAsync(sql: string, params: any[] = [], errore: number): Promise<any> {
            return new Promise((resolve, reject) => {
                db.get(sql, params, (err: Error | null, row: any) => {
                    if (err) {
                        reject();
                    } else {
                        if (!row) {
                            if (!row) {
                                if(errore===0){
                                    reject(new CartNotFoundError());
                                }
                                else if(errore===1){
                                    reject(new ProductNotFoundError());
                                }
                                else if(errore===2){
                                    reject(new ProductNotInCartError());
                                }
                            }                        }
                        resolve(row);
                    }
                });
            });
    }

    addProduct(username: string, model: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const today = dayjs().format("YYYY-MM-DD");

            const sqlSelectCart = "SELECT * FROM carts WHERE customer=? and paid=false";
            db.get(sqlSelectCart, [username], (err: Error | null, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                let cart: Cart;
                const self = this;
                if (!row) {
                    let cartId;
                    cart = new Cart(username, false, today, 0, []);
                    const sqlInsertCart = "INSERT INTO carts(customer, paid, paymentDate, total) VALUES(?, ?, ?, ?)";
                    db.run(sqlInsertCart, [username, false, null, 0], function (err: Error | null) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        const cartId = this.lastID;
                        self.addProductToCart(cart, model, cartId, resolve, reject);
                    });
                }
                else {
                    const cartId = row.cartId;
                    let pagato=false;
                        if(row.paid){
                            pagato=true;
                        }
                    cart = new Cart(row.customer, pagato, row.paymentDate, row.total, []);
                    const sqlSelectProducts = "SELECT * FROM products_in_cart WHERE cartId=?";
                    db.all(sqlSelectProducts, [cartId], (err: Error | null, rows: any[]) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        rows.forEach(row => {
                            cart.products.push(new ProductInCart(row.model, row.quantity, row.category, row.price));
                        });

                        this.addProductToCart(cart, model, cartId, resolve, reject);
                    });
                }
            });
        });
    }

    // Function to add a product to the cart
    addProductToCart(cart: Cart, model: string, cartId: number, resolve: (value: boolean) => void, reject: (reason?: any) => void): void {
        const sqlProduct = "SELECT * FROM products WHERE model=?";
        db.get(sqlProduct, [model], (err: Error | null, product: any) => {
            if (err) {
                reject(new ProductNotFoundError());
                return;
            }

            if (!product) {
                reject(new ProductNotFoundError());
                return;
            }
            else if (product.quantity === 0) {
                reject(new ProductSoldError());
                return;
            }

            const existingProduct = cart.products.find(p => p.model === model);

            if (existingProduct) {
                // Update quantity if the product already exists in the cart
                existingProduct.quantity += 1;
                const sqlUpdateQuantity = "UPDATE products_in_cart SET quantity=? WHERE cartId=? AND model=?";
                db.run(sqlUpdateQuantity, [existingProduct.quantity, cartId, model], (err: Error | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.updateCartCost(cart, product.sellingPrice, cartId, resolve, reject);
                });
            } else {
                // Add new product to the cart
                const newProduct = new ProductInCart(model, 1, product.category, product.sellingPrice);
                cart.products.push(newProduct);

                const sqlInsertProduct = "INSERT INTO products_in_cart(cartId, model, quantity, category, price) VALUES(?, ?, ?, ?, ?)";
                db.run(sqlInsertProduct, [cartId, model, 1, product.category, product.sellingPrice], (err: Error | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    this.updateCartCost(cart, product.sellingPrice, cartId, resolve, reject);
                });
            }
        });
    }

    // Function to update the cart cost
    updateCartCost(cart: Cart, priceToAdd: number, cartId: number, resolve: (value: boolean) => void, reject: (reason?: any) => void): void {
        const newTotal = cart.total + priceToAdd;
        const sqlUpdateCartCost = "UPDATE carts SET total=? WHERE cartId=?";
        db.run(sqlUpdateCartCost, [newTotal, cartId], (err: Error | null) => {
            if (err) {
                reject(err);
                return;
            }
            cart.total = newTotal;
            resolve(true);
        });
    }


    async getCart(username: string): Promise<Cart> {
        try {
            const today = dayjs().format("YYYY-MM-DD");
            const sql = "SELECT * FROM CARTS WHERE customer= ? AND PAID=false";

            const row = await new Promise<any>((resolve, reject) => {
                db.get(sql, [username], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(row);
                });
            });

            if (!row) {
                const cart1: Cart = new Cart(username, false, null, 0, []);
                return cart1;
            }
            let pagato=false;
                        if(row.paid){
                            pagato=true;
                        }
            const cart: Cart = new Cart(row.customer, pagato, row.paymentDate, row.total, []);
            const cartId = row.cartId;
            const sqlSelectProducts = "SELECT * FROM products_in_cart WHERE cartId=?";

            const rows = await new Promise<any[]>((resolve, reject) => {
                db.all(sqlSelectProducts, [cartId], (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(new CartNotFoundError());
                        return;
                    }
                    resolve(rows);
                });
            });

            rows.forEach(row => {
                cart.products.push(new ProductInCart(row.model, row.quantity, row.category, row.price));
            });

            return cart;
        } catch (error) {
            throw error;
        }
    }

    async checkoutCart(username: string): Promise<boolean> {
        try {
            const today = dayjs().format("YYYY-MM-DD");

            // Step 1: Verify that the cart has items and the items are in stock
            const sql1 = "SELECT * FROM products_in_cart WHERE cartId=(SELECT cartId FROM carts WHERE customer=? and paid=false)";
            const rows = await new Promise<any[]>((resolve, reject) => {
                db.all(sql1, [username], (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(new CartNotFoundError());
                        return;
                    }
                    if (rows.length === 0) {
                        reject(new EmptyCartError());
                        return;
                    }
                    resolve(rows);
                });
            });

            const productIds = rows.map((row: { model: any; }) => row.model);
            const placeholders = productIds.map(() => '?').join(',');
            const sql2 = `SELECT model, quantity FROM products WHERE model IN (${placeholders})`;

            const stockRows = await new Promise<any[]>((resolve, reject) => {
                db.all(sql2, productIds, (err: Error | null, stockRows: any[]) => {
                    if (err || stockRows.length !== rows.length) {
                        reject(new ProductNotFoundError());
                        return;
                    }
                    resolve(stockRows);
                });
            });

            const stockMap = new Map(stockRows.map(stockRow => [stockRow.model, stockRow.quantity]));

            for (const row of rows) {
                const stockQuantity = stockMap.get(row.model); // Use row.model to get stock quantity
                if (stockQuantity === undefined || row.quantity > stockQuantity) {
                    throw new ProductSoldError();
                }
            }
            
            // Step 2: Mark the cart as paid
            const sqlUpdateCart = "UPDATE carts SET paid = true, paymentDate=? WHERE customer = ? and paid=false";
            const result = await new Promise<boolean>((resolve, reject) => {
                db.run(sqlUpdateCart, [today,username], function (err: Error | null) {
                    if (err) {
                        reject(new CartNotFoundError());
                        return;
                    }
                    resolve(this.changes > 0);
                });
            });

            // Step 3: Deduct the quantities from the products
            for (const row of rows) {
                const sqlUpdateProduct = "UPDATE products SET quantity = quantity - ? WHERE model = ?";
                await new Promise<void>((resolve, reject) => {
                    db.run(sqlUpdateProduct, [row.quantity, row.model], (err: Error | null) => {
                        if (err) {
                            reject(new Error(`Failed to update quantity for product ${row.model}`));
                            return;
                        }
                        resolve();
                    });
                });
            }

            return result;
        } catch (error) {
            throw error;
        }
    }


async retrieveCarts(username: string): Promise<Cart[]> {
        return new Promise<Cart[]>((resolve, reject) => {
            const sqlSelectCart = "SELECT * FROM carts WHERE customer=? and Paid=true";
            db.all(sqlSelectCart, [username], (err: Error | null, rows: { customer: string; paid: boolean; paymentDate: string; total: number; cartId: number }[]) => {
                if (err) {
                    return reject(new CartNotFoundError());
                }
    
                if (!rows || rows.length === 0) {
                    return resolve([]);
                }
    
                type Carrellonumerato = {
                    car: Cart,
                    cartId: number
                };  
                const carrelli: Carrellonumerato[] = rows.map((riga: { customer: string; paid: boolean; paymentDate: string; total: number; cartId: number }) => {
                    const mockCart = new Cart(riga.customer,true, riga.paymentDate, riga.total, []);
                    return { car: mockCart, cartId: riga.cartId };
                });
    
                const promises = carrelli.map(carrello => {
                    return new Promise<Cart>((resolve, reject) => {
                        const sqlSelectProducts = "SELECT * FROM products_in_cart WHERE cartId=?";
                        db.all(sqlSelectProducts, [carrello.cartId], (err: Error | null, productRows: any[]) => {
                            if (err) {
                                return reject(new ProductNotFoundError());
                            }
    
                            if (productRows.length === 0) {
                                return reject(new ProductNotFoundError());
                            }
    
                            productRows.forEach(row => {
                                carrello.car.products.push(new ProductInCart(row.model, row.quantity, row.category, row.price));
                            });
    
                            resolve(carrello.car);
                        });
                    });
                });
    
                Promise.all(promises)
                    .then(resolve)
                    .catch(reject);
            });
        });
    }

    
    async removeFromCart(username: string, model: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            // Step 1: Fetch cart
            const sqlCart = "SELECT * FROM carts WHERE customer=? AND paid=false";
            db.get(sqlCart, [username], (err, cartRow:any) => {
                if (err || !cartRow) {
                    reject(new CartNotFoundError());
                    return;
                }
                const cartId = cartRow.cartId;
                let total = cartRow.total;
    
                // Step 2: Fetch product in cart
                const sqlProductInCart = "SELECT * FROM products_in_cart WHERE cartId=? AND model=?";
                db.get(sqlProductInCart, [cartId, model], (err, productInCartRow:any) => {
                    if (err || !productInCartRow) {
                        reject(new ProductNotInCartError());
                        return;
                    }
    
                    const price = productInCartRow.price;
    
                    // Step 3: Update product quantity in cart or delete if quantity is 1
                    if (productInCartRow.quantity === 1) {
                        const sqlDeleteProduct = "DELETE FROM products_in_cart WHERE cartId=? AND model=?";
                        db.run(sqlDeleteProduct, [cartId, model], (err) => {
                            if (err) {
                                reject(new ProductNotInCartError());
                                return;
                            }
                            updateCartTotal();
                        });
                    } else {
                        const sqlUpdateQuantity = "UPDATE products_in_cart SET quantity=quantity-1 WHERE cartId=? AND model=?";
                        db.run(sqlUpdateQuantity, [cartId, model], (err) => {
                            if (err) {
                                reject(new ProductNotInCartError());
                                return;
                            }
                            updateCartTotal();
                        });
                    }
    
                    // Step 4: Update cart total
                    function updateCartTotal() {
                        total -= price;
                        const sqlUpdateTotal = "UPDATE carts SET total=? WHERE cartId=?";
                        db.run(sqlUpdateTotal, [total, cartId], (err) => {
                            if (err) {
                                reject(new CartNotFoundError());
                                return;
                            }
                            resolve(true);
                        });
                    }
                });
            });
        });
    }
    


    
//TESTATO


async removeAllfromCart(username: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        // Step 1: Fetch cart
        const sqlSelectCart = "SELECT * FROM carts WHERE customer=? and paid=false";
        db.get(sqlSelectCart, [username], (err, row:any) => {
            if (err || !row) {
                reject(new CartNotFoundError());
                return;
            }
            const cartId = row.cartId;

            // Step 2: Delete all products from the cart
            const sqlDeleteProducts = "DELETE FROM products_in_cart WHERE cartId=?";
            db.run(sqlDeleteProducts, [cartId], (err) => {
                if (err) {
                    reject(new CartNotFoundError());
                    return;
                }

                // Step 3: Update the cart total to 0
                const sqlUpdatePrice = "UPDATE carts SET total=0 WHERE cartId=?";
                db.run(sqlUpdatePrice, [cartId], (err) => {
                    if (err) {
                        reject(new CartNotFoundError());
                        return;
                    }
                    resolve(true);
                });
            });
        });
    });
}

    deleteAllCarts(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "DELETE FROM PRODUCTS_IN_CART"
                db.run(sql, [], (err: Error | null, row: any) => {
                    if (err) {
                        resolve(false);
                    }
                    const sql1 = "DELETE FROM CARTS"
                    db.run(sql1, [], (err: Error | null, row: any) => {
                        if (err) {
                            resolve(false);
                        }
                        resolve(true);
                    })

                })
            }



            catch (err) {
                reject(false);
            }
        })
    }
    getAllCarts(): Promise<Cart[]> {
        return new Promise<Cart[]>((resolve, reject) => {
            try {
                const sqlSelectCart = "SELECT * FROM carts where total<>0";
                db.all(sqlSelectCart, [], (err: Error | null, rows: { customer: string; paid: boolean; paymentDate: string; total: number; cartId: number }[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (!rows || rows.length === 0) {
                        resolve([]);
                        return;
                    }

                    type Carrellonumerato = {
                        car: Cart,
                        cartId: number
                    };

                    const carrelli: Carrellonumerato[] = rows.map((riga) => {
                        let pagato=false;
                        if(riga.paid){
                            pagato=true;
                        }
                        const mockCart = new Cart(riga.customer, pagato, riga.paymentDate, riga.total, []);
                        return { car: mockCart, cartId: riga.cartId };
                    });

                    const promises = carrelli.map(carrello => {
                        return new Promise<Cart>((resolve, reject) => {
                            const cartId = carrello.cartId;
                            const sqlSelectProducts = "SELECT * FROM products_in_cart WHERE cartId=?";
                            db.all(sqlSelectProducts, [cartId], (err: Error | null, productRows: any[]) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                productRows.forEach(row => {
                                    carrello.car.products.push(new ProductInCart(row.model, row.quantity, row.category, row.price));
                                });

                                resolve(carrello.car);
                            });
                        });
                    });

                    Promise.all(promises)
                        .then(updatedCarrelli => resolve(updatedCarrelli))
                        .catch(err => {
                            reject(err);
                        });
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default CartDAO


