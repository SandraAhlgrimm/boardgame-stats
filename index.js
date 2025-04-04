const express = require('express')
const exphbs = require('express-handlebars')
const { getDbConnection } = require('./database/connect')
const { initializeDb } = require('./database/initialize')
const apiRoutes = require('./routes/api')
const viewRoutes = require('./routes/views')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json()) // Ensure this middleware is present
app.use(express.urlencoded({ extended: true })) // Add this to parse URL-encoded form data
app.use(express.static('public'))

app.engine(
	'hbs',
	exphbs.engine({
		extname: '.hbs',
		defaultLayout: 'main',
		layoutsDir: './views/layouts',
	})
)
app.set('view engine', 'hbs')
app.set('views', './views')
initializeDb().catch(console.error)

app.use('/api', apiRoutes)
app.use('/', viewRoutes)

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
