const { postUserHandler } = require("../controllers/registration");
const { loginUserHandler, dashboardHandler } = require("../controllers/login");

const registrationSchema = {
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
  },
};

const loginSchema = {
  schema: {
    body: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 6 },
      },
    },
  },
};

function userRoutes(fastify, options, done) {
  const db = options.db;

  fastify.post("/registration", {
    ...registrationSchema,
    handler: postUserHandler(db),
  });

  fastify.post("/login", {
    ...loginSchema,
    handler: loginUserHandler(fastify, db),
  });

  fastify.get("/", async (request, reply) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
      if (err) {
        reply.code(500).send({ error: "Database error" });
      } else {
        reply.send({ users: rows });
      }
    });
  });

  // fastify.get("/dashboard", {
  //   preValidation: [fastify.authenticate],
  //   handler: dashboardHandler(db),
  // });

  done();
}

module.exports = userRoutes;


// DROP TABLE IF EXISTS users;
