const express = require('express')
const { getDbConnection } = require('../../database/connect')

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
	const { title, bgg, notes } = req.body

	if (!title || !bgg) {
		res.status(400).json({ error: 'Title and bgg are required' })
		return
	}

	const db = await getDbConnection()
	const result = await db.run('INSERT INTO games (title, bgg, notes) VALUES (?, ?, ?)', [title, bgg, notes])

	res.json({ id: result.lastID, title, bgg, notes })
})

router.get('/:id', async (req, res) => {
	const { id } = req.params

	try {
		const db = await getDbConnection()
		const game = await db.get('SELECT * FROM games WHERE bgg = ?', [id])

		if (!game) {
			res.status(404).json({ error: 'Game not found' })
			return
		}

		res.json(game)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

router.put('/:id', async (req, res) => {
	const { id } = req.params
	const { title, bgg, notes } = req.body

	if (!title || !bgg) {
		res.status(400).json({ error: 'Title and bgg are required' })
		return
	}

	try {
		const db = await getDbConnection()
		const result = await db.run('UPDATE games SET title = ?, bgg = ?, notes = ? WHERE id = ?', [title, bgg, notes, id])

		if (result.changes === 0) {
			res.status(404).json({ error: 'Game not found' })
			return
		}

		res.json({ id, title, bgg, notes })
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

router.delete('/:id', async (req, res) => {
	const { id } = req.params

	try {
		const db = await getDbConnection()
		const result = await db.run('DELETE FROM games WHERE bgg = ?', [id])

		if (result.changes === 0) {
			res.status(404).json({ error: 'Game not found' })
			return
		}

		res.json({ message: 'Game deleted successfully' })
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

module.exports = router
