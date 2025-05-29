const fastify = require("fastify")();

// Create or open a database file
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./users.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");

    // Create a table if it doesn't exist
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


const cors = require("@fastify/cors"); 
fastify.register(cors, {
  origin: "*", // Allow all addresses and ports for CORS
  methods: "*", // Allow all HTTP methods
  allowedHeaders: "*", // Allow all headers
});


fastify.register(require('./routes/route.js'), {db});

const PORT = 4000;

fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error(`Error starting server: ${err}`);
    process.exit(1);
  }
  console.log(`Server is running at ${address}`);
});
