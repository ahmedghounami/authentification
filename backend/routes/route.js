const { postUserHandler } = require("../controllers/registration");
const { loginUserHandler, dashboardHandler } = require("../controllers/login");
const { hash } = require("bcrypt");

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
  fastify.get("/login/google/callback", async (req, reply) => {
    try {
      console.log("Google OAuth callback received");
      const token = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
      console.log("Google OAuth token:", token.access_token);
      if (!token && token.access_token === undefined) return reply.code(400).send({ error: "Invalid token" });

      const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${token.token.access_token}`,
        },
      }).then(res => res.json());
      console.log("User info from Google:", userInfo);
      if (!userInfo || !userInfo.email) {
        return reply.code(400).send({ error: "Failed to retrieve user info" });
      }
      const { email, given_name: firstname, family_name: lastname } = userInfo;
      const hashedPassword = await hash("google-oauth", 10); // Use a fixed password for OAuth users
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) return reply.code(500).send({ error: "DB error" });
  
        if (!row) {
          db.run(
            `INSERT INTO users (firstname, lastname, username, email, password)
             VALUES (?, ?, ?, ?, ?)`,
            [firstname, lastname, firstname.toLowerCase(), email, hashedPassword])
        }
      });
  
      const jwtToken = fastify.jwt.sign({ email });
      reply.redirect(`http://localhost:3000/google-redirect?token=${jwtToken}`);
    } catch (err) {
      console.error(err);
      reply.code(500).send({ error: "OAuth failed" });
    }
  });
  
  
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
    if (!request.headers.authorization) {
      return reply.code(401).send({ error: "Missing authorization header" });
    }
    try {
      await request.jwtVerify();
    } catch (err) {
      console.error("JWT verification failed:", err);
      return reply.code(401).send({ error: "Invalid token" });
    }
    console.log("JWT verification successful");
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
