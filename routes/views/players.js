const express = require('express')
const { getBaseUrl, BASE_URL } = require('../../config')
const router = express.Router()

router.get('/', async (req, res) => {
	try {
		const response = await fetch(`${BASE_URL}/api/players`)
		const players = await response.json()
		res.render('players/list', { players })
	} catch (error) {
		res.status(500).send('Error fetching players')
	}
})

// Render the form to create a new player
router.get('/new', (req, res) => {
	res.render('players/new')
})

router.get('/:id', async (req, res) => {
	try {
		const response = await fetch(`${BASE_URL}/api/players/${req.params.id}`)
		const player = await response.json()

		if (response.status === 404) {
			return res.status(404).send('Player not found')
		}

		// Fetch plays for the player
		const playsResponse = await fetch(`${BASE_URL}/api/plays`)
		const allPlays = await playsResponse.json()
		const plays = await Promise.all(
			allPlays
				.filter(play => play.player_ids?.split(',').includes(String(player.id)))
				.map(async play => {
					// Fetch game details
					const gameResponse = await fetch(`${BASE_URL}/api/games/${play.game_id}`)
					const game = await gameResponse.json()

					// Fetch other players
					const otherPlayers = (play.player_ids?.split(',') || [])
						.filter(id => Number(id) !== player.id)
						.map(async id => {
							const playerResponse = await fetch(`${BASE_URL}/api/players/${id}`)
							const otherPlayer = await playerResponse.json()
							return otherPlayer.name
						})
					const otherPlayersNames = (await Promise.all(otherPlayers)).join(', ')

					return {
						id: play.id,
						game: { title: game.title || 'Unknown Game' },
						other_players: otherPlayersNames || 'No other players',
					}
				})
		)

		res.render('players/single', { player, plays })
	} catch (error) {
		console.log(error)
		res.status(500).send('Error fetching player')
	}
})

module.exports = router
