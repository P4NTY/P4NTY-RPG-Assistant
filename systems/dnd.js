const { ActionRowBuilder } = require('discord.js');
const { roll } = require("../roll");
const { btnReRoll, btnWarn, embed } = require('../templates');
const { changeNumber } = require('../bot-funcs');

const sysName = 'Dungeons and Dragons 5ed';

const dnd_roll = () =>  roll(1,20);

const dnd = (embed, option) => {
	const result = dnd_roll();
	const mod = option.getInteger('modifier')||null;
	// const difficulty = option.getInteger('difficulty')||'';
	const comment = option.getString('comment')||'';
	let title = '';
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
	if (comment !== '') title += ` - ${comment}`;

    return { embeds: [
        embed
		.setFooter({text: sysName})
		.setTitle( title||null )
		.addFields(
			{ 
				name: `Result: ${changeNumber(parseInt(result) + parseInt(mod||0))} `, 
				value: `Rolled: ${result}`, 
				inline: true
			},
			{ 
                name: `\u200B`,
                value: `Mod: ${mod||0}`,
                inline: true
            },
		) 
    ] }
}

const dndReRoll = ( embed, {}) => {

}

module.exports = { dnd }