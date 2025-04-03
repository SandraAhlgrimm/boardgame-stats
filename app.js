const express = require('express')
const { getDbConnection } = require('./database/connect')
const { initializeDb } = require('./database/initialize')
const gameRoutes = require('./routes/games')
const playRoutes = require('./routes/plays')
const playerRoutes = require('./routes/players')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

initializeDb().catch(console.error)

app.get('/', (req, res) => {
	res.json({ message: 'Welcome to the SQLite Express API' })
})

app.use('/games', gameRoutes)
app.use('/plays', playRoutes)
app.use('/players', playerRoutes)

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
