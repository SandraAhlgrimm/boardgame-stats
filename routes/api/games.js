const express = require('express')
const { getDbConnection } = require('../../database/connect')

const router = express.Router()

// Get all games
router.get('/', async (req, res) => {
	try {
		const db = await getDbConnection()
		const games = await db.all('SELECT * FROM games')
		res.json(games)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

// Get a single game by ID
router.get('/:id', async (req, res) => {
	const { id } = req.params

	try {
		const db = await getDbConnection()
		const game = await db.get('SELECT * FROM games WHERE bgg = ?', [id])

		if (!game) {
			return res.status(404).json({ error: 'Game not found' })
		}

		res.json(game)
	} catch (err) {
		return res.status(500).json({ error: err.message })
	}
})

module.exports = router
