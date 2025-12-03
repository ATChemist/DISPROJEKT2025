// src/models/events.model.js - DB backed events model
const db = require("../../db");

function getAllEvents(callback) {
  const sql = `
    SELECT
      e.*,
      h.email as host_email,
      (SELECT COUNT(*) FROM event_signups s WHERE s.event_id = e.id) AS signup_count
    FROM events e
    LEFT JOIN hosts h ON e.host_id = h.id
    ORDER BY e.id DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
}

function getEventById(id, callback) {
  const sql = `
    SELECT
      e.*,
      h.email as host_email,
      (SELECT COUNT(*) FROM event_signups s WHERE s.event_id = e.id) AS signup_count
    FROM events e
    LEFT JOIN hosts h ON e.host_id = h.id
    WHERE e.id = ?
  `;
  db.get(sql, [id], (err, row) => {
    if (err) return callback(err);
    callback(null, row);
  });
}

function getEventsByHost(hostId, callback) {
  const sql = `
    SELECT
      e.*,
      h.email as host_email,
      (SELECT COUNT(*) FROM event_signups s WHERE s.event_id = e.id) AS signup_count
    FROM events e
    LEFT JOIN hosts h ON e.host_id = h.id
    WHERE e.host_id = ?
    ORDER BY e.id DESC
  `;
  db.all(sql, [hostId], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
}

function createEvent(event, callback) {
  const sqlStart = `INSERT INTO events (title, shortDescription, start_time, duration, spots, location, host_id, category, thumbnail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const sqlWhen = `INSERT INTO events (title, shortDescription, "when", duration, spots, location, host_id, category, thumbnail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    event.title,
    event.shortDescription || event.description || null,
    event.when || null,
    event.duration || null,
    event.spots || null,
    event.location || null,
    event.host_id,
    event.category || null,
    event.thumbnail || null,
  ];

  db.run(sqlStart, params, function (err) {
    if (err) {
      const msg = err && err.message ? err.message : '';
      if (err && err.code === 'SQLITE_CONSTRAINT' && msg.includes('events.when')) {
        db.run(sqlWhen, params, function (err2) {
          if (err2) return callback(err2);
          const newId = this.lastID;
          return getEventById(newId, callback);
        });
      } else {
        return callback(err);
      }
    } else {
      const newId = this.lastID;
      // return the created event
      getEventById(newId, callback);
    }
  });
}

function deleteEvent(id, callback) {
  const sql = `DELETE FROM events WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) return callback(err);
    callback(null, { deleted: this.changes });
  });
}

module.exports = {
  getAllEvents,
  getEventById,
  getEventsByHost,
  createEvent,
  deleteEvent,
};
