const express = require('express')
const { getDbConnection } = require('./database')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

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
initializeDb().catch(console.error)

app.get('/', (req, res) => {
	res.json({ message: 'Welcome to the SQLite Express API' })
})

app.get('/games', async (req, res) => {
	try {
		const db = await getDbConnection()
		const games = await db.all('SELECT * FROM games')
		res.json(games)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

app.post('/games', async (req, res) => {
	const { title, boardgamegeek_id, notes } = req.body

	if (!title || !boardgamegeek_id) {
		res.status(400).json({ error: 'Title and boardgamegeek_id are required' })
		return
	}

	const db = await getDbConnection()
	const result = await db.run('INSERT INTO games (title, boardgamegeek_id, notes) VALUES (?, ?, ?)', [
		title,
		boardgamegeek_id,
		notes,
	])

	res.json({ id: result.lastID, title, boardgamegeek_id, notes, email })
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
