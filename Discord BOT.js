require('dotenv').config();
// Require the necessary discord.js classes
const { Client, Intents, MessageEmbed } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
//functions
const { simple_roll,cthulhu,tales,fate,warhammer,dnd,vampire,supports,help,cult,glina } = require('./bot-funcs');
const { saveDataToFile } = require('./utils')
const { aiQuest } = require('./ai')
//commands
const { comandJSON } = require('./commands');
// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_API_KEY);

rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: comandJSON() })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

// When the client is ready, run this code (only once)
client.once('ready', () => { console.log('Ready!'); });

client.on('interactionCreate', async interaction => {
	try {
		if ( !interaction.isCommand() && !interaction.isButton() ) return;
		const { commandName, options, user, member } = interaction,
			embed = new MessageEmbed()
				.setAuthor({ name: `${member.nickname||user.username}`})
				.setThumbnail(user.avatarURL());

		switch (commandName) {
			/** Rolls */
			case 'r':
				try {
					await interaction.reply({ embeds: [simple_roll(embed,options)] });
				} catch (error) { 
					// console.log(error)
					await interaction.reply( `That's not a counts!` )
				}
				break;
			case 'cr': await interaction.reply({ embeds: [cthulhu(embed,options)] }); break;
			case 'tr': await interaction.reply({ embeds: [tales(embed,options)] }); break;
			case 'fr': await interaction.reply({ embeds: [fate(embed,options)] }); break;
			case 'wr': await interaction.reply({ embeds: [warhammer(embed,options)] }); break;
			case 'dnd': await interaction.reply({ embeds: [dnd(embed,options)] }); break;
			case 'vr': await interaction.reply({ embeds: [vampire(embed,options)] }); break;
			case 'c': await interaction.reply({ embeds: [cult(embed,options)] }); break;
			case 'gr': await interaction.reply({ embeds: [glina(embed,options)] }); break;
			/** Others */
			case 'help': await interaction.reply({ ephemeral: true, embeds: [help(embed,options)] }); break;
			case 'supports': await interaction.reply({ ephemeral: true, embeds: [supports(embed,options)] }); break;
			// case 'quest':
			// 	break;
			// case 'ai':
			// 	await interaction.deferReply();
			// 	const response = await aiQuest(
			// 		'Jesteś pomocnikiem Mistrza Gry i wspierasz granie RPG. Opowiadasz zwięźle.'
			// 		,options.getString('prompt')
			// 		,500
			// 	);
			// 	await interaction.editReply(response.data.choices[0].text)
			// 	break;
			default:
				break;
		}
	} catch(error) {
		console.log(error)
		// saveDataToFile(`Error_${new Date().toISOString()}.txt`, error);
	}
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_API_KEY);