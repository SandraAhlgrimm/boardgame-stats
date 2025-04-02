const { getDbConnection } = require('./connect')

async function initializeDb() {
	const db = await getDbConnection()
	await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
	await db.exec(`CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    boardgamegeek_id INTEGER NOT NULL,
    notes TEXT
  )`)
}

module.exports = { initializeDb }
