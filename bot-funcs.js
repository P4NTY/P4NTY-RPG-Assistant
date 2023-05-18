//rolls functions
const { test_roll, tales_roll, war_roll, dnd_roll, fate_tf_roll, getResolve, vampire_roll, cult_roll } = require("./roll");
//commands
const { rollsInfo } = require("./commands");

const MapNumber = {
    '-': ':no_entry:',
    '0': ':zero:',
    '1': ':one:',
    '2': ':two:',
    '3': ':three:',
    '4': ':four:',
    '5': ':five:',
    '6': ':six:',
    '7': ':seven:',
    '8': ':eight:',
    '9': ':nine:',
};

const changeNumber = (value) => value.toString().split('').map( char => MapNumber[char]||'').join('');

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

	return embed
		.setTitle( `${title}` )
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
		diff = option.getInteger('difficulty')||0,
		skill = option.getInteger('skill')||0;
	
	if (comment !== '') embed.setTitle(`${comment}`);
	
	if ( result + skill > diff ) embed.setColor('#66ff00');
	else if ( result + skill === diff ) embed.setColor('#000000');
	else embed.setColor('#ff033e');

	return embed
		.setFooter({text: 'Fate'})
		.addFields(
			{ name: `Result: ${changeNumber(result + skill - diff)} `, value: `Rolled: ${dices.join(' ')}`, inline: true },
			{ name: `Skill: ${skill||0}`, value: `Difficulty: ${diff}`, inline: true },
		)
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
	return embed
		.setFooter({text: 'Warhammer 4ed'})
		.setTitle( title )
		.addFields(
			{ name: `Result: ${changeNumber(result)} `, value: `Rolled: \` ${dices} \``, inline: true },
			{ name: `Skill: ${option.getInteger('skill')}`, value: `Mod: ${option.getInteger('modifier')||0}`, inline: true },
		)
}
const dnd = (embed, option) => {
	const result = dnd_roll();
	const mod = option.getInteger('modifier')||'';
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
	const hunger = option.getInteger('hunger')||0,
		pool = option.getInteger('pool') - hunger,
		[blood, skull, critic, result,dices_pool,dices_hunger ] = vampire_roll(pool,hunger),
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

	return embed
		.setFooter({text: 'Vamipre 5ed'})
		.setTitle( title )
		.addFields(
			{ name: `Result: ${changeNumber(result)} `, value: `Difficulty: ${diff}`, inline: true },
			{ 
				name: `Pool: ${dices_pool.map( value => symbols(value,'black') ).join('')}`,
				value: `Hunger: ${dices_hunger.map( value => symbols(value,'red') ).join('')}`,
				inline: true
			},
		)
}

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

	return embed
		.setFooter({text: 'Cult'})
		.setTitle( title )
		.addFields(
			{ name: `Result: ${result + skill + modifier} `, value: `Rolled: ${dieces}`, inline: true },
			{ name: `Skill: ${skill}`, value: `Mod: ${modifier}`, inline: true },
		)
}

const help = (embed) => {
	const fields = rollsInfo().map( roll => {
		return {
			name: roll.name,
			value: roll.expample,
			inline: false
		}
	});

	return embed
		.addFields( ...fields )
		.setAuthor({
			name: 'ᖽᐸᓰSᗱᑘ',
			iconURL: 'https://yt3.ggpht.com/ytc/AKedOLQnG6Ge0GAOdr-SwBmXyHL0D7dxdHdoh8ss-iYf=s88-c-k-c0x00ffffff-no-rj',
			url: 'https://kiszu.pl/'
		})
		.setColor('#0099ff')
		.setTitle('Hi!')
		.setURL('https://kiszu.pl/RPG_assistant.html')
}

const supports = (embed) => embed
	.setColor('#0099ff')
	.setTitle('Hi, buy me a coffie!')
	.setURL('https://www.buymeacoffee.com/kiszu')
	.setAuthor({
		name: 'ᖽᐸᓰSᗱᑘ',
		iconURL: 'https://yt3.ggpht.com/ytc/AKedOLQnG6Ge0GAOdr-SwBmXyHL0D7dxdHdoh8ss-iYf=s88-c-k-c0x00ffffff-no-rj',
		url: 'https://kiszu.pl/'
	})
	.setDescription('I\'m glad that, you want support this project!')
	.setThumbnail('https://kiszu.pl/assets/img/portfolio/hand1.png')

module.exports = { changeNumber,simple_roll,cthulhu,tales,fate,warhammer,dnd,vampire,supports,help, cult };