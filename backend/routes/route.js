const { postUserHandler } = require("../controllers/registration");
const { loginUserHandler, dashboardHandler } = require("../controllers/login");
const oauth2Client = require("../plugins/googleOAuth");
const jwt = require("jsonwebtoken");

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
  // ---------------------------
  const callback = async (req, reply) => {
    try {
      const { code } = req.query;
  
      if (!code) {
        return reply.status(400).send({ error: "Authorization code is missing" });
      }
  
      // Exchange the authorization code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
  
      // Generate a JWT token (replace with your logic)
      const jwtToken = jwt.sign({ user: tokens }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
  
      // Redirect to the frontend with the token
      reply.redirect(`http://localhost:3000?token=${jwtToken}`);
    } catch (error) {
      console.error("---------Error in Google OAuth callback:", error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  };
  
  // Ensure the route is defined
  fastify.get("/login/google/callback", callback);
// ---------------------------
  
  
  fastify.post("/registration", {
    ...registrationSchema,
    handler: postUserHandler(db),
  });

  fastify.post("/login", {
    ...loginSchema,
    handler: loginUserHandler(fastify, db),
  });

  fastify.get("/", async (request, reply) => {
    const users = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
          console.error("Database error:", err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    }
    );
    return reply.send(users);
  }
  );

  done();
}

module.exports = userRoutes;


// DROP TABLE IF EXISTS users;
