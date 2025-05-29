const portuserOpts = {
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

function postUserHandler(db) {
  return (request, reply) => {
    const { email, password, firstname, username, lastname } = request.body;


    if (!email || !password || !firstname || !username || !lastname) {
      reply.code(400).send({ error: "bad request" });
    }
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (row) {
        reply.code(409).send({ error: "Email already registered" });
      } else {
        db.run(
          `INSERT INTO users (email, password, firstname, username, lastname) VALUES (?, ?, ?, ?, ?)`,
          [email, password, firstname, username, lastname],
          function (err) {
            if (err) {
              console.log(err.message);
              reply.code(500).send({ error: "Database error" });
            } else {
              reply.send({ message: "User created", id: this.lastID });
            }
          }
        );
      }
    });
  };
}

function userRoutes(fastify, options, done) {
  const db = options.db;

  fastify.post("/", { ...portuserOpts, handler: postUserHandler(db) });

  // fastify.get("/", (request, reply) => {
  //   db.all(`SELECT * FROM users`, [], (err, rows) => {
  //     if (err) {
  //       console.error("Error fetching users:", err.message);
  //       reply.code(500).send({ error: "Database error" });
  //     } else {
  //       console.log("Fetched users:", rows);
  //       reply.send({ users: rows });
  //     }
  //   });
  // });

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
