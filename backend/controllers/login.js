const bcrypt = require("bcrypt");

function getUserByEmailAndPassword(db, email) {
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
      const user = await getUserByEmailAndPassword(db, email);

      if (!user) {
        return reply.code(404).send({ error: "User not found" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return reply.code(401).send({ error: "Invalid email or password" });
      }

      // ✅ use fastify.jwt.sign
      const token = fastify.jwt.sign({ id: user.id, email: user.email });

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
    try {
      const decoded = await request.jwtVerify(); // still valid here

      const user = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE id = ?", [decoded.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!user) {
        return reply.code(404).send({ error: "User not found" });
      }

      return reply.send({ user });
    } catch (err) {
      return reply.code(401).send({ error: "Invalid token" });
    }
  };
}

module.exports = {
  loginUserHandler,
  dashboardHandler,
};
