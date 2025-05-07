const express = require('express')
const rateLimit = require('express-rate-limit')
const { getDbConnection } = require('../../database/connect')
const { rateLimitConfig } = require('../../config')

const router = express.Router()

const apiLimiter = rateLimit(rateLimitConfig)

router.use(apiLimiter)

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

		// Fetch BGG XML data
		const bggResponse = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${id}`)
		const bggXml = await bggResponse.text()

		// Extract image URL using regex
		const imageUrlMatch = bggXml.match(/<image>(.*?)<\/image>/)
		if (imageUrlMatch && imageUrlMatch[1]) {
			game.imageUrl = imageUrlMatch[1]
		}

		res.json(game)
	} catch (err) {
		return res.status(500).json({ error: err.message })
	}
})

// Create a new game
router.post('/', async (req, res) => {
	try {
		const { bgg, title, notes } = req.body
		if (!bgg || !title) {
			return res.status(400).json({ error: 'BGG ID and title are required' })
		}

		const db = await getDbConnection()
		await db.run(`INSERT INTO games (bgg, title, notes) VALUES (?, ?, ?)`, [bgg, title, notes || null])

		res.redirect('/games') // Redirect to the game list after creation
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

module.exports = router
