const { ActionRowBuilder } = require('discord.js');
const { roll } = require("../roll");
const { btnReRoll } = require('../templates');
const { changeNumber } = require('../bot-funcs');

const sysName = 'Vamipre 5ed';

const symbols = (value, color) => {
    if ( color === 'black') {
        if (value == 10 ) return '<:vampire10black:980948486579183656>';
        else if (value > 5) return '<:vampireblack:980948486738550795>';
        else return '<:blackdot:980948486277181462>';
    }
    else {
        if (value == 1) return '<:vampireskullred:980948486298161254>';
        else if (value == 10) return '<:vampire10red:980948487363518464>';
        else if (value > 5) return '<:vampirered:980948486570790922>';
        else return '<:reddot:980948486247821375>';
    }
}

const vampire_roll = (pool, hunger ) => {
    const dices_pool = pool ? roll(pool,10)[0] : [];
    const dices_hunger = hunger ? roll(hunger,10)[0] : [];
    const critic = ([ ...dices_pool, ...dices_hunger  ].filter( value => value === 10 ).length - ([ ...dices_pool, ...dices_hunger  ].filter( value => value === 10 ).length%2));

    return [
        dices_hunger.filter( value => value === 10 ).length,
        dices_hunger.filter( value => value === 1 ).length,
        critic,
        [ ...dices_pool, ...dices_hunger  ].filter( value => value > 5).length + critic,
        dices_pool,
        dices_hunger
    ];
}

const vampire = (embed,option) => {
	const hunger = option.getInteger('hunger')||0,
		pool = option.getInteger('pool') - hunger,
		[blood,skull,critic,result,dices_pool,dices_hunger ] = vampire_roll(pool,hunger),
		diff = option.getInteger('difficulty')||0,
		answer = result >= diff ? (result >= diff) + (critic > 0) + (critic > 0 && blood > 0) : (skull > 0)*-1,
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
        title = 'Success';
        embed.setColor('#47b300');
    },
    ()=>{
        title = 'Success Critic';
        embed.setColor('#66ff00');
    },
    ()=>{
        title = ':drop_of_blood: Messy Critical';
        embed.setColor('#e90036');
    }][answer + 1]();

	if (comment !== '') title += ` - ${comment}`;
    
    return {
        embeds: [embed
            .setFooter({text: sysName})
            .setTitle( title )
            .setDescription(
                `${dices_pool.map( value => symbols(value,'black') ).join('')}${dices_hunger.map( value => symbols(value,'red') ).join('')}`
            )
		    .addFields({ 
                name: `Result: ${changeNumber(result)} `, 
                value: `Difficulty: ${diff}`,
                inline: true 
            })
        ],
        components: answer === 0 && pool ? [
            new ActionRowBuilder().addComponents(
                btnReRoll().setCustomId(
                    JSON.stringify(({
                        name: 'vr',
                        saved: result,
                        pool: dices_pool.filter( x => x < 6 ).length,
                        diff: diff
                    }))
                )
            )
        ] : [] 
    }
}

const vampireReRoll = (embed, {saved, pool, diff}) => {
    const [blood,skull,critic,result,dices_pool,dices_hunger ] = vampire_roll(pool,0);
    const answer = (result + saved) >= diff ? 
        ((result + saved) >= diff) + (critic > 0) + (critic > 0 && blood > 0)
        : (skull > 0)*-1;

    [()=>{
        title = ':thermometer: Bestial Failure';
        embed.setColor('#b6002a');
    },
    ()=>{
        title = 'Failure';
        embed.setColor('#000000');
    },
    ()=>{
        title = 'Success';
        embed.setColor('#47b300');
    },
    ()=>{
        title = 'Success Critic';
        embed.setColor('#66ff00');
    },
    ()=>{
        title = ':drop_of_blood: Messy Critical';
        embed.setColor('#e90036');
    }][answer + 1]();
 
    return embed
        .setTitle(`! Re-Roll ! - ${title}`)
        .setFooter({text: sysName})
        .setDescription(
            `${dices_pool.map( value => symbols(value,'black') ).join('')}`
        )
        .addFields({ 
            name: `Result: ${changeNumber(saved)} + ${changeNumber(result)} `, 
            value: `Difficulty: ${diff}`,
            inline: true 
        })
}

module.exports = { vampire, vampireReRoll }