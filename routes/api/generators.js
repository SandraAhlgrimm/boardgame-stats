const ModelClient = require('@azure-rest/ai-inference').default
const { isUnexpected } = require('@azure-rest/ai-inference')
const { AzureKeyCredential } = require('@azure/core-auth')
const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const express = require('express')

const router = express.Router()

const token = process.env['GITHUB_TOKEN']
const endpoint = 'https://models.github.ai/inference'

// Load prompt file
function loadPrompt(promptPath) {
	const fullPath = path.resolve(__dirname, '../../', promptPath)
	const fileContents = fs.readFileSync(fullPath, 'utf8')
	return yaml.load(fileContents)
}

// Replace {{input}} placeholder in messages
function replaceInputPlaceholder(messages, userInput) {
	return messages.map(message => {
		if (message.content.includes('{{input}}')) {
			return {
				...message,
				content: message.content.replace('{{input}}', userInput),
			}
		}
		return message
	})
}

// Make external API call with GitHub Models
async function modelCall(messages, model, parameters = {}) {
	if (!token) {
		throw new Error('GITHUB_TOKEN environment variable is not set')
	}

	try {
		const client = ModelClient(endpoint, new AzureKeyCredential(token))

		const response = await client.path('/chat/completions').post({
			body: {
				messages,
				model,
				...parameters,
			},
		})

		if (isUnexpected(response)) {
			console.error('AI API error:', response.body)
			const errorMessage = response.body?.error?.message || JSON.stringify(response.body) || 'Unknown API error'
			throw new Error('AI API error: ' + errorMessage)
		}

		return response.body.choices[0].message.content
	} catch (error) {
		console.error('Error in modelCall:', error)
		throw error
	}
}

/**
 * Body: { input: string } - User preferences for campaign generation
 * Example: { "input": "Setting: Underwater city, Tone: Comedic, Level: 8" }
 */
router.post('/campaign', async (req, res) => {
	try {
		const promptConfig = loadPrompt('demos/prompts/campaign-generator.prompt.yml')
		const userInput = req.body.input || 'A classic fantasy adventure for level 5 characters'
		const messages = replaceInputPlaceholder(promptConfig.messages, userInput)

		const campaign = await modelCall(messages, promptConfig.model, promptConfig.modelParameters || {})

		res.json({
			success: true,
			campaign,
			input: userInput,
		})
	} catch (error) {
		console.error('Error generating campaign:', error)
		const errorMessage = error?.message || 'Unknown error occurred'
		res.status(500).json({
			success: false,
			error: 'Failed to generate campaign: ' + errorMessage,
		})
	}
})

/**
 * Body: { input: string } - Character description or type to generate
 * Example: { "input": "A mysterious elven wizard who guards ancient secrets" }
 */
router.post('/character', async (req, res) => {
	try {
		const promptConfig = loadPrompt('demos/prompts/character-generator.prompt.yml')
		const userInput = req.body.input || 'A helpful tavern keeper'
		const messages = replaceInputPlaceholder(promptConfig.messages, userInput)

		const character = await modelCall(messages, promptConfig.model, promptConfig.modelParameters || {})

		res.json({
			success: true,
			character,
			input: userInput,
		})
	} catch (error) {
		console.error('Error generating character:', error)
		const errorMessage = error?.message || 'Unknown error occurred'
		res.status(500).json({
			success: false,
			error: 'Failed to generate character: ' + errorMessage,
		})
	}
})

/**
 * Get list of available models from GitHub Models Catalog API
 */
router.get('/models', async (req, res) => {
	try {
		if (!token) {
			throw new Error('GITHUB_TOKEN environment variable is not set')
		}

		// Use GitHub REST API to fetch model catalog
		const response = await fetch('https://models.github.ai/catalog/models', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
				'User-Agent': 'BoardGame-Stats-App',
			},
		})

		if (!response.ok) {
			const errorBody = await response.text()
			throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorBody}`)
		}

		const data = await response.json()

		res.json({
			success: true,
			models: data,
		})
	} catch (error) {
		console.error('Error fetching models from GitHub API:', error)
		const errorMessage = error?.message || 'Unknown error occurred'
		res.status(500).json({
			success: false,
			error: 'Failed to fetch models: ' + errorMessage,
		})
	}
})

module.exports = router
