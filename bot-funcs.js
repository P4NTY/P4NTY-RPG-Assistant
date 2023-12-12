//rolls functions
const { getResolve } = require("./roll");
//commands
const { rollsInfo } = require("./commands");

const MapNumber = {
    '-': ':heavy_minus_sign:',
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

const simple_roll = (embed,option) => {
	let result = getResolve(option.getString('command'));
	const comment = option.getString('comment')||'';
	if (comment !== '') embed.setTitle(`${comment}`);
	
	const sginToNumber = {
		':red_square:': -1,
		':black_large_square:': 0,
		':green_square:': 1
	};
	[':red_square:',':black_large_square:',':green_square:'].forEach( sgin => {
		result = result.replaceAll(sgin,sginToNumber[sgin])  
	})

	return embed.setColor('#03bcff')
		.setFooter({text: 'Own roll'})
		.addFields({
			name: `Result: ${changeNumber(eval(result))}`, 
			value: `Rolled: \` ${result.split('').join(' ')} \``, 
			inline: true
		});
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

module.exports = { changeNumber,simple_roll,supports,help};