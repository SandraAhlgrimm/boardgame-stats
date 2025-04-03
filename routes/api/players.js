const express = require('express')
const { getDbConnection } = require('../../database/connect')

const router = express.Router()

router.get('/', async (req, res) => {
	try {
		const db = await getDbConnection()
		const players = await db.all('SELECT * FROM players')
		res.json(players)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

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

router.put('/:id', async (req, res) => {
	const { id } = req.params
	const { name } = req.body

	if (!name) {
		res.status(400).json({ error: 'Name is required' })
		return
	}

	try {
		const db = await getDbConnection()
		const result = await db.run('UPDATE players SET name = ? WHERE id = ?', [name, id])

		if (result.changes === 0) {
			res.status(404).json({ error: 'Player not found' })
			return
		}

		res.json({ id, name })
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

router.delete('/:id', async (req, res) => {
	const { id } = req.params

	try {
		const db = await getDbConnection()
		const result = await db.run('DELETE FROM players WHERE id = ?', [id])

		if (result.changes === 0) {
			res.status(404).json({ error: 'Player not found' })
			return
		}

		res.json({ message: 'Player deleted successfully' })
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

module.exports = router
