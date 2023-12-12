const { ActionRowBuilder } = require('discord.js');
const { fate_tf_roll } = require("../roll");
const { btnReRoll, btnWarn } = require('../templates');
const { changeNumber } = require('../bot-funcs');

const sysName = 'Fate';

const fate = (embed,option) => {
	const [dices, result] = fate_tf_roll(4),
		comment = option.getString('comment')||''
		diff = option.getInteger('difficulty')||0,
		skill = option.getInteger('skill')||0;
	
	if (comment !== '') embed.setTitle(`${comment}`);
	
	if ( result + skill > diff ) embed.setColor('#66ff00');
	else if ( result + skill === diff ) embed.setColor('#000000');
	else embed.setColor('#ff033e');

    return { embeds: [
        embed
		.setFooter({text: sysName})
		.addFields(
			{
                name: `Result: ${changeNumber(result + skill - diff)} `,
                value: `Rolled: ${dices.join(' ')}`,
                inline: true
            },
			{
                name: `Skill: ${skill||0}`,
                value: `Difficulty: ${diff}`,
                inline: true
            },
		)
    ],
    components: result + skill < diff ? [
        new ActionRowBuilder().addComponents(
            btnReRoll().setCustomId(
                JSON.stringify(({
                    name: 'fr',
                    skill: skill,
                    diff: diff
                }))
            )
        )
    ] : []}
}
const fateReRoll = (embed, {skill, diff}) => {
    const [dices, result] = fate_tf_roll(4);

    if ( result + skill > diff ) embed.setColor('#66ff00');
	else if ( result + skill === diff ) embed.setColor('#000000');
	else embed.setColor('#ff033e');

    return embed
        .setTitle(`! Re-Roll !`)
        .setFooter({text: sysName})
        .addFields(
            {
                name: `Result: ${changeNumber(result + skill - diff)} `,
                value: `Rolled: ${dices.join(' ')}`,
                inline: true
            },
            {
                name: `Skill: ${skill||0}`,
                value: `Difficulty: ${diff}`,
                inline: true
            },
        )
}

module.exports = { fate, fateReRoll }