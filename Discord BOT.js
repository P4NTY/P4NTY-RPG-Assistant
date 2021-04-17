//Discord connection
const Discord = require('discord.js');
const client = new Discord.Client();
//Airtable connection
const Airtable = require('airtable');
const SessionBase = new Airtable({apiKey: 'TOKEN_2'}).base('appZVNPER2qH6vdnJ');

const MG = {};

const MapMod = [
    {
        name: 'Trudny',
        short: '1/2',
        value: 2
    },
    {
        name: 'Ekstremalny',
        short: '1/5',
        value: 3
    },
    {
        name: 'Krytyczny',
        short: '1/100',
        value: 4
    }
]

const roll = (dice = 1, walls = 6) => {
    const result = [];
    if (dice > 1) {
        for (let index = 0; index < dice; index++)
            result.push(Math.floor(Math.random() * walls) + 1);
        return [result.reduce( (acc,val) => acc + val , 0 ), result];
    }
    else
        return [Math.floor(Math.random() * walls) + 1];
}

const c_roll = (bonus = 0, penal = 0) => {
    const unit = Math.floor(Math.random() * 10) + 1, dec = [];
    for (let i = 0 ; i <= Math.abs(bonus - penal) ; i++)
        dec.push((Math.floor(Math.random() * 10)) * 10 );
    switch ( (bonus - penal)/(Math.abs(bonus - penal)) ) {
        case 1:
            return [unit + Math.min(...dec), [unit, ...dec]];
        case -1:
            return [unit + Math.max(...dec), [unit, ...dec]];
        default:
            return [unit + dec[0], [ unit, ...dec ]];
    }
}

const test_roll = (skill, bonus = 0, penal = 0, mod = 1) => {
    const [rolling, result] = c_roll(bonus, penal);
    let counter = 0;
    if ( (rolling >= 96 && skill < 50) || rolling === 100 ) counter = -2;
    else if ( rolling === 1 ) counter = 3;
    else if ((skill/mod) < rolling) counter = -1;
    else if ( (skill/mod)/5 >= rolling ) counter = 2;
    else if ( (skill/mod)/2 >= rolling ) counter = 1;

    return [counter, rolling, result];
}

const tales_roll = (dice) => {
    const result = [];
    let iterator = 0;
    do {
        result.push( Math.floor(Math.random() * 6) + 1 );
        iterator++;
    }while( iterator < dice )

    return `[ ${ result.join(' , ') } ]  :arrow_forward:   ${ result.filter( res => res === 6 ).length}`;
}

const war_roll = (skill = '', mod = 0) => {
    const unit = Math.floor(Math.random() * 10) + 1;
    const dec = Math.floor(Math.random() * 10) * 10;
    const modifcator = mod !== 0 ? (mod > 0 ? '+' : '') + mod : ''
    return `${skill !== '' ? TestText( parseInt(skill/10)-parseInt(dec/10)-parseInt((unit+mod)/10) - 1 ) : ''} [ ${dec}, ${unit} ] ${modifcator}   :arrow_forward:   ${dec + unit + mod}`;
}

const dnd_roll = (bonus = 0, penal = 0, mod = 0) => {
    const result = [Math.floor(Math.random() * 20) + 1];
    for (let index = 0; index < bonus; index++) result.push(Math.floor(Math.random() * 20) + 1);
    const modifcator = mod !== 0 ? (mod > 0 ? '+' : '') + mod : '';

    let opt = `[ ${ result } ] ${modifcator}  :arrow_forward:   `;
    if (result[0] === 1) return `[ ${ result } ] ${modifcator}  :arrow_forward:   1`;
    switch ( (bonus - penal)/(Math.abs(bonus - penal)) ) {
        case 1:
            opt += `${Math.max(...result) + mod}`;
            break;
        case -1:
            opt += `${Math.min(...result) + mod}`;
            break;
        default:
            opt += `${result[0] + mod}`;
            break;
    }

    return opt;
}

// client.on('ready', () => {  });

const SaveRoll = (user, result, isSuccess, comment, isBonus) => {
    SessionBase('Rolling').create([
        {
            "fields": {
                "Who": user,
                "Roll": result,
                "isSuccess": isSuccess,
                "Comment": comment,
                "isBonus?": isBonus
            }
        },
    ],()=>{});
}

const help = `https://github.com/P4NTY/P4NTY-RPG-Assistant`;

const TestText = (test) => {
    if ( test <= -1 ) {
        return `:x: Porażka    `
    }
    else {
        return `(+${test + 1}) :white_check_mark: ${MapMod.map( x => x.value).indexOf(test + 1) !== -1
            ? MapMod[MapMod.map( x => x.value).indexOf(test + 1)].name
        : 'Zwykły'} Sukces   `;
    }
}

const When = (msg) => {
    SessionBase('Session').select({
        maxRecords: 1,
        view: "Grid view",
        filterByFormula: "DATESTR(DATEADD(TODAY(),0,'days')) <= DATESTR(Day)"
    }).eachPage(function page(records, fetchNextPage) {
        records.forEach(function(record) {
            msg.reply(`
Kolejna sesja: ` + '`' + record.get('Name') + '`' + ` ${new Date(record.get('Day')).toLocaleString()}

Dodaj sesję: https://airtable.com/shr3k4qZEPoe6KQkd
Kalendarz: https://airtable.com/shrsaT4rhoqXLvwt1
`);
        });
    }, function done(err) {
        if (err) { console.error(err); return; }
    })
}

