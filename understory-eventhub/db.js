// db.js
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "mydb.sqlite");
const db = new sqlite3.Database(dbPath);

// Kør kun én gang – opretter tabel hvis den ikke findes
// Opretter hosts tabel (bruges til at gemme hosts/accounts)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS hosts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);
});

module.exports = db;
