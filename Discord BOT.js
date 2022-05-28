// Require the necessary discord.js classes
const { Client, Intents, APIMessage, MessageActionRow, MessageButton, MessageEmbed  } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
//rolls functions
const { test_roll, tales_roll, war_roll, dnd_roll, fate_tf_roll, getResolve, vampire_roll } = require("./roll");
//functions
const { SaveRoll, Help, TestText, When, Notification, Settings, fnError, ManageServer, Card, changeNumber } = require('./bot-funcs');
//commands
const {commands} = require('./commands');
const e = require('express');
// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
// Place your client and guild ids here
const clientId = 'id';

const rest = new REST({ version: '9' }).setToken('token_2');

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

// When the client is ready, run this code (only once)
client.once('ready', () => { console.log('Ready!'); });

const cthulhu = (embed,option) => {
	const skill = option.getInteger('skill');
	const bonus = option.getInteger('bonus')||0;
	const penalty = option.getInteger('penalty')||0;
	const [test, result, dice] = test_roll(skill, bonus, penalty);
	const comment = option.getString('comment')||'';

	let title = '';
	
	[()=>{
		embed.setColor('#ff033e');
		title = ':anger: Critical Fail';
	},
	()=>{
		embed.setColor('#b6002a');
		title = ':x: Fail';
	},
	()=>{
		embed.setColor('#47b300');
		title = ':green_square: Sukcess';
	},
	()=>{
		embed.setColor('#52cc00');
		title = ':white_check_mark: Hard Sukcess';
	},
	()=>{
		embed.setColor('#5ce600');
		title = ':sparkle: Extreme Sukcess';
	},
	()=>{
		embed.setColor('#66ff00');
		title = ':sparkler: Critical Sukcess';
	},][test]();

	return embed
		.setTitle( `${title} ${comment}` )
		.setFooter({text: 'Call of Cthulhu 7ed'})
		.addFields(
			{ name: `Result: ${changeNumber(result)} `, value: `Rolled: ${dice.join(' , ')}`, inline: true },
			{ name: `Skill: ${option.getInteger('skill')||0}`, value: `Add dice: (${bonus}-${penalty})`, inline: true },
		)
}
const tales = (embed,option) => {
	const [dices, result] = tales_roll(option.getInteger('skill'));
	const comment = option.getString('comment')||'';

	if (comment !== '') embed.setTitle( `${comment}` );

	return embed
		.setFooter({text: 'Tales from the Loop'})
		.setColor(result > 0 ? '#03bcff' : '#000000')
		.addField(`Result: ${changeNumber(parseInt(result))} `, `Rolled: \` ${dices} \``)
}
const fate = (embed,option) => {
	const [dices, result] = fate_tf_roll(4),
		comment = option.getString('comment')||''
		diff = option.getInteger('difficult')||0,
		skill = option.getInteger('skill')||0;
	
	if (comment !== '') embed.setTitle(`${comment}`);
	
	if ( result + skill > diff ) embed.setColor('#66ff00');
	else if ( result + skill === diff ) embed.setColor('#000000');
	else embed.setColor('#ff033e');

	return embed
		.setFooter({text: 'Fate'})
		.addFields(
			{ name: `Result: ${changeNumber(result + skill - diff)} `, value: `Rolled: ${dices}`, inline: true },
			{ name: `Skill: ${skill||0}`, value: `Difficult: ${diff}`, inline: true },
		)
}
const warhammer = (embed,option) => {
	const [count,critic, dices, result] = war_roll(option.getInteger('skill'),option.getInteger('modyficator'));
	const comment = option.getString('comment')||'';
	let title = count + ' ';
	
	[()=>{
		embed.setColor('#ff033e');
		title += ':anger: Critical Fail ';
	},
	()=>{
		 if (result <= ( option.getInteger('skill') + option.getInteger('modyficator')||0 ) ) {
			embed.setColor('#47b300');
			title += ':white_check_mark: Sukcess ';
		}
		else {
			embed.setColor('#b6002a');
			title += ':x: Fail ';
		}
	},
	()=>{
		embed.setColor('#66ff00');
		title += ':sparkler: Critical Sukcess ';
	}][critic+1]();

	if (comment !== '') title += `${comment}`;
	return embed
		.setFooter({text: 'Warhammer 4ed'})
		.setTitle( title )
		.addFields(
			{ name: `Result: ${changeNumber(result)} `, value: `Rolled: \` ${dices} \``, inline: true },
			{ name: `Skill: ${option.getInteger('skill')}`, value: `Mod: ${option.getInteger('modyficator')||0}`, inline: true },
		)
}
const dnd = (embed, option) => {
	const result = dnd_roll();
	const mod = option.getInteger('modyficator')||'';
	const comment = option.getString('comment')||'';
	let title = '';
	let desc = `[ ${result} ]`
	switch (result) {
		case 20:
			title = ':sparkler: Natural :two::zero: ';
			embed.setColor('#66ff00');
			break;
		case 1:
			title = ':anger: Fail :game_die: ';
			embed.setColor('#ff033e');
			break;
		default:
			embed.setColor('#03bcff');
			break;
	}
	if (comment !== '') title += `${comment}`;
	if (mod) desc += ' ' + (mod > 0 ? '+'+mod : mod);

	return embed
		.setFooter({text: 'Dungeons and Dragons 5ed'})
		.setTitle( title )
		.addFields(
			{ name: `Result: ${changeNumber(parseInt(result) + parseInt(mod||0))} `, value: `Rolled: ${result}`, inline: true },
			{ name: `\u200B`, value: `Mod: ${mod||0}`, inline: true },
		)
}

