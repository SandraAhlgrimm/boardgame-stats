const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

const rateLimitConfig = {
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
}

module.exports = { BASE_URL, rateLimitConfig }
