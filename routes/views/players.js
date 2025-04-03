const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
	try {
		const baseUrl = `${req.protocol}://${req.get('host')}`
		const response = await fetch(`${baseUrl}/api/players`)
		const players = await response.json()
		res.render('players/list', { players })
	} catch (error) {
		res.status(500).send('Error fetching players')
	}
})

router.get('/:id', async (req, res) => {
	try {
		const baseUrl = `${req.protocol}://${req.get('host')}`
		const response = await fetch(`${baseUrl}/api/players/${req.params.id}`)
		const player = await response.json()

		if (response.status === 404) {
			return res.status(404).send('Player not found')
		}

		res.render('players/single', { player })
	} catch (error) {
		res.status(500).send('Error fetching player')
	}
})

module.exports = router
