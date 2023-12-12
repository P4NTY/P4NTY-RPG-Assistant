const { roll } = require("../roll");

const sysName = 'Glina';

const glina = (embed,option) => {
	const skill = option.getInteger('skill')||0,
		comment = option.getString('comment')||'',
		modifier = option.getInteger('modifier')||'';
	
	const result = roll( 1 , 6)[0][0];
	const threshold = roll(2, 10)[0];
    const answer = threshold.reduce( (agg,val) =>
        agg + (result + skill + modifier >= val ? 1 : 0)
    ,0)

	let title = '';
	[
        ()=>{
            title += 'Skucha';
            embed.setColor('#e90036');
        },
        ()=>{
            title += 'Fuks';
            embed.setColor('#FFA500');
        },
        ()=>{
            title += 'Triumf';
            embed.setColor('#47b300');
        }
    ][answer]();

	if ( threshold[0] === threshold[1] ) title += ' - Dublet';
	if (comment !== '') title += ` - ${comment}`;

    return { 
        embeds: [embed
		.setFooter({text: sysName})
		.setTitle( title )
		.addFields(
			{ 
                name: `Result: ${result + skill + modifier} `,
                value: `Rolled: ${result}`, 
                inline: true
            },
			{ 
                name: `Threshold: ${threshold}`,
                value: `Skill: ${skill}+${modifier}`,
                inline: true
            },
		)
    ] }
}

module.exports = { glina };