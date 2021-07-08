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

client.on('message', msg => {
    const question = msg.content.split(' ');
    const option = question[0].toLocaleLowerCase();
    if (option[0] === '/') {
        const mod = [...question, '1/1'].filter(x => x.indexOf('/') !== -1)[1].split('/')[1];
        const skill = question.filter(x => !isNaN(parseInt(x)))[0];
        const comment = msg.content.split('`')[1] || '';
        const bonus = [...question, '0b'].map(x => x.toString().match(/[0-9]b/g)).filter(x => x)[0].toString().slice(0, -1);
        const penal = [...question, '0p'].map(x => x.toString().match(/[0-9]p/g)).filter(x => x)[0].toString().slice(0, -1);
        let opt = ``;
        let send = false;

        switch (option) {
            //Roll
            case '/r':
                try {
                    let query = question.slice(1).join('');
                    let stop = false;
                    do {
                        if (query.match(/\d+k(\d+|f|c)/) === null ) stop = true;
                        else {
                            const thro = query.match(/\d+k(\d+|f|c)/)[0];
                            switch (thro.split('k')[1]) {
                                case 'f': query = query.replace(thro, '('+fate_tf_roll(thro.split('k')[0])[0]+')'); break;
                                case 'c': query = query.replace(thro, '('+tf_roll(thro.split('k')[0])[0]+')'); break;
                                default: query = query.replace(thro, '('+roll(thro.split('k')[0],thro.split('k')[1])[0]+')'); break;
                            }
                        }
                    } while(!stop);
                    result = query.replace(/,/g,'+');
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
                    if (typeof skill === 'undefined' || skill.indexOf('b') !== -1 || skill.indexOf('p') !== -1) {
                        [result, dice] = c_roll(bonus, penal);
                        opt = `[ ${dice.join(' , ')} ]   :arrow_forward:   ${result}`;
                    } else {
                        [test, result, dice] = test_roll(skill, bonus, penal, mod);
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
                    const [dices, mod, result] = war_roll(skill);
                    opt += `[ ${dices.join(' , ')} ] ${mod !== 0 ? (mod > 0 ? '+'+mod : mod) : '' }    :arrow_forward:   ${result}`;
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
