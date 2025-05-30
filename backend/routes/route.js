const bcrypt = require("bcrypt");

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

async function getPasswordHash(password) {
  const saltRounds = 10;
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Password hashing failed");
  }
}

function getUserByEmailAndPassword(db, email) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function createuser(db, body) {
  const { email, password, firstname, username, lastname } = body;
  const hashingpassword = await getPasswordHash(password);
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) return reject(err);

      if (row) {
        return reject(new Error("User already exists"));
      }
      db.run(
        `INSERT INTO users (email, password, firstname, username, lastname) VALUES (?, ?, ?, ?, ?)`,
        [email, hashingpassword, firstname, username, lastname],
        function (err) {
          if (err) {
            reject(err);
          } else {
            console.log("User created");
            resolve({ id: this.lastID, email, firstname, username, lastname });
          }
        }
      );
    });
  });
}

function postUserHandler(db) {
  return async (request, reply) => {
    const { email, password, firstname, username, lastname } = request.body;

    if (!email || !password || !firstname || !username || !lastname) {
      return reply.code(400).send({ error: "Bad request: Missing fields" });
    }
    try {
      const user = await createuser(db, request.body);
      return reply.code(201).send({ message: "User created", user });
    } catch (err) {
      if (err.message === "User already exists") {
        return reply.code(409).send({ error: err.message });
      }
      console.error(err.message);
      return reply.code(500).send({ error: "Database error" });
    }
  };
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
