import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from "@jest/globals";
import request from 'supertest';
import { app } from "../index";
import db from "../src/db/db"; 
import { cleanup } from "../src/db/cleanup";

// Constants for testing
const baseURL = "/ezelectronics";

const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" };
const customer2 = { username: "customer2", name: "customer2", surname: "customer2", password: "customer2", role: "Customer" };
const product = { model: "model1", category: "Laptop", quantity: 10, details: "Test product", sellingPrice: 100.00 };
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" };
const manager = { username: "manager", name: "manager", surname: "manager", password: "manager", role: "Manager" };
const review = { score: 4, comment: "Great product!" };
const review2 = { score: 5, comment: "Excellent product!" };
const nonExistentProduct = "model2";

let customerCookie: string;
let customer2Cookie: string;
let adminCookie: string;
let managerCookie: string;

// Helper function to post a user
const postUser = async (userInfo: any) => {
  await request(app)
      .post(`${baseURL}/users`)
      .send(userInfo)
      .expect(200);
};

// Helper function to post a product
const postProduct = async (productInfo: any, cookie: string) => {
  await request(app)
    .post(`${baseURL}/products`)
    .set("Cookie", cookie)
    .send(productInfo)
    .expect(200);
};

// Helper function to log in and get a cookie
const login = async (userInfo: any): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    request(app)
      .post(`${baseURL}/sessions`)
      .send(userInfo)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return reject(err);
        }
        const cookies = res.header["set-cookie"];
        if (!cookies || cookies.length === 0) {
          return reject(new Error("No 'set-cookie' header in response"));
        }
        resolve(cookies[0]);
      });
  });
};

