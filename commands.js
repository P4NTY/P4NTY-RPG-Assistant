const { SlashCommandBuilder } = require('@discordjs/builders');

const commands = [
	{
		name: 'Simple Roll',
		type: ['roll'],
		expample: '/r command: ( 2d6 + 6 ) * 5 comment: Roll'
		+'\u000A \u000A'
		+'In this example you roll 2d6 + 6 and result is multiply by five'
		+'\u000A '
		+'PS: You also can use separator "k" for example 2k6 is same as 2d6',
		command: new SlashCommandBuilder().setName('r')
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
	},
	{
		name: 'Call of Cthulhu',
		type: ['roll'],
		expample: '/cr skill: 45 bonus: 2 penalty: 1 comment: Call of Cthulhu'
		+'\u000A \u000A'
		+'You\'ll roll d100 with decimal dices depending on bonus - penalty where result is checking with your skill value.',
		command: new SlashCommandBuilder().setName('cr')
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
	},
	{
		name: 'Tales from the Loop',
		type: ['roll'],
		expample: '/tr skill: 10 comment: Tales from the Loop'
		+'\u000A \u000A'
		+ 'You\'ll roll number of d6 dices depending on your skill and as a result is number of 6 value.',
		command: new SlashCommandBuilder().setName('tr')
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
	},
	{
		name: 'Fate',
		type: ['roll'],
		expample: '/fr skill: 3 difficulty: 2 comment: Fate'
		+'\u000A \u000A'
		+'You\'ll roll 4 FUDGE dices + your skill - difficulty level',
		command: new SlashCommandBuilder().setName('fr').setDescription('Fate')	
			.addIntegerOption( option => 
				option.setName('skill') 
					.setDescription('Your skill')
			)
			.addStringOption( option => 
				option.setName('comment') 
					.setDescription('Your comment')
			)
			.addIntegerOption( option =>
				option.setName('difficulty')
					.setDescription('How hard is that?')
			),
	},
	{
		name: 'Warhammer',
		type: ['roll'],
		expample: '/wr skill: 47 modifier: 20 comment: Warhammer'
		+ '\u000A \u000A'
		+ 'You\'ll roll d100 where result is checking with your skill and modifier',
		command: new SlashCommandBuilder().setName('wr').setDescription('Warhammer')	
			.addIntegerOption( option => 
				option.setName('skill') 
					.setDescription('Your skill')
					.setRequired(true)
			)
			.addIntegerOption( option => 
				option.setName('modifier') 
					.setDescription('Your modifier')
			)
			.addStringOption( option => 
				option.setName('comment') 
					.setDescription('Your comment')
			),
	},
	{
		name: 'Dungeons and Dragons',
		type: ['roll'],
		expample: '/dnd modifier: 7 comment: Dungeons and Dragons'
		+ '\u000A \u000A'
		+ 'You\'ll roll + modifier',
		command: new SlashCommandBuilder().setName('dnd').setDescription('Dungeons and Dragons')
			.addIntegerOption( option => 
				option.setName('modifier') 
					.setDescription('Your modifier')
			)
			.addStringOption( option => 
				option.setName('comment') 
					.setDescription('Your comment')
			),
	},
	{
		name: 'Vamipire',
		type: ['roll'],
		expample: '/vr pool: 7 hunger: 4 difficulty: 3 comment: Vampire'
			+ '\u000A \u000A'
			+ 'You\'ll roll 4 normal dices - hunger and hunger dices where result is checking with difficulty.',
		command: new SlashCommandBuilder().setName('vr').setDescription('Vampire')
			.addIntegerOption( option =>
				option.setName('pool')
					.setDescription('Your dices pool')
					.setRequired(true)
			)
			.addIntegerOption( option =>
				option.setName('difficulty')
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
	},
	{
		name: 'Cult',
		type: ['roll'],
		expample: '/c skill: 2 modifier: -1 comment: Cult'
			+ '\u000A \u000A'
			+ 'You\'ll roll 2d10 + skill and modifier.',
		command: new SlashCommandBuilder().setName('c').setDescription('Cult')
			.addIntegerOption( option =>
				option.setName('skill')
					.setDescription('Your skill')
					.setRequired(true)
			)
			.addIntegerOption( option =>
				option.setName('modifier')
					.setDescription('The modifier of your throw?')
			)
			.addStringOption( option => 
				option.setName('comment') 
					.setDescription('Your comment')
			),
	},
	{
		name: 'Support',
		type: ['info'],
		command: new SlashCommandBuilder().setName('supports').setDescription('If you want support this !'),
	},
	{
		name: 'Help',
		type: ['info'],
		command: new SlashCommandBuilder().setName('help').setDescription('I need the help !'),
	},
	{
		name: 'Ai',
		type: ['ai'],
		command: new SlashCommandBuilder().setName('ai').setDescription('Zapytaj bota.')
			.addStringOption( option => 
				option.setName('prompt') 
					.setDescription('Your prompt')
			)
	},
];

// const commands = [].map(command => command.toJSON());

const rollsInfo = () => commands.filter( ({type}) => type.includes('roll') );
const comandJSON = () => commands.map( ({command}) => command.toJSON() );

module.exports = { rollsInfo, comandJSON };