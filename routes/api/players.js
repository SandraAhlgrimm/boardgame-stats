const express = require('express')
const { getDbConnection } = require('../../database/connect')

const router = express.Router()

// Get all players
router.get('/', async (req, res) => {
	try {
		const db = await getDbConnection()
		const players = await db.all('SELECT * FROM players')
		res.json(players)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

// Get a single player by ID
router.get('/:id', async (req, res) => {
	const { id } = req.params

	try {
		const db = await getDbConnection()
		const player = await db.get('SELECT * FROM players WHERE id = ?', [id])

		if (!player) {
			res.status(404).json({ error: 'Player not found' })
			return
		}

		res.json(player)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

// Add a new player
router.post('/', async (req, res) => {
	const { name } = req.body

	if (!name) {
		res.status(400).json({ error: 'Name is required' })
		return
	}

	const db = await getDbConnection()
	const result = await db.run('INSERT INTO players (name) VALUES (?)', [name])

	res.json({ id: result.lastID, name })
})

module.exports = router
