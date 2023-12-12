const { ActionRowBuilder } = require('discord.js');
const { roll } = require("../roll");
const { btnReRoll } = require('../templates');

const sysName = 'Tales from the Loop';

const tales_roll = (dice) => {
    const result = roll(dice,6)[0];
    return [result, result.filter( res => res === 6 ).length];
}

const tales = (embed,option) => {
	const [dices, result] = tales_roll(option.getInteger('skill'));
	const comment = option.getString('comment')||'';

	if (comment !== '') embed.setTitle( `${comment}` );

    return  {
        embeds: [ 
            embed
                .setFooter({text: sysName})
                .setColor(result > 0 ? '#03bcff' : '#000000')
                .addFields({
                    name: `Result: ${changeNumber(parseInt(result))}`,
                    value: `Rolled: \` ${dices} \``
                }) 
        ],
        components: [ new ActionRowBuilder().addComponents(
            btnReRoll().setCustomId(
                JSON.stringify(({
                    name: 'tr',
                    dices: dices,
                    result: result
                }))
            )
        ) ]
    }
}

const talesReRoll = (embed, {result, dices}) => {
    const [r_dices, r_result ] = tales_roll(dices.length - result);

    return embed
        .setTitle('! Re-Roll !')
        .setFooter({text: sysName})
        .setColor(r_result + result > 0 ? '#03bcff' : '#000000')
        .addFields({
            name: `Result: ${changeNumber(parseInt(result))} + ${changeNumber(parseInt(r_result))}`,
            value: `Re-Rolled: \` ${r_dices} \``
        })
}

module.exports = { tales, talesReRoll };