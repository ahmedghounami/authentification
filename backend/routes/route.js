const bcrypt = require("bcrypt");
const { postUserHandler } = require("../controllers/registration")
const registration = {
  schema: {
    body: {
      type: "object",
      required: ["email", "password", "firstname", "username", "lastname"],
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 6 },
        firstname: { type: "string" },
        username: { type: "string" },
        lastname: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string" },
          password: { type: "string" },
          firstname: { type: "string" },
          username: { type: "string" },
          lastname: { type: "string" },
        },
      },
    },
  },
};

const login = {
  schema: {
    body: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 6 },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string" },
          password: { type: "string" },
        },
      },
    },
  },
};



function getUserByEmailAndPassword(db, email) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}


function loginUserHandler(db) {
  return async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({ error: "bad request" });
    }

    try {
      const user = await getUserByEmailAndPassword(db, email);
      if (!user) {
        return reply.code(404).send({ error: "User not found" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return reply
          .code(404)
          .send({ error: "Email or password is incorrect" });
      }

      console.log("Login successful");
      return reply.code(201).send({ message: "login successfully", user });
    } catch (err) {
      console.error(err.message);
      return reply.code(500).send({ error: "Database error" });
    }
  };
}

function userRoutes(fastify, options, done) {
  const db = options.db;

  fastify.post("/registration", {
    ...registration,
    handler: postUserHandler(db),
  });
  fastify.post("/login", { ...login, handler: loginUserHandler(db) });

  fastify.get("/", (request, reply) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
      if (err) {
        console.error("Error fetching users:", err.message);
        reply.code(500).send({ error: "Database error" });
      } else {
        reply.send({ users: rows });
      }
    });
  });

  done();
}

module.exports = userRoutes;

/*
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  firstname TEXT,
  username TEXT,
  lastname TEXT
);
.quit

*/
