const { Client } = require('discord.js');
const client = new Client();
//rolls functions
const { roll, c_roll, test_roll, tales_roll, war_roll, dnd_roll, fate_tf_roll, tf_roll } = require("./roll");
//functions
const { SaveRoll, Help, TestText, When, Notification, Settings, fnError, ManageServer } = require('./bot-funcs');
//rolls api
const api = 'https://rpg-assistant.herokuapp.com/roll';

const MG = {};

const notifyTime = [10,0];

const getSkill = (msg) => msg.match(/\d+/g).length ? msg.match(/\d+/g)[0] : undefined;
const getBonus = (msg) => [...msg.split(' '), '0b'].map(x => x.toString().match(/[0-9]b/g)).filter(x => x)[0].toString().slice(0, -1);
const getPenal = (msg) => [...msg.split(' '), '0p'].map(x => x.toString().match(/[0-9]p/g)).filter(x => x)[0].toString().slice(0, -1);
const getMod = (command, msg) =>  {
    switch (command) {
        case '/cr': 
            return msg.concat(' 1/1').match(/1\/\d+/g)[0].split('/')[1];
        case '/wr':
        case '/dr':
            return msg.concat(' +0').match(/[+,-]\d+/g)[0].slice(1);
        default:
            return 0;
    }
}
const getResolve = (msg) => {
    let stop = false;
    do {
        if (msg.match(/\d+k(\d+|f|c)/) === null ) stop = true;
        else {
            const thro = msg.match(/\d+k(\d+|f|c)/)[0];
            switch (thro.split('k')[1]) {
                case 'f': msg = msg.replace(thro, '('+fate_tf_roll(thro.split('k')[0])[0]+')'); break;
                case 'c': msg = msg.replace(thro, '('+tf_roll(thro.split('k')[0])[0]+')'); break;
                default: msg = msg.replace(thro, '('+roll(thro.split('k')[0],thro.split('k')[1])[0]+')'); break;
            }
        }
    } while(!stop);
    return msg.replace(/,/g,'+');
}

