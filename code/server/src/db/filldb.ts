"use strict";

import db from "../db/db";

/**
 * Deletes all data from the database.
 * This function must be called before any integration test, to ensure a clean database state for each test run.
 */

export function fillCartandProduct() {
    db.serialize(() => {
        // Delete all data from the database
        db.run("DROP TABLE IF EXISTS products_in_cart");
        db.run("DROP TABLE IF EXISTS products");
        db.run("DROP TABLE IF EXISTS carts");
        

        // Create the products table
        db.run(`CREATE TABLE products (
            model TEXT PRIMARY KEY UNIQUE,
            category TEXT,
            quantity INTEGER,
            details TEXT,
            sellingPrice REAL,
            arrivalDate TEXT
        )`);

        // Create the carts table with an additional cartId column
        db.run(`CREATE TABLE carts (
            customer TEXT,
            paid BOOLEAN,
            paymentDate TEXT,
            total REAL,
            cartId INTEGER PRIMARY KEY AUTOINCREMENT
        )`);

        // Create the products_in_cart table with a foreign key to the virtual cartId column
        db.run(`CREATE TABLE products_in_cart (
            cartId TEXT,
            model TEXT,
            quantity INTEGER,
            category TEXT,
            price REAL,
            PRIMARY KEY (cartId, model),
            FOREIGN KEY (model) REFERENCES products (model),
            FOREIGN KEY (cartId) REFERENCES carts (cartId)
        )`);

        // Insert sample data into products table
        db.run(`INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES 
            ('ModelX', 'Electronics', 5, 'Latest model of X', 199.99, '2023-05-01'),
            ('ModelY', 'Electronics', 150, 'Affordable model Y', 99.99, '2023-04-15'),
            ('ModelZ', 'Electronics', 75, 'Mid-range model Z', 149.99, '2023-06-10')`);

        
    });
}

// Call the function to create and populate the tables
