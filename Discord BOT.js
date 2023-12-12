require('dotenv').config();
// Require the necessary discord.js classes
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
//functions
const { supports,help, simple_roll } = require('./bot-funcs');                     
const { saveDataToFile } = require('./utils')
const { aiQuest } = require('./ai')
//commands
const { comandJSON } = require('./commands');
const { cthulhu, cthulhuReRoll } = require('./systems/cthulu');
const { vampire, vampireReRoll } = require('./systems/vampire');
const { tales, talesReRoll } = require('./systems/tales');
const { cult } = require('./systems/cult');
const { glina } = require('./systems/glina');
const { fate, fateReRoll } = require('./systems/fate');
const { dnd } = require('./systems/dnd');
const { warhammer } = require('./systems/warhammer');
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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
			embed = new EmbedBuilder()
				.setAuthor({ name: `${member.nickname||user.username}`})
				.setThumbnail(user.avatarURL());

		if (interaction.isButton()) {
			let reOptions = JSON.parse(interaction.customId);
			switch (reOptions.name) {
				case 'tr':
					await interaction.reply({ embeds: [talesReRoll(embed,reOptions)] });
				break;
				case 'vr':
					await interaction.reply({ embeds: [vampireReRoll(embed,reOptions)] });
				break;
				case 'cr':
					await interaction.reply( cthulhuReRoll(embed,reOptions) );
				break;
				case 'fr':
					await interaction.reply({ embeds: [fateReRoll(embed,reOptions)] });
				break;
				default:break;
			}
		}
		switch (commandName) {	
			/** Rolls */
			case 'r':
				try {
					await interaction.reply({ embeds: [simple_roll(embed,options)] });
				} catch (error) { 
					console.log(error)
					await interaction.reply( `That's not a counts!` )
				}
				break;
			case 'cr': await interaction.reply( cthulhu(embed,options) ); break;
			case 'tr': await interaction.reply( tales(embed, button, options) ); break;
			case 'fr': await interaction.reply( fate(embed,options) ); break;
			case 'wr': await interaction.reply( warhammer(embed,options) ); break;
			case 'dnd': await interaction.reply( dnd(embed,options) ); break;
			case 'vr': await interaction.reply( vampire(embed,options) ); break;
			case 'c': await interaction.reply( cult(embed,options) ); break;
			case 'gr': await interaction.reply( glina(embed,options) ); break;
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