const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
	try {
		const baseUrl = `${req.protocol}://${req.get('host')}`
		const response = await fetch(`${baseUrl}/api/plays`)
		const plays = await response.json()
		for (const play of plays) {
			// Fetch player details
			if (play.player_ids) {
				const playerIds = play.player_ids.split(',')
				play.players = await Promise.all(
					playerIds.map(async id => {
						const playerResponse = await fetch(`${baseUrl}/api/players/${id}`)
						return playerResponse.json()
					})
				)
				// Generate player_names
				play.player_names = play.players.map(player => player.name).join(', ')
			}
			// Fetch game details
			const gameResponse = await fetch(`${baseUrl}/api/games/${play.game_id}`)
			const game = await gameResponse.json()
			play.title = game.title
		}
		res.render('plays/list', { plays })
	} catch (error) {
		res.status(500).send('Error fetching plays')
	}
})

// Render the form to create a new play
router.get('/new', async (req, res) => {
	try {
		const baseUrl = `${req.protocol}://${req.get('host')}`
		const gamesResponse = await fetch(`${baseUrl}/api/games`)
		const playersResponse = await fetch(`${baseUrl}/api/players`)
		const games = await gamesResponse.json()
		const players = await playersResponse.json()
		res.render('plays/new', { games, players })
	} catch (error) {
		res.status(500).send('Error loading form')
	}
})

router.get('/:id', async (req, res) => {
	try {
		const baseUrl = `${req.protocol}://${req.get('host')}`
		const response = await fetch(`${baseUrl}/api/plays/${req.params.id}`)
		const play = await response.json()

		if (response.status === 404) {
			return res.status(404).send('Play not found')
		}

		// Fetch player details
		if (play.player_ids) {
			const playerIds = play.player_ids.split(',')
			play.players = await Promise.all(
				playerIds.map(async id => {
					const playerResponse = await fetch(`${baseUrl}/api/players/${id}`)
					return playerResponse.json()
				})
			)
			// Generate player_names
			play.player_names = play.players.map(player => player.name).join(', ')
		}
		// Fetch game details
		const gameResponse = await fetch(`${baseUrl}/api/games/${play.game_id}`)
		const game = await gameResponse.json()
		play.title = game.title

		res.render('plays/single', { play })
	} catch (error) {
		res.status(500).send('Error fetching play')
	}
})

module.exports = router
