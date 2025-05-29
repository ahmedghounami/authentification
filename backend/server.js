const sqlite3 = require("sqlite3").verbose();

// Create or open a database file
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");

    // Create a table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        password TEXT NOT NULL
      )
    `);
  }
});

const fastify = require("fastify")();

const cors = require("@fastify/cors");

fastify.register(cors, {
  origin: "*", // Allow all addresses and ports for CORS
  methods: "*", // Allow all HTTP methods
  allowedHeaders: "*", // Allow all headers
});

const PORT = 4000;

// -------------------------------

fastify.post("/", (request, reply) => {
	
  const { email, password } = request.body;
  db.run(
    `INSERT INTO users (email, password) VALUES (?, ?)`,
    [email, password],
    function (err) {
      if (err) {
        console.log(err.message);
        reply.code(500).send({ error: "Database error" });
      } else {
        console.log(`User added with ID: ${this.lastID}`);
        reply.send({ message: "User created", id: this.lastID });
      }
    }
  );
});


fastify.get("/", (request, reply) => {
  db.all(`SELECT * FROM users`, [], (err, rows) => {
    if (err) {
      console.error("Error fetching users:", err.message);
      reply.code(500).send({ error: "Database error" });
    } else {
      console.log("Fetched users:", rows);
      reply.send({ users: rows });
    }
  });
});


fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error(`Error starting server: ${err}`);
    process.exit(1);
  }
  console.log(`Server is running at ${address}`);
});
