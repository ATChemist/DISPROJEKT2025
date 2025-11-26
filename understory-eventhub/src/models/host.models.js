// src/models/hosts.models.js
const db = require("../../db");

function findHostByEmail(email, callback) {
  db.get(
    "SELECT * FROM hosts WHERE email = ?",
    [email],
    (err, row) => {
      callback(err, row);
    }
  );
}

function createHost(email, passwordHash, callback) {
  db.run(
    "INSERT INTO hosts (email, password_hash) VALUES (?, ?)",
    [email, passwordHash],
    function (err) {
      // this.lastID er id’et på den nye række
      callback(err, this?.lastID);
    }
  );
}

module.exports = {
  findHostByEmail,
  createHost,
};
