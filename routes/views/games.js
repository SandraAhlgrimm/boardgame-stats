const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
	try {
		const baseUrl = `${req.protocol}://${req.get('host')}` // Dynamically construct the base URL
		const response = await fetch(`${baseUrl}/api/games`) // Use fetch instead of axios
		const games = await response.json()
		res.render('games/list', { games }) // Render the list view
	} catch (error) {
		res.status(500).send('Error fetching games')
	}
})

// Single game view
router.get('/:id', async (req, res) => {
	try {
		const baseUrl = `${req.protocol}://${req.get('host')}` // Dynamically construct the base URL
		const response = await fetch(`${baseUrl}/api/games/${req.params.id}`) // Fetch single game from API
		const game = await response.json()

		if (response.status === 404) {
			return res.status(404).send('Game not found')
		}

		// Fetch plays for the game
		const playsResponse = await fetch(`${baseUrl}/api/plays/game/${req.params.id}`)
		const plays = await playsResponse.json()

		res.render('games/single', { game, plays }) // Pass plays to the view
	} catch (error) {
		res.status(500).send('Error fetching game')
	}
})

module.exports = router
