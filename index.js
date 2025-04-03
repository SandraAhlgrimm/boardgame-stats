const express = require('express')
const { getDbConnection } = require('./database/connect')
const { initializeDb } = require('./database/initialize')
const apiRoutes = require('./routes/api')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

initializeDb().catch(console.error)

app.get('/', (req, res) => {
	res.json({ message: 'Welcome to the SQLite Express API' })
})

app.use('/api', apiRoutes)

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
