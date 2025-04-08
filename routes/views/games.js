const express = require('express')
const router = express.Router()
const { getBaseUrl, BASE_URL } = require('../../config')

router.get('/', async (req, res) => {
	try {
		const response = await fetch(`${BASE_URL}/api/games`) // Use fetch instead of axios
		const games = await response.json()
		res.render('games/list', { games }) // Render the list view
	} catch (error) {
		res.status(500).send('Error fetching games')
	}
})

// Render the form to create a new game
router.get('/new', (req, res) => {
	res.render('games/new')
})

// Single game view
router.get('/:id', async (req, res) => {
	try {
		const response = await fetch(`${BASE_URL}/api/games/${req.params.id}`) // Fetch single game from API
		const game = await response.json()

		if (response.status === 404) {
			return res.status(404).send('Game not found')
		}

		// Fetch plays for the game
		const playsResponse = await fetch(`${BASE_URL}/api/plays/game/${req.params.id}`)
		const plays = await playsResponse.json()

		res.render('games/single', { game, plays }) // Pass plays to the view
	} catch (error) {
		res.status(500).send('Error fetching game')
	}
})

module.exports = router
