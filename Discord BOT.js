//Discord connection
const Discord = require('discord.js');
const client = new Discord.Client();
//Airtable connection
const Airtable = require('airtable');
const SessionBase = new Airtable({apiKey: 'TOKEN_2'}).base('appZVNPER2qH6vdnJ');
const SkillBase = new Airtable({apiKey: 'TOKEN_2'}).base('app5rtOzZ8X6ee5hU');

let MG = 'Kiszu';

const roll = (dice = 1, walls = 6) => {
    const result = [];

    if (dice > 1) {
        for (let index = 0; index < dice; index++) {
            result.push(Math.floor(Math.random() * walls) + 1);
        }
        return `[ ${result.join(' , ')} ]   :arrow_forward:   ${result.reduce( (acc,val) => acc + val , 0 )}`;
    }
    else {
        return `${Math.floor(Math.random() * walls) + 1}`;
    }
}

const c_roll = (bonus = 0, penal = 0) => {
    const unit = Math.floor(Math.random() * 10) + 1, dec = [];
    for (let i = 0 ; i <= Math.abs(bonus - penal) ; i++){
        dec.push((Math.floor(Math.random() * 10)) * 10 );
    }
    switch ( (bonus - penal)/(Math.abs(bonus - penal)) ) {
        case 1:
            return [unit + Math.min(...dec), [unit, ...dec]];
        case -1:
            return [unit + Math.max(...dec), [unit, ...dec]];
        default:
            return [unit + dec[0], [ unit, ...dec ]];
    }
}

const test_roll = (skill, bonus = 0, penal = 0, mod = 0) => {
    const [rolling, result] = c_roll(bonus, penal);

    if ( (rolling >= 96 && skill < 50) || rolling === 100 ){
        return [-2 + mod, rolling];
    }
    else if (skill < rolling) {
        return [-1 + mod, rolling, result];
    }
    else if ( rolling === 1 ){
        return [3 + mod, rolling, result];
    }
    else if ( skill/5 >= rolling ) {
        return [2 + mod, rolling, result];
    }
    else if ( skill/2 >= rolling ){
        return [1 + mod, rolling, result];
    }
    return [0 + mod, rolling, result];
}

// client.on('ready', () => {  });

const AddComment = (comment) => {
    if (comment.length > 0) return '    `' + comment + '`';
    else return '';
}

client.on('message', msg => {
    const value = [];
    let comment = '';
    if (msg.content.indexOf('`') > 0){
        comment = msg.content.split('`')[1];
        value.push(...msg.content.slice(0,msg.content.indexOf('`')).split(' '));
    }
    else {
        value.push(...msg.content.split(' '));
    }
    const [bonus, penal] = ([
        value.join()[value.join().indexOf('b') - 1],
        value.join()[value.join().indexOf('p') - 1]
    ]);
    let opt = ``;
    let send = false;

    switch (value[0].toLocaleLowerCase()) {
        //Roll
        case '/r':
            [ dice , walls ] = value[1] ? value[1].split('k') : [1,6];
            opt = roll( dice , walls );
            send = true;
            break;
        //Precent Roll
        case '/cr':
            [result, dice] = c_roll(bonus,penal);
            opt = `[ ${dice.join(' , ')} ]   :arrow_forward:   ${result}`;
            send = true;
            break;
        //Test Roll
        case '/tr':
            let mod = 0;
            switch (value[2]) {
                case '1/2':
                    mod = -1;
                    break;
                case '1/5':
                    mod = -2;
                    break;
                case '1/100':
                    mod = -3;
                    break;
                default:
                    break;
            }
            [ test , result, dice ] = test_roll(value[1], bonus, penal, mod);

            if ( test <= -1) {
                opt += `:x: Porażka    `
            }
            else {
                opt += `:white_check_mark: +${test + 1} Sukces   `
            }
            opt += `[ ${dice.join(' , ')} ]   :arrow_forward:   ${result}`;
            SessionBase('Rolling').create([
                {
                    "fields": {
                        "Who": msg.author.username,
                        "Roll": result,
                        "isSuccess": test >= 0,
                        "Comment": comment
                    }
                },
                ], function(err, records) {
                if (err) {
                    console.log(err)
                    return;
                }
                records.forEach(function (record) {
                    console.log(record.getId());
                });
            });
            send = true;
            break;
        case '/kiedy?':
            SessionBase('Session').select({
                maxRecords: 1,
                view: "Grid view",
                filterByFormula: "DATESTR(DATEADD(TODAY(),1,'days')) <= DATESTR(Day)"
            }).eachPage(function page(records, fetchNextPage) {
                records.forEach(function(record) {
                    opt += `
Kolejna sesja: ` + '`' + record.get('Name') + '`' + ` ${record.get('Day').split('T').join(' ').slice(0, 16)}

Dodaj sesję: https://airtable.com/shr3k4qZEPoe6KQkd
Kalendarz: https://airtable.com/shrsaT4rhoqXLvwt1
`;
                });
                msg.reply(opt);
            }, function done(err) {
                if (err) { console.error(err); return; }
            })
            break;
        case '/hr':
            [result, dice] = c_roll(bonus,penal);
            opt = `[ ${dice.join(' , ')} ]   :arrow_forward:   ${result}`;
            client.users.cache.get(client.users.cache.findKey( x => x.username ===  MG)).send(`${msg.author} ${opt}`);
            break;
        case '/setmg':
            const newMG = client.users.cache.get(client.users.cache.findKey( x => x.username ===  comment));
            if (typeof newMG !== 'undefined') {
                MG = comment;
                msg.reply(`zmieniłeś mistrza gry na ${newMG}`);
            }
            else {
                msg.reply(`przedwieczni nie chcą, by dany osobnik prowadził sesje`)
            }
            break;
        case '/pomocy!':
            opt = `
/r 2k6              \`rzut dwiema kośćmi sześciościennymi\`
/cr 2b 1p           \`rzut procentowy z dwiema kośćmi bonusowymi i jedną karną\`
/tr 50 1/2 2b 1p    \`rzut na umiejętność (wartość 50), na połowę (1/2) z dwiema kośćmi bonusowymi i jedną karną\`
/kiedy?             \`zwraca informację kiedy kolejna sesja, wraz z linkiem do kalendarza i formularzem do dodania nowej sesji\`
/hr 2b 1p           \`ukryty rzut /cr 2b 1p wysyłany do MG\`
/setMG \`Kiszu\`    \`ustawienie mistrza gry jako Kiszu\`
`;
            send = true;
            break;
        default:
            break;
    }
    if(send) {
        msg.reply(opt + AddComment(comment));
    }
});

client.login('TOKEN_1');