client.on('message', msg => {
    const question = msg.content.split(' ');
    const option = question[0].toLocaleLowerCase();
    if (option[0] === '/'){
        const mod = [...question, '1/1'].filter(x=> x.indexOf('/') !== -1)[1].split('/')[1];
        const skill = question.filter(x=> !isNaN(parseInt(x)))[0];
        const comment = msg.content.split('`')[1]||'';
        const bonus = [...question, '0b'].map(x => x.toString().match(/[0-9]b/g)).filter(x => x)[0].toString().slice(0, -1);
        const penal = [...question, '0p'].map(x => x.toString().match(/[0-9]p/g)).filter(x => x)[0].toString().slice(0, -1);
        let opt = ``;
        let send = false;

        switch (option) {
            //Roll
            case '/r':
                try {
                    const query = [];
                    let count = '';
                    question.filter(x => x.indexOf('/') !== 0 && x.indexOf('`') === -1).join('').split('').filter(x => x !== ' ').forEach(x => {
                        switch(x){
                            case '+': case '-': case '*': case '/':
                                query.push(count,x);
                                count = '';
                                break;
                            default:
                                count += x;
                                break;
                        }
                    })
                    query.push(count);
                    const result = query.map( num => num.indexOf('k') !== -1 ? roll(num.split('k')[0],num.split('k')[1])[0] : num );
                    opt = `[ ${result.join(' ')} ]   :arrow_forward:   ${eval(result.join(''))}`;
                    send = true;
                } catch (error) {
                    console.error({
                        error: error,
                        msg: question
                    })
                }
                break;
            //Cthulhu Roll
            case '/cr':
                try {
                    if ( typeof skill === 'undefined' || skill.indexOf('b') !== -1 || skill.indexOf('p') !== -1 ){
                        [result, dice] = c_roll(bonus,penal);
                        opt = `[ ${dice.join(' , ')} ]   :arrow_forward:   ${result}`;
                    }
                    else {
                        [ test , result, dice ] = test_roll(skill, bonus, penal, mod);
                        opt += TestText(test);
                        opt += `[ ${dice.join(' , ')} ]   :arrow_forward:   ${result}`;
                        SaveRoll(msg.author.username, result, test >= 0, comment, parseInt(bonus) !== 0);
                    }
                    send = true;
                } catch (error) {
                    console.error({
                        error: error,
                        msg: question
                    })
                }
                break;
            //Warhammer roll
            case '/wr':
                try {
                    opt += war_roll(skill);
                    send = true;
                } catch (error) {
                    console.err({
                        error: error,
                        msg: question
                    })
                }
                break;
            //Tales from the loop roll
            case '/tr':
                try {
                    opt += tales_roll(skill);
                    send = true;
                } catch (error) {
                    console.err({
                        error: error,
                        msg: question
                    })
                }
                break;
            //Dungeons and Dragons roll
            case '/dr':
                try {
                    opt += dnd_roll(bonus, penal, skill);
                    send = true;
                } catch (error) {
                    console.err({
                        error: error,
                        msg: question
                    })
                }
                break;
            //Hide Cthulhu Roll
            case '/hcr':
                try {
                    [ test , result, dice ] = test_roll(skill, bonus, penal, mod);
                    opt += TestText(test);
                    opt += `[ ${dice.join(' , ')} ]   :arrow_forward:   ${result}`;
                    client.users.cache.get(client.users.cache.findKey( x => x.username ===  MG[msg.author.lastMessageChannelID])).send(`${msg.author} ${opt}`);
                    SaveRoll(msg.author.username, result, test >= 0, comment, parseInt(bonus) !== 0);
                } catch (error) {
                    console.error({
                        error: error,
                        msg: question
                    })
                }
                break;
            //Hide D&D Roll
            case '/hdr':
                try {
                    opt += dnd_roll(bonus, penal, skill);
                    client.users.cache.get(client.users.cache.findKey( x => x.username ===  MG[msg.author.lastMessageChannelID])).send(`${msg.author} ${opt}`);
                } catch (error) {
                    console.error({
                        error: error,
                        msg: question
                    })
                }
                break;
            //Hide Warhammer Roll
            case '/hwr':
                try {
                    opt += war_roll(skill);
                    client.users.cache.get(client.users.cache.findKey( x => x.username ===  MG[msg.author.lastMessageChannelID])).send(`${msg.author} ${opt}`);
                } catch (error) {
                    console.error({
                        error: error,
                        msg: question
                    })
                }
                break;
            //Hide Tales Roll
            case '/htr':
                try {
                    opt += tales_roll(skill);
                    client.users.cache.get(client.users.cache.findKey( x => x.username ===  MG[msg.author.lastMessageChannelID])).send(`${msg.author} ${opt}`);
                } catch (error) {
                    console.error({
                        error: error,
                        msg: question
                    })
                }
                break;
            //Set MG
            case '/setmg':
                try {
                    const newMG = client.users.cache.get(client.users.cache.findKey( x => x.username ===  comment));
                    if (typeof newMG !== 'undefined') {
                        MG[msg.author.lastMessageChannelID] = comment;
                        msg.reply(`zmieniłeś mistrza gry na ${newMG}`);
                    }
                    else
                        msg.reply(`przedwieczni nie chcą, by dany osobnik prowadził sesje`);
                } catch (error) {
                    console.error({
                        error: error,
                        msg: question
                    })
                }
                break;
            //Help!
            case '/pomocy!':
                opt = help;
                send = true;
                break;
            //Kiedy?
            case '/kiedy?':
                When(msg);
                break;
            default:
                break;
        }
        if(send) {
            msg.reply(opt + (comment.length ? ' `' + comment + '`' : '') );
        }
    }
});

client.login('TOKEN_1');
