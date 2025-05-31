const fastify = require("fastify")();
const sqlite3 = require("sqlite3").verbose();
const cors = require("@fastify/cors");
const jwt = require("@fastify/jwt");

// Register plugins
fastify.register(cors, {
  origin: "*",
  methods: "*",
  allowedHeaders: "*",
});

fastify.register(jwt, {
  secret: "supersecret", // 🔐 Change to .env in production
});

// JWT Auth decorator
fastify.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: "Unauthorized" });
  }
});

// SQLite DB setup
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) console.error("Database error:", err.message);
  else {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL
      )
    `);
  }
});

// Register routes
fastify.register(require("./routes/route.js"), { db });

const PORT = 4000;
fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
  console.log(`🚀 Server running at ${address}`);
});
