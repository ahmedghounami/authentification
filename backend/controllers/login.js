const bcrypt = require("bcrypt");

function getUserByEmail(db, email) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function loginUserHandler(fastify, db) {
  return async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({ error: "Missing email or password" });
    }

    try {
      const user = await getUserByEmail(db, email);

      if (!user) {
        return reply.code(404).send({ error: "User not found" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return reply.code(401).send({ error: "Invalid email or password" });
      }

      // ✅ use fastify.jwt.sign
      console.log("User authenticated successfully, generating token...");
      const token = fastify.jwt.sign({ id: user.id, email: user.email }, {
        expiresIn: "1h", // Token expiration time
      });

      return reply.send({
        token,
        user: { id: user.id, email: user.email },
      });
    } catch (err) {
      console.error("Login error caught:", err);
      return reply.code(500).send({ error: "Internal server error" });
    }
  };
}

function dashboardHandler(fastify, db) {
  return async (request, reply) => {
    console.log("Dashboard handler called --------------------------");
    try {

      const user = await getUserByEmail(db, request.user.email);
      
      if (!user) {
        return reply.code(404).send({ error: "User not found" });
      }

      return reply.code(200).send({
        message: "Welcome to your dashboard!",
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
        },
      });
    } catch (err) {
      console.error("Dashboard error:", err);
      return reply.code(500).send({ error: "Server error" });
    }
  };
}

module.exports = {
  loginUserHandler,
  dashboardHandler,
};
