const express = require('express')
const router = express.Router()
const gameRoutes = require('./games')
const playRoutes = require('./plays')
const playerRoutes = require('./players')

router.use('/games', gameRoutes)
router.use('/plays', playRoutes)
router.use('/players', playerRoutes)

module.exports = router
