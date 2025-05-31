const fastify = require("fastify")();
const bcrypt = require("bcrypt");

// Register JWT plugin with a secret
fastify.register(require("@fastify/jwt"), {
  secret: "supersecretkey",
});

// Decorate Fastify instance with an authenticate function
fastify.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: "Unauthorized" });
  }
});

// In-memory "database"
const users = [];

// Registration route
fastify.post("/register", async (request, reply) => {
  const { email, password, firstname, lastname } = request.body;

  if (!email || !password || !firstname || !lastname) {
    return reply.code(400).send({ error: "Missing fields" });
  }

  // Check if user exists
  if (users.find((u) => u.email === email)) {
    return reply.code(400).send({ error: "User already exists" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user
  users.push({ email, password: hashedPassword, firstname, lastname });

  return reply.code(201).send({ message: "User registered successfully" });
});

// Login route
fastify.post("/login", async (request, reply) => {
  const { email, password } = request.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return reply.code(401).send({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return reply.code(401).send({ error: "Invalid email or password" });
  }

  // Sign JWT token
  const token = fastify.jwt.sign({ email: user.email });

  return reply.send({ token });
});

// Protected dashboard route
fastify.get(
  "/dashboard",
  { preHandler: [fastify.authenticate] },
  async (request, reply) => {
    // request.user is decoded JWT payload
    const userEmail = request.user.email;
    const user = users.find((u) => u.email === userEmail);

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

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 4000 });
    fastify.log.info("Server running on http://localhost:4000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
