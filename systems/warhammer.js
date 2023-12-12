const { ActionRowBuilder } = require('discord.js');
const { roll } = require("../roll");
const { btnReRoll, btnWarn } = require('../templates');
const { changeNumber } = require('../bot-funcs');

const sysName = 'Warhammer 4ed';

const war_roll = (skill, mod = 0) => {
    const [unit] = roll(1,10)[0];
    const dec = Math.floor(Math.random() * 10) * 10;
    let count = 0;
    let critic = 0;

    if (unit + dec <= 5 ) count = Math.max(1, parseInt((skill+mod)/10)-parseInt((dec+unit)/10));
    else if (unit + dec > 95 ) count = Math.min( -1, parseInt((skill+mod)/10)-parseInt((dec+unit)/10) );
    else count = parseInt((skill+mod)/10)-parseInt((dec+unit)/10);

    if ( unit === dec/10 ) critic = Math.round( (skill + mod - unit - dec)/(Math.abs(skill + mod - unit - dec)) )||1;

    return [ count,critic, [unit,dec], parseInt(dec)+parseInt(unit) ];
}

const warhammer = (embed,option) => {
	const [count,critic, dices, result] = war_roll(option.getInteger('skill'),option.getInteger('modifier'));
	const comment = option.getString('comment')||'';
	let title = count + ' ';
	
	[()=>{
		embed.setColor('#ff033e');
		title += ':anger: Critical Fail ';
	},
	()=>{
		 if (result <= ( option.getInteger('skill') + option.getInteger('modifier')||0 ) ) {
			embed.setColor('#47b300');
			title += ':white_check_mark: Success ';
		}
		else {
			embed.setColor('#b6002a');
			title += ':x: Fail ';
		}
	},
	()=>{
		embed.setColor('#66ff00');
		title += ':sparkler: Critical Success ';
	}][critic+1]();

	if (comment !== '') title += ` - ${comment}`;

    return { embeds: [
        embed
		.setFooter({text: sysName})
		.setTitle( title )
		.addFields(
			{
                name: `Result: ${changeNumber(result)} `,
                value: `Rolled: \` ${dices} \``,
                inline: true
            },
			{
                name: `Skill: ${option.getInteger('skill')}`,
                value: `Mod: ${option.getInteger('modifier')||0}`,
                inline: true
            },
		)
    ] }
}

module.exports = { warhammer,  }