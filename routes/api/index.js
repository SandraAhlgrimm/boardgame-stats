const express = require('express')
const router = express.Router()
const gameRoutes = require('./games')
const playRoutes = require('./plays')
const playerRoutes = require('./players')
const generatorRoutes = require('./generators')

router.use('/games', gameRoutes)
router.use('/plays', playRoutes)
router.use('/players', playerRoutes)
router.use('/generators', generatorRoutes)

module.exports = router
