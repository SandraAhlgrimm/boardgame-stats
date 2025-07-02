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

// Make external API call with GitHub Models
async function modelCall(messages, model = 'openai/gpt-4-1', parameters = {}) {
	if (!token) {
		throw new Error('GITHUB_TOKEN environment variable is not set')
	}

	try {
		const client = ModelClient(endpoint, new AzureKeyCredential(token))

		const defaultParameters = {
			temperature: 1.0,
			top_p: 1.0,
		}

		const response = await client.path('/chat/completions').post({
			body: {
				messages,
				model,
				...defaultParameters,
				...parameters,
			},
		})

		if (isUnexpected(response)) {
			console.error('AI API error:', response.body)
			throw new Error('AI API error: ' + response.body?.error?.message || 'Unknown API error')
		}

		return response.body.choices[0].message.content
	} catch (error) {
		console.error('Error in modelCall:', error)
		throw error
	}
}

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

/**
 * Body: { input: string } - User preferences for campaign generation
 * Example: { "input": "Setting: Underwater city, Tone: Comedic, Level: 8" }
 */
router.post('/campaign', async (req, res) => {
	try {
		const promptConfig = loadPrompt('demos/prompts/campaign-generator.prompt.yml')
		const userInput = req.body.input || 'A classic fantasy adventure for level 5 characters'
		const messages = replaceInputPlaceholder(promptConfig.messages, userInput)

		// Generate a mock campaign based on user input until GitHub token has model access
		const campaign = generateMockCampaign(userInput)

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

		// Generate a mock character based on user input until GitHub token has model access
		const character = generateMockCharacter(userInput)

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

// Get available models
router.get('/models', async (req, res) => {
	try {
		const client = ModelClient(endpoint, new AzureKeyCredential(token))
		const response = await client.path('/catalog/models').get()

		if (isUnexpected(response)) {
			throw response.body.error
		}

		res.json(response.body)
	} catch (error) {
		console.error('Error fetching models:', error)
		res.status(500).json({
			success: false,
			error: 'Failed to fetch models: ' + (error?.message || 'Unknown error'),
		})
	}
})

// Mock generator functions that use user input
function generateMockCampaign(userInput) {
	const input = userInput.toLowerCase()

	// Extract keywords to customize the response
	const isUnderwaterTheme = input.includes('underwater') || input.includes('ocean') || input.includes('sea')
	const isHorrorTheme =
		input.includes('horror') || input.includes('scary') || input.includes('haunted') || input.includes('spooky')
	const isComedyTheme = input.includes('comedy') || input.includes('funny') || input.includes('comedic')
	const isDesertTheme = input.includes('desert') || input.includes('sand')
	const isCityTheme = input.includes('city') || input.includes('urban')

	let title, hook, setting, villain, twist

	if (isUnderwaterTheme) {
		title = 'The Depths of Coral Crown'
		hook = 'A distress signal from the underwater city of Coral Crown reaches the surface world.'
		setting = 'The magnificent underwater city of Coral Crown, with its coral spires and kelp forests.'
		villain = 'Admiral Ketos, a corrupted merfolk seeking to flood the surface world.'
		twist = "The city's magical barrier is failing, and only surface dwellers can repair it from the outside."
	} else if (isHorrorTheme) {
		title = 'The Cursed Manor of Shadowvale'
		hook = 'Strange disappearances plague the village near the abandoned Shadowvale Manor.'
		setting = 'A decrepit manor house surrounded by dead trees and perpetual fog.'
		villain = 'The Weeping Wraith, a vengeful spirit bound to the manor.'
		twist = "The wraith was once the manor's innocent child, corrupted by dark magic."
	} else if (isComedyTheme) {
		title = 'The Great Pie Heist'
		hook = 'Someone has been stealing all the pies from the annual Harvest Festival!'
		setting = 'The cheerful village of Sweetbrook during their chaotic festival preparations.'
		villain = 'Granny Crumblebottom, a mischievous halfling baker with a secret plan.'
		twist = "She's actually testing recipes for the world's largest pie to feed a starving giant."
	} else if (isDesertTheme) {
		title = 'The Mirage of Golden Sands'
		hook = 'Travelers report seeing a magnificent oasis that vanishes when approached.'
		setting = 'The scorching Whispering Desert with its shifting dunes and ancient ruins.'
		villain = 'Malik the Sandweaver, a djinn trapped in a cursed lamp.'
		twist = 'The oasis is real, but it exists in a pocket dimension controlled by the djinn.'
	} else if (isCityTheme) {
		title = 'Shadows in the Clockwork District'
		hook = "Mysterious mechanical creatures are wreaking havoc in the city's industrial quarter."
		setting = 'The bustling metropolis of Gearsburg, filled with steam-powered machinery.'
		villain = 'Professor Cogsworth, a mad inventor seeking to replace all life with machines.'
		twist = "The professor is actually a construct himself, following his creator's final command."
	} else {
		// Default fantasy adventure
		title = 'The Crystal of Eternal Storms'
		hook = "The magical Crystal of Eternal Storms has been stolen, threatening the realm's weather."
		setting = 'The mystical Stormspire Mountains where ancient magic still flows.'
		villain = 'Tempest Lord Vorthak, a power-hungry sorcerer.'
		twist = "The crystal was never meant to control weather—it's actually a prison for an ancient storm elemental."
	}

	return `**${title}**

**Campaign Hook:**
${hook}

**Plot Summary:**
Based on your preferences: "${userInput}"

The adventurers must investigate the mysterious events surrounding ${setting.toLowerCase()}. Through their investigation, they'll discover that ${villain.toLowerCase()} is behind the chaos. The party must gather allies, uncover clues, and ultimately confront the main threat while dealing with various challenges along the way.

**Key NPCs:**
- **The Concerned Authority:** The local leader who hires the party
- **The Mysterious Informant:** Someone with crucial information but their own agenda  
- **The Reluctant Ally:** A character who initially opposes but later helps the party
- **The Main Antagonist:** ${villain}

**Main Locations:**
- **The Starting Point:** Where the party receives their mission
- **The Investigation Site:** ${setting}
- **The Hidden Lair:** Where the final confrontation takes place
- **The Safe Haven:** A place for the party to rest and plan

**Final Twist:**
${twist}`
}

function generateMockCharacter(userInput) {
	const input = userInput.toLowerCase()

	// Extract character type/role keywords
	const isWizard = input.includes('wizard') || input.includes('mage') || input.includes('sorcerer')
	const isRogue = input.includes('rogue') || input.includes('thief') || input.includes('assassin')
	const isWarrior = input.includes('warrior') || input.includes('fighter') || input.includes('knight')
	const isTavern = input.includes('tavern') || input.includes('barkeep') || input.includes('innkeeper')
	const isMerchant = input.includes('merchant') || input.includes('trader') || input.includes('shopkeeper')
	const isNoble = input.includes('noble') || input.includes('lord') || input.includes('lady')
	const isMysterious = input.includes('mysterious') || input.includes('enigmatic') || input.includes('secretive')
	const isElf = input.includes('elf') || input.includes('elven')
	const isDwarf = input.includes('dwarf') || input.includes('dwarven')
	const isHalfling = input.includes('halfling') || input.includes('hobbit')

	let name, race, appearance, personality, motivation, background, quirk

	if (isWizard && isElf) {
		name = 'Silvanus Starweaver'
		race = 'High Elf'
		appearance =
			'Tall and graceful with silver hair and piercing violet eyes. Wears flowing robes adorned with constellation patterns.'
		personality = 'Intellectual and aloof, but genuinely cares for those who prove themselves worthy of trust.'
		motivation = 'Seeks to preserve ancient elven magic from being corrupted or lost.'
		background = 'Former court wizard who left noble society to pursue forbidden knowledge in ancient ruins.'
		quirk =
			'Always speaks in riddles when discussing magic, believing that wisdom must be earned through contemplation.'
	} else if (isRogue && isMysterious) {
		name = 'Shadow'
		race = 'Half-Elf'
		appearance = 'Average height with dark hair that seems to absorb light. Always dressed in practical, dark clothing.'
		personality = 'Quiet and observant, with a dry sense of humor that catches people off guard.'
		motivation = 'Hunting the criminal organization that destroyed their family.'
		background = "Once a member of the thieves' guild until they discovered their masters' true evil nature."
		quirk = 'Never reveals their real name and has a different alias in every town they visit.'
	} else if (isTavern) {
		name = 'Rosie Goldenheart'
		race = 'Halfling'
		appearance = 'A cheerful halfling with rosy cheeks, curly brown hair, and always-flour-dusted apron.'
		personality = 'Warm and motherly to customers, but fierce when protecting her establishment.'
		motivation = 'Wants to make her tavern the most welcoming place in the region.'
		background =
			'Inherited the tavern from her grandmother and has been slowly renovating it with stories and memories.'
		quirk = "Remembers every customer's favorite drink and always asks about their families."
	} else if (isWarrior && isDwarf) {
		name = 'Thorin Ironbeard'
		race = 'Mountain Dwarf'
		appearance = 'Stocky build with a magnificent braided beard adorned with iron rings. Bears numerous battle scars.'
		personality = 'Honorable and straightforward, with an unshakeable sense of duty.'
		motivation = "Seeking to restore his clan's honor after a devastating military defeat."
		background = 'Former captain of the royal guard who took responsibility for a failed mission.'
		quirk = 'Polishes his weapons while thinking, and can often be found maintaining gear when troubled.'
	} else if (isMerchant) {
		name = 'Cornelius Goldfinch'
		race = 'Human'
		appearance = 'Well-dressed human with a perfectly waxed mustache and expensive jewelry.'
		personality = 'Charming and persuasive, but always calculating profit margins in conversations.'
		motivation = 'Dreams of building a trading empire that spans continents.'
		background = 'Started as a street peddler and worked their way up through shrewd deals and networking.'
		quirk = 'Always carries a golden coin that they flip when making important decisions.'
	} else if (isNoble) {
		name = 'Lady Evangeline Blackthorne'
		race = 'Human'
		appearance =
			'Elegant bearing with elaborate clothing and perfectly styled hair. Carries herself with noble confidence.'
		personality = 'Refined and diplomatic, but harbors steel beneath the silk.'
		motivation = "Protecting her family's lands and people from political intrigue."
		background = 'Youngest daughter who unexpectedly inherited the family title and estates.'
		quirk = 'Collects rare books and quotes poetry in stressful situations.'
	} else {
		// Default character based on input
		name = 'Morgan Brightblade'
		race = 'Human'
		appearance = 'Average height with determined eyes and practical clothing suited for adventure.'
		personality = 'Friendly and optimistic, always looking for the best in people and situations.'
		motivation = 'Inspired by your description: seeking to help others and make their mark on the world.'
		background = 'A commoner who decided to pursue adventure after hearing tales of heroic deeds.'
		quirk = 'Always carries a lucky charm and believes strongly in the power of friendship.'
	}

	return `**${name}**
*${race}*

**User Request:** "${userInput}"

**Appearance:**
${appearance}

**Personality:**
${personality}

**Motivation:**
${motivation}

**Background:**
${background}

**Memorable Quirk:**
${quirk}`
}

module.exports = router
