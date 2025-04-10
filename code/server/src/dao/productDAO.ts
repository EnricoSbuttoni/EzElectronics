import db from "../db/db"
import { Product } from "../components/product"
import { DateError } from "../utilities";
import { ProductAlreadyExistsError, ProductNotFoundError, ProductSoldError } from "../errors/productError";
import dayjs from "dayjs";

/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {

    /**
     * Registers a new product concept (model, with quantity defining the number of units available) in the database.
     * @param model The unique model of the product.
     * @param category The category of the product.
     * @param quantity The number of units of the new product.
     * @param details The optional details of the product.
     * @param sellingPrice The price at which one unit of the product is sold.
     * @param arrivalDate The optional date in which the product arrived.
     * @returns A Promise that resolves to nothing.
     */
    registerProducts(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string | null): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                if(!arrivalDate) arrivalDate = dayjs().format("YYYY-MM-DD")
                let sql = "INSERT INTO products(model, category, quantity, details, sellingPrice, arrivalDate) VALUES(?, ?, ?, ?, ?, ?)"
                db.run(sql,[model,category,quantity,details,sellingPrice,arrivalDate], (err: Error | null) => {
                    if(err) {
                        if (err.message.includes("UNIQUE constraint failed: products.model")) {
                            reject(new ProductAlreadyExistsError);
                            return;
                        }
                        reject(err)
                    }
                    resolve()
                })
            } catch (error) {
                reject(error)
            }
        });
    }

    /**
     * Increases the available quantity of a product through the addition of new units.
     * @param model The model of the product to increase.
     * @param newQuantity The number of product units to add. This number must be added to the existing quantity, it is not a new total.
     * @param changeDate The optional date in which the change occurred.
     * @returns A Promise that resolves to the new available quantity of the product.
     */
    changeProductQuantity(model: string, newQuantity: number, changeDate: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
                // Checking if the changeDate is after the arrivalDate
                db.get("SELECT arrivalDate FROM products WHERE model = ?",[model],(err,row: any) => {
                    if (err) reject(err)
                    else if (row === undefined) {
                        reject(new ProductNotFoundError);
                        return;
                    }
                    else if(dayjs(row.arrivalDate).isAfter(dayjs(changeDate))) {
                        reject (new DateError);
                        return;
                    }
                    db.run("UPDATE products SET quantity =  quantity + ? WHERE model = ?",[newQuantity, model], function(err){
                        if(err) reject(err)
                        else {
                            db.get("SELECT quantity FROM products WHERE model = ?",[model],(err,row: any) => {
                                if (err) reject(err)
                                else resolve(row.quantity)
                            })
                        }
                    })
                }) 
            } catch (error) {
                resolve(error)
            }
        });
    }


     /**
     * Decreases the available quantity of a product through the sale of units.
     * @param model The model of the product to sell
     * @param quantity The number of product units that were sold.
     * @param sellingDate The optional date in which the sale occurred.
     * @returns A Promise that resolves to the new available quantity of the product.
     */
     async sellProduct(model: string, quantity: number, sellingDate: string | null): Promise<number>  { 
        return new Promise<number>((resolve, reject) => {
            try {
                db.get("SELECT arrivalDate FROM products WHERE model = ?",[model],(err,row: any) => {
                    if (err) reject(err)
                    else if (row === undefined) {
                        reject(new ProductNotFoundError);
                        return;
                    }
                    else if(dayjs(row.arrivalDate).isAfter(dayjs(sellingDate))) {
                        reject (new DateError);
                        return;
                    }
                    else db.get("SELECT quantity FROM products WHERE model = ?",[model],(err, row: any) => {
                            if (err) reject(err)
                            else if (row === undefined) {
                                reject(new ProductNotFoundError);
                                return;
                            }
                            else if(row.quantity === 0 || row.quantity < quantity) {
                                reject (new ProductSoldError);
                                return;
                            }
                            else db.run("UPDATE products SET quantity = ? WHERE model = ?",[row.quantity - quantity, model], function(err){
                                    if(err) reject(err)
                                    else {
                                            db.get("SELECT quantity FROM products WHERE model = ?",[model],(err,row: any) => {
                                            if (err) reject(err)
                                            else {
                                        resolve(row.quantity)}
                                        })
                                    }
                                })
                        })
                })  
            } catch (error) {
                resolve(error)
            }
        });
     }


    /**
     * Returns all products in the database, with the option to filter them by category or model.
     * @param grouping An optional parameter. If present, it can be either "category" or "model".
     * @param category An optional parameter. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
     * @param model An optional parameter. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
     * @returns A Promise that resolves to an array of Product objects.
     */
    getProducts(grouping: string | null, category: string | null, model: string | null): Promise<Product[]>  { 
        return new Promise<Product[]>((resolve, reject) => {
            try{
                let sql
                let suffix = ""
                let params
                if (grouping!=null){
                    if(grouping=="category") {
                            suffix = " WHERE category = ?"
                            params = category
                    }   else if(grouping=="model") {
                            sql = "SELECT model FROM products WHERE model = ?"
                            db.get(sql,[model],(err,model: string) => {
                                if(err) reject(err)
                                else if(model === undefined) {
                                    reject(new ProductNotFoundError);
                                    return;
                                }
                            })
                            suffix = " WHERE model = ?"
                            params = model
                    }
                } 
                db.all<Product>(`SELECT * FROM products${suffix}`,[params], (err, rows) => {
                    if(err) reject(err)
                    else{
                        const products = rows.map((prod) => new Product(prod.sellingPrice, prod.model, prod.category, prod.arrivalDate, prod.details, prod.quantity))
                        resolve(products)
                    }
                })
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Returns all available products (with a quantity above 0) in the database, with the option to filter them by category or model.
     * @param grouping An optional parameter. If present, it can be either "category" or "model".
     * @param category An optional parameter. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
     * @param model An optional parameter. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
     * @returns A Promise that resolves to an array of Product objects.
     */
    getAvailableProducts(grouping: string | null, category: string | null, model: string | null): Promise<Product[]>{ 
        return new Promise((resolve,reject) => {
            try{
                let sql
                let suffix = ""
                let params
                if (grouping!=null){
                    if(grouping=="category") {
                            suffix = " AND category = ?"
                            params = category
                    }   else if(grouping=="model") {
                        sql = "SELECT model FROM products WHERE model = ?"
                            db.get(sql,[model],(err,model: string) => {
                                if(err) reject(err)
                                else if(model === undefined) {
                                    reject(new ProductNotFoundError);
                                    return;
                                }
                            })
                            suffix = " AND model = ?"
                            params = model
                        }
                }
                sql = `SELECT * FROM products WHERE quantity>0${suffix}`
                db.all<Product>(sql,[params], (err, rows) => {
                    if(err) reject(err)
                    else{
                        const products = rows.map((prod) => new Product(prod.sellingPrice, prod.model, prod.category, prod.arrivalDate, prod.details, prod.quantity))
                        resolve(products)
                    }
                })
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Deletes one product, identified by its model
     * @param model The model of the product to delete
     * @returns A Promise that resolves to `true` if the product has been successfully deleted.
     */
    deleteProduct(model: string):Promise <Boolean> { 
        return new Promise((resolve, reject) => {
            try{
                db.get("SELECT model FROM products WHERE model = ?",[model],(err, registeredModel: string) => {
                if (err) reject(err)
                else if (registeredModel === undefined) {
                    reject(new ProductNotFoundError);
                    return;
                }
                else {
                    db.run("DELETE FROM products WHERE model = ?",[model],function (err){
                        if(err) reject(err)
                        resolve(true)
                    })
                }
            })
            } catch (error){
                reject(error)
            }
        })
    }

    /**
     * Deletes all products.
     * @returns A Promise that resolves to `true` if all products have been successfully deleted.
     */
    async deleteAllProducts():Promise <Boolean>  { 
        return new Promise((resolve,reject) => {
            try{
                let sql = "DELETE FROM products"
                db.run(sql,[],function(err){
                    if(err) reject(err)
                    resolve(true)
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}



export default ProductDAO