client.on('message', msg => {
    const option = msg.content.toLocaleLowerCase().slice(0, msg.content.indexOf('`')).slice(0, msg.content.indexOf(' ')).trim();
    const question = msg.content.toLocaleLowerCase().split('`')[0].slice(msg.content.indexOf(' ')).trim();
    if (option[0] === '/') {
        const comment = msg.content.split('`')[1] || '';
        let opt = ``;
        let send = false;
        switch (option) {
            //Roll
            case '/r':
                try {
                    const result = getResolve(question);
                    opt = `[ ${result} ]   :arrow_forward:   ${eval(result)}`;
                    send = true;
                } catch (error) {
                    send = true;
                    opt = fnError(error, question);
                }
                break;
                //Cthulhu Roll
            case '/cr':
                try {
                    const skill = getSkill(question);
                    const bonus = getBonus(question);
                    const penal = getPenal(question);
                    if (typeof skill === 'undefined') {
                        [result, dice] = c_roll(bonus, penal);
                        opt = `[ ${dice.join(' , ')} ]   :arrow_forward:   ${result}`;
                    }
                    else {
                        const mod = getMod(option,question);
                        const [test, result, dice] = test_roll(skill, bonus, penal, mod);
                        opt += TestText(test);
                        opt += `[ ${dice.join(' , ')} ]   :arrow_forward:   ${result}`;
                        SaveRoll(msg.author.username,result,comment, msg.guild.id,option,test >= 0,parseInt(bonus) !== 0);
                    }
                    send = true;
                } catch (error) {
                    send = true;
                    opt = fnError(error, question);
                }
                break;
                //Warhammer roll
            case '/wr':
                try {
                    const skill = getSkill(question);
                    const [dices, mod, result] = war_roll(skill);
                    opt += `[ ${dices.join(' , ')} ] ${mod !== 0 ? (mod !== 0 ? '+'+mod : mod) : '' }    :arrow_forward:   ${result}`;
                    SaveRoll(msg.author.username,result,comment, msg.guild.id, option);
                    send = true;
                } catch (error) {
                    send = true;
                    opt = fnError(error, question);
                }
                break;
                //Tales from the loop roll
            case '/tr':
                try {
                    const skill = getSkill(question);
                    const [dices, result] = tales_roll(skill);
                    opt += `[ ${dices} ]  :arrow_forward:   ${result}`;
                    SaveRoll(msg.author.username,result,comment, msg.guild.id, option);
                    send = true;
                } catch (error) {
                    send = true;
                    opt = fnError(error, question);
                }
                break;
                //Dungeons and Dragons roll
            case '/dr':
                try {
                    const skill = getSkill(question);
                    const bonus = getBonus(question);
                    const penal = getPenal(question);
                    const [dices, mod, result] = dnd_roll(bonus, penal, skill);
                    opt += `[ ${ dices } ] ${mod !== 0 ? (mod > 0 ? '+'+mod : mod) : '' }  :arrow_forward:   ${result}`;
                    SaveRoll(msg.author.username,result,comment, msg.guild.id, option);
                    send = true;
                } catch (error) {
                    send = true;
                    opt = fnError(error, question);
                }
                break;
                //Hide Cthulhu Roll
            case '/hcr':
                try {
                    const skill = getSkill(question);
                    const bonus = getBonus(question);
                    const penal = getPenal(question);
                    const mod = getMod(option,question);
                    [test, result, dice] = test_roll(skill, bonus, penal, mod);
                    opt += TestText(test);
                    opt += `[ ${dice.join(' , ')} ]   :arrow_forward:   ${result}`;
                    client.users.cache.get(client.users.cache.findKey(x => x.username === MG[msg.author.lastMessageChannelID])).send(`${msg.author} ${opt}`);
                    SaveRoll(msg.author.username, result,comment,msg.guild.id,option,test >= 0,parseInt(bonus) !== 0);
                } catch (error) {
                    send = true;
                    opt = fnError(error, question);
                }
                break;
                //Hide D&D Roll
            case '/hdr':
                try {
                    const skill = getSkill(question);
                    const bonus = getBonus(question);
                    const penal = getPenal(question);
                    const [dices, mod, result] = dnd_roll(bonus, penal, skill);
                    opt += `[ ${ dices } ] ${mod !== 0 ? (mod > 0 ? '+'+mod : mod) : '' }  :arrow_forward:   ${result}`;
                    client.users.cache.get(client.users.cache.findKey(x => x.username === MG[msg.author.lastMessageChannelID])).send(`${msg.author} ${opt}`);
                    SaveRoll(msg.author.username,result,comment, msg.guild.id, option);
                } catch (error) {
                    send = true;
                    opt = fnError(error, question);
                }
                break;
                //Hide Warhammer Roll
            case '/hwr':
                try {
                    const skill = getSkill(question);
                    const [dices, mod, result] = war_roll(skill);
                    opt += `[ ${dices.join(' , ')} ] ${mod !== 0 ? (mod > 0 ? '+'+mod : mod) : '' }   :arrow_forward:   ${result}`;
                    client.users.cache.get(client.users.cache.findKey(x => x.username === MG[msg.author.lastMessageChannelID])).send(`${msg.author} ${opt}`);
                    SaveRoll(msg.author.username,result,comment, msg.guild.id, option);
                } catch (error) {
                    send = true;
                    opt = fnError(error, question);
                }
                break;
                //Hide Tales Roll
            case '/htr':
                try {
                    const skill = getSkill(question);
                    const [dices, result] = tales_roll(skill);
                    opt += `[ ${dices} ]  :arrow_forward:   ${result}`;
                    client.users.cache.get(client.users.cache.findKey(x => x.username === MG[msg.author.lastMessageChannelID])).send(`${msg.author} ${opt}`);
                    SaveRoll(msg.author.username,result,comment, msg.guild.id, option);
                } catch (error) {
                    send = true;
                    opt = fnError(error, question);
                }
                break;
                //Set MG
            case '/setmg':
                try {
                    const newMG = client.users.cache.get(client.users.cache.findKey(x => x.username === comment));
                    if (typeof newMG !== 'undefined') {
                        MG[msg.author.lastMessageChannelID] = comment;
                        msg.reply(`zmieniłeś mistrza gry na ${newMG}`);
                    } else
                        msg.reply(`przedwieczni nie chcą, by dany osobnik prowadził sesje`);
                } catch (error) {
                    send = true;
                    opt = fnError(error, question);
                }
                break;
            case '/setnotify':
                ManageServer(msg, MG);
                break;
                //Help!
            case '/pomocy!': case '/help!':
                opt = Help(typeof MG[msg.author.lastMessageChannelID] === 'undefined');
                send = true;
                break;
                //Kiedy?
            case '/kiedy?': case '/when?':
                When(msg);
                break;
            case '/stats':
                Settings(msg, MG);
            default:
                break;
        }
        if (send) {
            msg.reply(typeof opt === 'string' ? opt + (comment.length ? ' `' + comment + '`' : '') : opt);
        }
    }
});

// client.on('ready', () => {});

const timer = () => (
    setTimeout(() => {
        if (new Date().getHours() === notifyTime[0] && new Date().getMinutes() === notifyTime[1]) Notification(client);
        timer();
    }, 60000)
);
timer();

client.login('TOKEN_1');
