const bcrypt = require("bcrypt");

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

async function createuser(db, body) {
  const { email, password, firstname, username, lastname } = body;
  const hashingpassword = await getPasswordHash(password);
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ? OR username = ?", [email, username], (err, row) => {
      if (err) return reject(err);

      if (row) {
        console.log("User already exists");
        return reject(new Error("User already exists"));
      }
      db.run(
        `INSERT INTO users (email, password, firstname, username, lastname) VALUES (?, ?, ?, ?, ?)`,
        [email, hashingpassword, firstname, username, lastname],
        function (err) {
          if (err) {
            reject(err);
          } else {
            console.log("User created successfully");
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

module.exports = {
  postUserHandler,
};
