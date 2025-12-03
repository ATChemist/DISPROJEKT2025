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

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      shortDescription TEXT,
      start_time TEXT,
      duration TEXT,
      spots INTEGER,
      location TEXT,
      host_id INTEGER NOT NULL,
      category TEXT,
      thumbnail TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (host_id) REFERENCES hosts(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS event_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id)
    )
  `);

  // Migration: If the table exists and has a quoted "when" column, copy it into start_time (if start_time missing)
  db.all(`PRAGMA table_info(events)`, [], (err, rows) => {
    if (err) return console.error('Could not read events table info', err);
    const hasStart = rows.some((r) => r.name === 'start_time');
    const hasWhen = rows.some((r) => r.name === 'when');
    if (!hasStart && hasWhen) {
      console.log('Migrating events table: adding start_time and copying values from "when" column');
      db.run(`ALTER TABLE events ADD COLUMN start_time TEXT`, [], (err2) => {
        if (err2) return console.error('Could not add start_time column', err2);
        // Copy values from quoted "when" to start_time; quoted because when is reserved word
        db.run(`UPDATE events SET start_time = "when" WHERE start_time IS NULL`, [], (err3) => {
          if (err3) return console.error('Could not copy from "when" to start_time', err3);
          console.log('Migration complete: start_time filled');
        });
      });
    }
  });
});

module.exports = db;
