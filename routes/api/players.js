const express = require('express')
const rateLimit = require('express-rate-limit')
const { getDbConnection } = require('../../database/connect')
const { rateLimitConfig } = require('../../config')

const router = express.Router()

const apiLimiter = rateLimit(rateLimitConfig)

router.use(apiLimiter)

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

// Create a new player
router.post('/', async (req, res) => {
	try {
		const { name } = req.body
		if (!name) {
			return res.status(400).json({ error: 'Player name is required' })
		}

		const db = await getDbConnection()
		await db.run(`INSERT INTO players (name) VALUES (?)`, [name])

		res.redirect('/players') // Redirect to the player list after creation
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

module.exports = router
