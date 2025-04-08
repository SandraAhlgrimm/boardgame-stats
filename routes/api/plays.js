const express = require('express')
const rateLimit = require('express-rate-limit')
const { rateLimitConfig } = require('../../config')
const { getDbConnection } = require('../../database/connect')

const router = express.Router()

const apiLimiter = rateLimit(rateLimitConfig)

router.use(apiLimiter)

// Get all plays
router.get('/', async (req, res) => {
	const db = await getDbConnection()
	const plays = await db.all(`
    SELECT p.*, GROUP_CONCAT(pp.player_id) AS player_ids
    FROM plays p
    LEFT JOIN play_players pp ON p.id = pp.play_id
    GROUP BY p.id
  `)

	res.json(plays)
})

// Get a single play by ID
router.get('/:playId', async (req, res) => {
	const { playId } = req.params
	const db = await getDbConnection()
	const play = await db.get(
		`
    SELECT p.*, GROUP_CONCAT(pp.player_id) AS player_ids
    FROM plays p
    LEFT JOIN play_players pp ON p.id = pp.play_id
    WHERE p.id = ?
    GROUP BY p.id
  `,
		[playId]
	)

	if (!play) {
		return res.status(404).json({ error: 'Play not found' })
	}

	res.json(play)
})

// Get plays for a specific game
router.get('/game/:gameId', async (req, res) => {
	const { gameId } = req.params
	const db = await getDbConnection()
	const plays = await db.all(
		`
		SELECT p.*, GROUP_CONCAT(pp.player_id) AS player_ids
		FROM plays p
		LEFT JOIN play_players pp ON p.id = pp.play_id
		WHERE p.game_id = ?
		GROUP BY p.id
	`,
		[gameId]
	)

	// Fetch player names for each play
	for (const play of plays) {
		if (play.player_ids) {
			const playerIds = play.player_ids.split(',')
			const players = await Promise.all(
				playerIds.map(async id => {
					const player = await db.get(`SELECT name FROM players WHERE id = ?`, [id])
					return player.name
				})
			)
			play.player_names = players.join(', ')
		} else {
			play.player_names = 'No players'
		}
	}

	res.json(plays)
})

// Create a new play
router.post('/', async (req, res) => {
	try {
		const { game_id, notes, player_ids } = req.body
		if (!game_id || !player_ids || !Array.isArray(player_ids)) {
			return res.status(400).json({ error: 'Game ID and an array of player IDs are required' })
		}

		const db = await getDbConnection()
		const result = await db.run(`INSERT INTO plays (game_id, notes) VALUES (?, ?)`, [game_id, notes || null])
		const playId = result.lastID

		// Insert player associations
		for (const playerId of player_ids) {
			await db.run(`INSERT INTO play_players (play_id, player_id) VALUES (?, ?)`, [playId, playerId])
		}

		res.redirect('/plays') // Redirect to the plays list after creation
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

module.exports = router