describe("Review Integration Tests", () => {
  beforeAll((done) => {
    // Create necessary tables if they don't exist
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY UNIQUE,
        name TEXT,
        surname TEXT,
        role TEXT,
        password TEXT,
        salt TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS products (
        model TEXT PRIMARY KEY UNIQUE,
        category TEXT,
        quantity INTEGER,
        details TEXT,
        sellingPrice REAL,
        arrivalDate TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS reviews (
        model TEXT,
        username TEXT,
        score INTEGER,
        comment TEXT,
        date TEXT,
        PRIMARY KEY (model, username)
      )`, done);
    });
  });

  beforeEach(async () => {
    // Clean up the tables before each test
    await new Promise<void>((resolve, reject) => {
      db.serialize(() => {
        db.run("DELETE FROM reviews");
        db.run("DELETE FROM products");
        db.run("DELETE FROM users", (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    });

    // Add users and log them in
    await postUser(customer);
    await postUser(admin);
    await postUser(manager);
    await postUser(customer2);

    customerCookie = await login(customer);
    adminCookie = await login(admin);
    managerCookie = await login(manager);
    customer2Cookie = await login(customer2);

    // Add product using manager credentials
    await postProduct(product, managerCookie);
  });

  afterEach((done) => {
    // Clean up the tables after each test
    db.serialize(() => {
      db.run("DELETE FROM reviews");
      db.run("DELETE FROM products");
      db.run("DELETE FROM users", done);
    });
  });

  afterAll(async () => {
    
    await cleanup();
  });

  test("should add a review to a product", async () => {
    const response = await request(app)
      .post(`${baseURL}/reviews/${product.model}`)
      .set("Cookie", customerCookie)
      .send({
        score: 4,
        comment: "Great product!",
      });   
    expect(response.status).toBe(200);
  });
  test("should return 409 for duplicate review", async () => {
    await request(app)
      .post(`${baseURL}/reviews/${product.model}`)
      .set("Cookie", customerCookie)
      .send({
        score: review.score,
        comment: review.comment,
      });
    const response = await request(app)
      .post(`${baseURL}/reviews/${product.model}`)
      .set("Cookie", customerCookie)
      .send({
        score: review.score,
        comment: review.comment,
      });
    expect(response.status).toBe(409);
  });
  test("should return 401 for unauthorized access (admin trying to add review)", async () => {
    const response = await request(app)
      .post(`${baseURL}/reviews/${product.model}`)
      .set("Cookie", adminCookie)
      .send({
        score: review.score,
        comment: review.comment,
      });
    expect(response.status).toBe(401);
  });
  test("should return 404 for non-existent product", async () => {
    const response = await request(app)
      .post(`${baseURL}/reviews/${nonExistentProduct}`)
      .set("Cookie", customerCookie)
      .send({
        score: review.score,
        comment: review.comment,
      });
    expect(response.status).toBe(404);
  });
  test("should return 401 for unauthorized access (manager trying to add review)", async () => {
    const response = await request(app)
      .post(`${baseURL}/reviews/${product.model}`)
      .set("Cookie", managerCookie)
      .send({
        score: review.score,
        comment: review.comment,
      });
    expect(response.status).toBe(401);
  });
  test("should return 422 for invalid score", async () => {
    const response = await request(app)
      .post(`${baseURL}/reviews/${product.model}`)
      .set("Cookie", customerCookie)
      .send({
        score: 6, 
        comment: "Score is too high",
      });
    expect(response.status).toBe(422);
  });
  test("should return 422 for empty comment", async () => {
    const response = await request(app)
      .post(`${baseURL}/reviews/${product.model}`)
      .set("Cookie", customerCookie)
      .send({
        score: review.score,
        comment: "",
      });
    expect(response.status).toBe(422);
  });
  test("should return 422 for missing score", async () => {
    const response = await request(app)
      .post(`${baseURL}/reviews/${product.model}`)
      .set("Cookie", customerCookie)
      .send({
        comment: review.comment, 
      });
    expect(response.status).toBe(422);
  });
  test("should return 422 for missing comment", async () => {
    const response = await request(app)
      .post(`${baseURL}/reviews/${product.model}`)
      .set("Cookie", customerCookie)
      .send({
        score: review.score, 
      });
    expect(response.status).toBe(422);
  });
  test("should return all reviews for a product", async () => {
    
    await Promise.all([
        new Promise<void>((resolve, reject) => {
            const sql1 = `INSERT INTO reviews (model, username, score, comment, date) VALUES (?, ?, ?, ?, ?)`;
            db.run(sql1, [product.model, customer.username, review.score, review.comment, new Date().toISOString().split('T')[0]], (err) => {
                if (err) return reject(err);
                resolve();
            });
        }),
        new Promise<void>((resolve, reject) => {
            const sql2 = `INSERT INTO reviews (model, username, score, comment, date) VALUES (?, ?, ?, ?, ?)`;
            db.run(sql2, [product.model, customer2.username, review2.score, review2.comment, new Date().toISOString().split('T')[0]], (err) => {
                if (err) return reject(err);
                resolve();
            });
        })
    ]);

    
    const response = await request(app)
        .get(`${baseURL}/reviews/${product.model}`)
        .set("Cookie", customerCookie)
        .expect(200);

    
    expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({
            model: product.model,
            user: customer.username, 
            score: review.score,
            comment: review.comment,
            date: expect.any(String),
        }),
        expect.objectContaining({
            model: product.model,
            user: customer2.username, 
            score: review2.score,
            comment: review2.comment,
            date: expect.any(String),
        })
    ]));
});

test("should return 404 for non-existent product", async () => {
  const response = await request(app)
    .get(`${baseURL}/reviews/nonexistent`)
    .set("Cookie", customerCookie); 

  // Expect the status to be 404 Not Found
  expect(response.status).toBe(404);

  // Check the response body to match the expected error format
  expect(response.body).toEqual({
      error: "Product not found",
      status: 404  // Add the expected status property based on the actual response
  });
});
  test("should return 401 for unauthenticated access", async () => {
    const response = await request(app)
      .get(`${baseURL}/reviews/${product.model}`); 
  
    expect(response.status).toBe(401);
  });
  test("should delete the review made by the current user", async () => {
    
    await new Promise<void>((resolve, reject) => {
      const sql1 = `INSERT INTO reviews (model, username, score, comment, date) VALUES (?, ?, ?, ?, ?)`;
      db.run(sql1, [product.model, customer.username, review.score, review.comment, new Date().toISOString().split('T')[0]], (err) => {
          if (err) return reject(err);
          resolve();
      });
    });
    const response = await request(app)
      .delete(`${baseURL}/reviews/${product.model}`)
      .set("Cookie", customerCookie)
      .expect(200);

    
    const reviewsInDb = await new Promise<any[]>((resolve, reject) => {
      db.all(`SELECT * FROM reviews WHERE model = ? AND username = ?`, [product.model, customer.username], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    expect(reviewsInDb).toEqual([]);
  });
  test("should return 404 if the review to delete does not exist", async () => {
    
    const response = await request(app)
      .delete(`${baseURL}/reviews/${product.model}`)
      .set("Cookie", customer2Cookie) 
      .expect(404);

    
    expect(response.status).toBe(404);
  });
  test("should return 404 if trying to delete a review for a non-existent product", async () => {
    const nonExistentProduct = "nonexistentmodel"; 
    const response = await request(app)
      .delete(`${baseURL}/reviews/${nonExistentProduct}`)
      .set("Cookie", customerCookie) 
      .expect(404);
  
    expect(response.body.error).toBe("Product not found");
  
    const reviewsInDb = await new Promise<any[]>((resolve, reject) => {
      db.all(`SELECT * FROM reviews WHERE model = ?`, [nonExistentProduct], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  
    expect(reviewsInDb).toEqual([]); 
  });
  test("should return 401 for unauthorized access when attempting to delete a review", async () => {
    const response = await request(app)
      .delete(`${baseURL}/reviews/${product.model}`)
      .expect(401);
    expect(response.status).toBe(401);
  });
  test("should delete all reviews for a specific product by Admin", async () => {
    await new Promise<void>((resolve, reject) => {
      const sql1 = `INSERT INTO reviews (model, username, score, comment, date) VALUES (?, ?, ?, ?, ?)`;
      db.run(sql1, [product.model, customer.username, review.score, review.comment, new Date().toISOString().split('T')[0]], (err) => {
          if (err) return reject(err);
          resolve();
      });
    });
    
    const response = await request(app)
      .delete(`${baseURL}/reviews/${product.model}/all`)
      .set("Cookie", adminCookie)
      .expect(200);
    
    const reviewsInDb = await new Promise<any[]>((resolve, reject) => {
      db.all(`SELECT * FROM reviews WHERE model = ?`, [product.model], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    expect(reviewsInDb).toEqual([]);
  });
  test("should delete all reviews for a specific product by Manager", async () => {
    await new Promise<void>((resolve, reject) => {
      const sql1 = `INSERT INTO reviews (model, username, score, comment, date) VALUES (?, ?, ?, ?, ?)`;
      db.run(sql1, [product.model, customer.username, review.score, review.comment, new Date().toISOString().split('T')[0]], (err) => {
          if (err) return reject(err);
          resolve();
      });
    });
    
    const response = await request(app)
      .delete(`${baseURL}/reviews/${product.model}/all`)
      .set("Cookie", managerCookie)
      .expect(200);
    
    const reviewsInDb = await new Promise<any[]>((resolve, reject) => {
      db.all(`SELECT * FROM reviews WHERE model = ?`, [product.model], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    expect(reviewsInDb).toEqual([]);
  });
  test("should return 404 if trying to delete reviews for a non-existent product", async () => {
    const nonExistentProduct = "nonexistentmodel"; 

    
    const response = await request(app)
      .delete(`${baseURL}/reviews/${nonExistentProduct}/all`)
      .set("Cookie", adminCookie) 
      .expect(404);

    
    expect(response.body.error).toBe("Product not found");

    
    const reviewsInDb = await new Promise<any[]>((resolve, reject) => {
      db.all(`SELECT * FROM reviews WHERE model = ?`, [nonExistentProduct], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    expect(reviewsInDb).toEqual([]); 
  });
  test("should return 401 for unauthorized access by a Customer", async () => {
    
    await new Promise<void>((resolve, reject) => {
      const sql1 = `INSERT INTO reviews (model, username, score, comment, date) VALUES (?, ?, ?, ?, ?)`;
      db.run(sql1, [product.model, customer.username, review.score, review.comment, new Date().toISOString().split('T')[0]], (err) => {
          if (err) return reject(err);
          resolve();
      });
    });
    const response = await request(app)
      .delete(`${baseURL}/reviews/${product.model}/all`)
      .set("Cookie", customerCookie)
      .expect(401);

    
    expect(response.body.error).toBe("User is not an admin or manager");

    
    const reviewsInDb = await new Promise<any[]>((resolve, reject) => {
      db.all(`SELECT * FROM reviews WHERE model = ?`, [product.model], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    expect(reviewsInDb.length).toBeGreaterThan(0); 
  });
  test("should delete all reviews by an Admin", async () => {
    await new Promise<void>((resolve, reject) => {
      const sql1 = `INSERT INTO reviews (model, username, score, comment, date) VALUES (?, ?, ?, ?, ?)`;
      db.run(sql1, [product.model, customer.username, review.score, review.comment, new Date().toISOString().split('T')[0]], (err) => {
          if (err) return reject(err);
          resolve();
      });
    });
    
    const response = await request(app)
      .delete(`${baseURL}/reviews`)
      .set("Cookie", adminCookie)
      .expect(200);

    
    const reviewsInDb = await new Promise<any[]>((resolve, reject) => {
      db.all(`SELECT * FROM reviews`, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    expect(reviewsInDb).toEqual([]); 
  });
  test("should delete all reviews by an Manager", async () => {
    await new Promise<void>((resolve, reject) => {
      const sql1 = `INSERT INTO reviews (model, username, score, comment, date) VALUES (?, ?, ?, ?, ?)`;
      db.run(sql1, [product.model, customer.username, review.score, review.comment, new Date().toISOString().split('T')[0]], (err) => {
          if (err) return reject(err);
          resolve();
      });
    });
    
    const response = await request(app)
      .delete(`${baseURL}/reviews`)
      .set("Cookie", managerCookie)
      .expect(200);

    
    const reviewsInDb = await new Promise<any[]>((resolve, reject) => {
      db.all(`SELECT * FROM reviews`, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    expect(reviewsInDb).toEqual([]); 
  });
  test("should return 401 for unauthorized access by a Customer", async () => {
    await new Promise<void>((resolve, reject) => {
      const sql1 = `INSERT INTO reviews (model, username, score, comment, date) VALUES (?, ?, ?, ?, ?)`;
      db.run(sql1, [product.model, customer.username, review.score, review.comment, new Date().toISOString().split('T')[0]], (err) => {
          if (err) return reject(err);
          resolve();
      });
    });
    
    const response = await request(app)
      .delete(`${baseURL}/reviews`)
      .set("Cookie", customerCookie)
      .expect(401);

    
    expect(response.body.error).toBe("User is not an admin or manager");

    
    const reviewsInDb = await new Promise<any[]>((resolve, reject) => {
      db.all(`SELECT * FROM reviews`, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    expect(reviewsInDb.length).toBeGreaterThan(0); 
  });
});




