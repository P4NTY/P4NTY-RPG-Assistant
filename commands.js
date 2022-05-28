const { SlashCommandBuilder } = require('@discordjs/builders');

const commands = [
	/** Cthulhu */
    new SlashCommandBuilder().setName('cr')
		.setDescription('Call of Cthulhu')
		.addIntegerOption( option => 
			option.setName('skill')
				.setDescription('Your skill value')
				.setRequired(true)
		)
		.addIntegerOption( option => 
			option.setName('bonus')
				.setDescription('Your number of bonus dice')
		)
		.addIntegerOption( option => 
			option.setName('penalty')
				.setDescription('Your number of penalty dice')
		)
		.addStringOption( option => 
			option.setName('comment') 
				.setDescription('Your comment')
		),
    /** Simple Roll */
	new SlashCommandBuilder().setName('r')
		.setDescription('Your Own roll')	
		.addStringOption( option => 
			option.setName('command') 
				.setDescription('Your command')
				.setRequired(true)
		)
		.addStringOption( option => 
			option.setName('comment') 
				.setDescription('Your comment')
		),
    /** Tales from the Loop */
    new SlashCommandBuilder().setName('tr')
		.setDescription('Tales from the Loop')	
		.addIntegerOption( option => 
			option.setName('skill')
				.setDescription('Your skill value')
				.setRequired(true)
		)
		.addStringOption( option => 
			option.setName('comment') 
				.setDescription('Your comment')
		),
    /** Fate */
    new SlashCommandBuilder().setName('fr').setDescription('Fate')	
		.addIntegerOption( option => 
			option.setName('skill') 
				.setDescription('Your skill')
		)
		.addStringOption( option => 
			option.setName('comment') 
				.setDescription('Your comment')
		)
		.addIntegerOption( option =>
			option.setName('difficult')
				.setDescription('How hard is that?')
		),
	/** Warhammer */
	new SlashCommandBuilder().setName('wr').setDescription('Warhammer')	
		.addIntegerOption( option => 
			option.setName('skill') 
				.setDescription('Your skill')
				.setRequired(true)
		)
		.addIntegerOption( option => 
			option.setName('modyficator') 
				.setDescription('Your modyficator')
		)
		.addStringOption( option => 
			option.setName('comment') 
				.setDescription('Your comment')
		),
	/** Dungeons and Dragons */
	new SlashCommandBuilder().setName('dnd').setDescription('Dungeons and Dragons')
		.addIntegerOption( option => 
			option.setName('modyficator') 
				.setDescription('Your modyficator')
		)
		.addStringOption( option => 
			option.setName('comment') 
				.setDescription('Your comment')
		),
	/** Vamipire */
	new SlashCommandBuilder().setName('vr').setDescription('Vampire')
		.addIntegerOption( option =>
			option.setName('pool')
				.setDescription('Your dices pool')
				.setRequired(true)
		)
		.addIntegerOption( option =>
			option.setName('difficult')
				.setDescription('How hard is that?')
				.setRequired(true)
		)
		.addIntegerOption( option =>
			option.setName('hunger')
				.setDescription('Your number of hunger dices')
		)
		.addStringOption( option => 
			option.setName('comment') 
				.setDescription('Your comment')
		),

].map(command => command.toJSON());

module.exports = { commands };