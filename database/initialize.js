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
	await db.exec(`CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL
  )`)
	await db.exec(`CREATE TABLE IF NOT EXISTS plays (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    game_id INTEGER NOT NULL,
    notes TEXT,
    FOREIGN KEY (game_id) REFERENCES games (boardgamegeek_id)
  )`)
	await db.exec(`CREATE TABLE IF NOT EXISTS play_players (
    play_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    PRIMARY KEY (play_id, player_id),
    FOREIGN KEY (play_id) REFERENCES plays (id),
    FOREIGN KEY (player_id) REFERENCES players (id)
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

	const playersCount = await db.get(`SELECT COUNT(*) as count FROM players`)
	if (playersCount.count === 0) {
		await db.run(`INSERT OR IGNORE INTO players (name) VALUES 
      ('Kevin Lewis'),
      ('Floor Drees'),
      ('Nathaniel Okenwa'),
      ('Jose Lewis'),
      ('Myrsini Koukiasa'),
      ('Tystan Williams'),
      ('Tobias Beckmann')`)
	}

	const playsCount = await db.get(`SELECT COUNT(*) as count FROM plays`)
	if (playsCount.count === 0) {
		await db.run(`INSERT OR IGNORE INTO plays (game_id, notes) VALUES 
      (124742, 'Kevin played a custom deck as the corp. Game via Jinteki.net.'),
      (13, NULL),
      (36218, 'Won by one point thanks to the witch!')`)
	}

	await db.run(`INSERT OR IGNORE INTO play_players (play_id, player_id) VALUES 
    (1, 1), (1, 2),
    (2, 3), (2, 4), (2, 5),
    (3, 1), (3, 6) `)
}

module.exports = { initializeDb }
