// src/models/eventQuestions.model.js
const db = require("../../db");

function listQuestionsByEvent(eventId, callback) {
  const sql = `
    SELECT
      id,
      event_id,
      author_name,
      content,
      is_host,
      host_reply,
      host_reply_at,
      host_reply_author,
      created_at
    FROM event_questions
    WHERE event_id = ?
    ORDER BY created_at ASC
  `;

  db.all(sql, [eventId], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
}

function createQuestion({ eventId, authorName, content, isHost }, callback) {
  const sql = `
    INSERT INTO event_questions (event_id, author_name, content, is_host)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [eventId, authorName, content, isHost ? 1 : 0], function (err) {
    if (err) return callback(err);
    getQuestionById(this.lastID, callback);
  });
}

function getQuestionById(id, callback) {
  const sql = `
    SELECT
      id,
      event_id,
      author_name,
      content,
      is_host,
      host_reply,
      host_reply_at,
      host_reply_author,
      created_at
    FROM event_questions
    WHERE id = ?
  `;

  db.get(sql, [id], (err, row) => {
    if (err) return callback(err);
    callback(null, row);
  });
}

function addHostReply({ questionId, replyText, hostReplyAuthor }, callback) {
  const sql = `
    UPDATE event_questions
    SET host_reply = ?, host_reply_at = CURRENT_TIMESTAMP, host_reply_author = ?
    WHERE id = ?
  `;

  db.run(sql, [replyText, hostReplyAuthor, questionId], function (err) {
    if (err) return callback(err);
    return getQuestionById(questionId, callback);
  });
}

module.exports = {
  listQuestionsByEvent,
  createQuestion,
  getQuestionById,
  addHostReply,
};