const { ActionRowBuilder } = require('discord.js');
const { roll } = require("../roll");
const { btnReRoll } = require('../templates');
const { changeNumber } = require('../bot-funcs');

const sysName = 'Cult';

const cult_roll = () => roll(2,10);

const cult = (embed,option) => {
	const [dieces, result] = cult_roll(),
		comment = option.getString('comment')||'',
		modifier = option.getInteger('modifier')||0,
		skill = option.getInteger('skill')||0;

	let title = '';
	if ( result + skill + modifier >= 15 ) {
		title = 'Success';
		embed.setColor('#47b300');
	}
	else if ( result + skill + modifier >= 9 ) {
		title = 'Success with consequence';
		embed.setColor('#FFA500');
	}
	else {
		title = 'Failure';
		embed.setColor('#e90036');
	}

	if (comment !== '') title += ` - ${comment}`;
    return {
        embeds: [embed
            .setFooter({text: sysName})
            .setTitle( title )
            .addFields(
                { 
                    name: `Result: ${result + skill + modifier} `,
                    value: `Rolled: ${dieces}`,
                    inline: true 
                },
                { 
                    name: `Skill: ${skill}`,
                    value: `Mod: ${modifier}`,
                    inline: true 
                },
            )
        ]
    }
}

module.exports = { cult };