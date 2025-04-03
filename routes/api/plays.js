const express = require('express')
const { getDbConnection } = require('../../database/connect')

const router = express.Router()

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
	const plays = await db.all(`SELECT * FROM plays WHERE game_id = ?`, [gameId])
	res.json(plays)
})

module.exports = router
