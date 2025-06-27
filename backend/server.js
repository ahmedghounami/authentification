const fastify = require("fastify")();
const routes = require("./routes/route");
require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const cors = require("@fastify/cors");

// Register CORS
fastify.register(cors, {
  origin: "*",
  methods: "*",
  allowedHeaders: "*",
});

// SQLite DB setup
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) {
    console.error("Database error:", err.message);
  } else {
    db.run(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL
      )
      `,
      (err) => {
        if (err) {
          console.error("Error creating users table:", err.message);
        } else {
          console.log("Users table created or already exists.");
        }
      }
    );
  }
});

// Register JWT
fastify.register(require("@fastify/jwt"), {
  secret: process.env.JWT_SECRET || "supersecret", // Use environment variable or fallback
});

// JWT Auth decorator
fastify.decorate("authenticate", async function (request, reply) {
  try {
    console.log("Authenticating user...");
    await request.jwtVerify();
    console.log("Authentication successful");
  } catch (err) {
    console.log("Authentication failed:", err);
    reply.code(401).send({ error: "Invalid or missing token" });
  }
});

// Register routes
fastify.register(require("./routes/route.js"), { db });

// Dashboard route
fastify.get(
  "/dashboard",
  { preHandler: [fastify.authenticate] },
  async (request, reply) => {
    const userEmail = request.user.email;

    const user = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE email = ?`, [userEmail], (err, row) => {
        if (err) {
          console.error("Database error:", err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    if (!user) {
      return reply.code(404).send({ error: "User not found" });
    }

    return reply.send({
      message: `Welcome to your dashboard, ${user.firstname}!`,
      user: {
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      },
    });
  }
);

// Start the server
const PORT = 4000;
fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
  console.log(`🚀 Server running at ${address}`);
});