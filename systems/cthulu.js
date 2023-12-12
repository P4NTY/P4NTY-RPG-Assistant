const { ActionRowBuilder } = require('discord.js');
const { roll } = require("../roll");
const { btnReRoll, btnWarn, btnInfo } = require('../templates');
const { changeNumber } = require('../bot-funcs');

const sysName = 'Call of Cthulhu 7ed';

const c_roll = (bonus = 0, penal = 0) => {
    const unit = roll(1,10)[0], dec = [];
    for (let i = 0; i <= Math.abs(bonus - penal); i++) dec.push((Math.floor(Math.random() * 10)) * 10);
    switch ((bonus - penal) / (Math.abs(bonus - penal))) {
        case 1:
            return [parseInt(unit) + Math.min(...dec), [unit, ...dec]];
        case -1:
            return [parseInt(unit) + Math.max(...dec), [unit, ...dec]];
        default:
            return [parseInt(unit) + dec[0], [unit, ...dec]];
    }
}

const test_roll = (skill, bonus = 0, penal = 0, mod = 1) => {
    const [rolling, result] = c_roll(bonus, penal);
    let counter = 2;
    if ((rolling >= 96 && skill <= 50) || rolling === 100) counter = 0;
    else if (rolling === 1) counter = 5;
    else if ((skill / mod) < rolling) counter = 1;
    else if ((skill / mod) / 5 >= rolling) counter = 4;
    else if ((skill / mod) / 2 >= rolling) counter = 3;

    return [counter, rolling, result];
}

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
		title = ':green_square: Success';
	},
	()=>{
		embed.setColor('#52cc00');
		title = ':white_check_mark: Hard Success';
	},
	()=>{
		embed.setColor('#5ce600');
		title = ':sparkle: Extreme Success';
	},
	()=>{
		embed.setColor('#66ff00');
		title = ':sparkler: Critical Success';
	},][test]();

	if (comment !== '') title += `- ${comment}`;

    return { embeds: [
        embed
		.setTitle( `${title}` )
		.setFooter({text: sysName})
		.addFields(
			{ 
                name: `Result: ${changeNumber(result)} `,
                value: `Rolled: ${dice.join(' , ')}`,
                inline: true
            },
			{ 
                name: `Skill: ${option.getInteger('skill')||0}`, 
                value: `Add dice: (${bonus}-${penalty})`,
                inline: true
            },
		)
    ],
    components: [
        new ActionRowBuilder().addComponents(
            ...[ 
                test <= 1 ? btnReRoll().setCustomId(
                    JSON.stringify(({
                        name: 'cr',
                        skill: skill,
                        bonus: bonus,
                        penalty: penalty,
                    }))
                ) : null,
                test <= 1 ? btnWarn()
                .setCustomId('luck_info')
                .setLabel( `🍀 ${result - skill}` ) : null,
                ,btnInfo()
                    .setCustomId('1/2_info')
                    .setLabel( `1/2: ${Math.floor(skill/2)}` )
                ,btnInfo()
                    .setCustomId('1/5_info')
                    .setLabel( `1/5: ${Math.floor(skill/5)}` )
            ].filter( x => x)
        )
    ] }
}

const cthulhuReRoll = (embed, {skill, bonus, penalty}) => {
    const [test, result, dice] = test_roll(skill, bonus, penalty);
    let title = '';
	
	[()=>{
		embed.setColor('#ff033e');
		title = ':anger: Critical Fail';
	},
	()=>{
		embed.setColor('#b6002a');
		title = ':x: Critical Fail';
	},
	()=>{
		embed.setColor('#47b300');
		title = ':green_square: Success';
	},
	()=>{
		embed.setColor('#52cc00');
		title = ':white_check_mark: Hard Success';
	},
	()=>{
		embed.setColor('#5ce600');
		title = ':sparkle: Extreme Success';
	},
	()=>{
		embed.setColor('#66ff00');
		title = ':sparkler: Critical Success';
	},][test]();

    return { embeds: [
        embed
        .setTitle(`! Re-Roll ! - ${title}`)
        .setFooter({text: sysName})
        .addFields(
			{ 
                name: `Result: ${changeNumber(result)} `,
                value: `Rolled: ${dice.join(' , ')}`,
                inline: true
            },
			{ 
                name: `Skill: ${skill}`, 
                value: `Add dice: (${bonus}-${penalty})`,
                inline: true
            },
		)
    ],
    components: [
        new ActionRowBuilder().addComponents(
            ...[
                test <= 1 ?
                    btnWarn()
                        .setCustomId('luck_info')
                        .setLabel( `🍀 ${result - skill}` )
                : null,
                btnInfo()
                    .setCustomId('1/2_info')
                    .setLabel( `1/2: ${Math.floor(skill/2)}` )
                ,btnInfo()
                    .setCustomId('1/5_info')
                    .setLabel( `1/5: ${Math.floor(skill/5)}` )
            ].filter(x => x)
        )
    ] }
}

module.exports = { cthulhu, cthulhuReRoll };