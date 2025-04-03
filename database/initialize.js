const { getDbConnection } = require('./connect')

async function initializeDb() {
	const db = await getDbConnection()
	await createTables(db)
	await createInitialRecords(db)
}

async function createTables(db) {
	await db.exec(`CREATE TABLE IF NOT EXISTS games (
    boardgamegeek_id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    notes TEXT
  )`)
}

async function createInitialRecords(db) {
	await db.run(`INSERT OR IGNORE INTO games (title, boardgamegeek_id, notes) VALUES 
  ('Android: Netrunner', 124742, 'Now out of print. 2 player asymmetrical card game. I have a lot of cards for this game and a sealed copy.'),
  ('CATAN', 13, NULL),
  ('Dominion', 36218, NULL),
  ('Kodama: The Tree Spirits', 181810, NULL),
  ('Pan Am', 303057, 'Got it for Nathaniel. Loved it so much I bought a copy for myself.'),
  ('Railroad Ink Challenge', 367513, '1-n player roll and write game'),
  ('Ticket to Ride: Berlin', 388036, '15 minute version of Ticket to Ride'),
  ('Tokaido', 123540, 'Weird as a 2-player.')`)
}

module.exports = { initializeDb }
