const express = require('express')
const router = express.Router()

// Main generators page with links
router.get('/', (req, res) => {
	res.render('generators/list')
})

// Campaign generator page
router.get('/campaign', (req, res) => {
	res.render('generators/campaign')
})

// Character generator page
router.get('/character', (req, res) => {
	res.render('generators/character')
})

module.exports = router
