const express = require('express')
const { getDbConnection } = require('../database/connect')

const router = express.Router()

router.get('/', async (req, res) => {
	try {
		const db = await getDbConnection()
		const games = await db.all('SELECT * FROM games')
		res.json(games)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

router.post('/', async (req, res) => {
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

	res.json({ id: result.lastID, title, boardgamegeek_id, notes })
})

module.exports = router
