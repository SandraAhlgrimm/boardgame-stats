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

// Add a new play
router.post('/', async (req, res) => {
	const { game_id, player_ids, notes } = req.body
	if (!game_id || !player_ids || !Array.isArray(player_ids)) {
		return res.status(400).json({ error: 'game_id and an array of player_ids are required' })
	}

	const db = await getDbConnection()
	const result = await db.run(`INSERT INTO plays (game_id, notes) VALUES (${game_id}, '${notes}')`)
	const playId = result.lastID

	for (const playerId of player_ids) {
		await db.run(`INSERT INTO play_players (play_id, player_id) VALUES (${playId}, ${playerId})`)
	}

	res.status(201).json({ message: 'Play added successfully', playId })
})

// Get plays for a specific game
router.get('/game/:gameId', async (req, res) => {
	const { gameId } = req.params
	const db = await getDbConnection()
	const plays = await db.all(`SELECT * FROM plays WHERE game_id = ?`, [gameId])
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

// Update a play
router.put('/:playId', async (req, res) => {
	const { playId } = req.params
	const { game_id, player_ids, notes } = req.body

	if (!game_id || !player_ids || !Array.isArray(player_ids)) {
		return res.status(400).json({ error: 'game_id and an array of player_ids are required' })
	}

	const db = await getDbConnection()
	await db.run(`UPDATE plays SET game_id = ?, notes = ? WHERE id = ?`, [game_id, notes, playId])

	// Clear existing player associations
	await db.run(`DELETE FROM play_players WHERE play_id = ?`, [playId])

	// Add updated player associations
	for (const playerId of player_ids) {
		await db.run(`INSERT INTO play_players (play_id, player_id) VALUES (?, ?)`, [playId, playerId])
	}

	res.json({ message: 'Play updated successfully' })
})

// Delete a play
router.delete('/:playId', async (req, res) => {
	const { playId } = req.params
	const db = await getDbConnection()

	// Delete player associations first
	await db.run(`DELETE FROM play_players WHERE play_id = ?`, [playId])

	// Delete the play itself
	await db.run(`DELETE FROM plays WHERE id = ?`, [playId])

	res.json({ message: 'Play deleted successfully' })
})

module.exports = router
