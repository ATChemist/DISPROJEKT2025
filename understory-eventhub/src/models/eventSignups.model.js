const db = require("../../db");

function createEventSignup({ eventId, name, phone }, callback) {
  const sql = `INSERT INTO event_signups (event_id, name, phone) VALUES (?, ?, ?)`;
  db.run(sql, [eventId, name, phone], function (err) {
    if (err) return callback(err);
    const newId = this.lastID;
    db.get(
      `SELECT id, event_id, name, phone, created_at FROM event_signups WHERE id = ?`,
      [newId],
      (err2, row) => {
        if (err2) return callback(err2);
        callback(null, row);
      }
    );
  });
}

function getSignupsByEvent(eventId, callback) {
  const sql = `SELECT id, event_id, name, phone, created_at FROM event_signups WHERE event_id = ? ORDER BY created_at DESC`;
  db.all(sql, [eventId], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
}

function countSignupsForEvent(eventId, callback) {
  const sql = `SELECT COUNT(*) as count FROM event_signups WHERE event_id = ?`;
  db.get(sql, [eventId], (err, row) => {
    if (err) return callback(err);
    callback(null, row?.count || 0);
  });
}

function deleteSignupsForEvent(eventId, callback) {
  const sql = `DELETE FROM event_signups WHERE event_id = ?`;
  db.run(sql, [eventId], function (err) {
    if (err) return callback(err);
    callback(null, { deleted: this.changes });
  });
}

module.exports = {
  createEventSignup,
  getSignupsByEvent,
  countSignupsForEvent,
  deleteSignupsForEvent,
};