const simple_roll = (embed,option) => {
	const result = getResolve(option.getString('command'));
	const comment = option.getString('comment')||'';
	if (comment !== '') embed.setTitle(`${comment}`);
	return embed.setColor('#03bcff')
		.setFooter({text: 'Own roll'})
		.addField(`Result: ${changeNumber(eval(result))} `, `Rolled: \` ${result.split('').join(' ')} \``);
}

const vampire = (embed,option) => {
	const hunger = option.getInteger('hunger')||0,
		pool = option.getInteger('pool') - hunger,
		[blood, skull, critic, result,dices_pool,dices_hunger ] = vampire_roll(pool,hunger),
		diff = option.getInteger('difficult')||0,
		answer = result >= diff ? (result >= diff) + (critic > 0) + (blood > 0) : (skull > 0)*-1,
		comment = option.getString('comment')||'';
	let title = '';

	[()=>{
		title = ':thermometer: Bestial Failure';
		embed.setColor('#b6002a');
	},
	()=>{
		title = 'Failure';
		embed.setColor('#000000');
	},
	()=>{
		title = 'Sukcess';
		embed.setColor('#47b300');
	},
	()=>{
		title = 'Sukcess Critic';
		embed.setColor('#66ff00');
	},
	()=>{
		title = ':drop_of_blood: Messy Critical';
		embed.setColor('#e90036');
	}][answer + 1]();

	if (comment !== '') title += ` ${comment}`;

	return embed
		.setFooter({text: 'Vamipre 5ed'})
		.setTitle( title )
		.addFields(
			{ name: `Result: ${changeNumber(result)} `, value: `Difficult: ${diff}`, inline: true },
			{ name: `Pool: \`${dices_pool.join(' ')}\``, value: `Hunger: \`${dices_hunger.join(' ')}\``, inline: true },
		)
}

client.on('interactionCreate', async interaction => {
	if ( !interaction.isCommand() && !interaction.isButton() ) return;
	const { commandName, options, user } = interaction,
		  embed = new MessageEmbed()
			.setAuthor({ name: user.username})
			.setThumbnail(user.avatarURL());
	
	switch (commandName) {
		case 'r':
			try {
				await interaction.reply({ embeds: [simple_roll(embed,options)]});
			} catch (error) { await interaction.reply( `That's not a counts!` ) }
			break;
		case 'cr': await interaction.reply({ embeds: [cthulhu(embed,options)]}); break;
		case 'tr': await interaction.reply({ embeds: [tales(embed,options)]}); break;
		case 'fr': await interaction.reply({ embeds: [fate(embed,options)]}); break;
		case 'wr': await interaction.reply({ embeds: [warhammer(embed,options)]}); break;
		case 'dnd': await interaction.reply({ embeds: [dnd(embed,options)]}); break;
		case 'vr': await interaction.reply({ embeds: [vampire(embed,options)]}); break;
		case 'quest':
			break;
		default:
			break;
	}
});

// Login to Discord with your client's token
client.login('token_1');


