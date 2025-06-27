const fastify = require("fastify")();

fastify.register(require('@fastify/oauth2'), {
  name: 'googleOAuth2',
  scope: ['profile', 'email'],
  credentials: {
    client: {
      id: "732616728355-8ougcur6oa8iuc4oe0017d77jg56pem3.apps.googleusercontent.com",
      secret: "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",
    },
    auth: require('@fastify/oauth2').GOOGLE_CONFIGURATION
  },
  startRedirectPath: '/login/google',
  callbackUri: 'http://localhost:4000/login/google/callback'
});



const sqlite3 = require("sqlite3").verbose();
const cors = require("@fastify/cors");

// Register plugins
fastify.register(cors, {
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization, Access-Control-Allow-Origin"],
  credentials: true,
});
// JWT Auth decorator

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

fastify.register(require("@fastify/jwt"), {
  secret: "supersecret",
});

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

const PORT = 4000;
fastify.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
  console.log(`🚀 Server running at ${address}`);
});
