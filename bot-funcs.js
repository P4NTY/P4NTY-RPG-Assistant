const Airtable = require('airtable');
const RPGBase = new Airtable({apiKey:'key5qcpujPme4ulde'}).base('appuUzNCgIL1z6gRk');
//Discord connection
const { MessageEmbed } = require('discord.js');
const { response } = require('express');
const fetch = require("node-fetch");

const MapMod = [{
    name: 'Hard',
    short: '1/2',
    value: 2
},
{
    name: 'Extreme',
    short: '1/5',
    value: 3
},
{
    name: 'Critical',
    short: '1/100',
    value: 4
}];

const MapNumber = {
    '-': ':name_badge:',
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

//Session Embed Message temlpate
const SesionInfoEmbed = (title, name, data, mg) => (
    new MessageEmbed()
        .setTitle(`${title}: ${name}`)
        .setColor(0xe75480)
        .setDescription([
            `Dzień? ${new Date(data).toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
            `Godzina? ${data.split('T')[1].slice(0,5)}`,
            '',
            `MG: ${mg}`,
            '',
            `Dodaj sesję: https://airtable.com/shr94r4Rp8FgftniJ`,
            `Kalendarz: https://airtable.com/shr2VxE9sbc9xUb7w`
        ].join('\n'))
);

//Send roll to data base
const SaveRoll = (user,result, comment, guild, command='', isSuccess=false, isBonus=false) => {
    RPGBase('Places').select({
        fields: ["Name"],
        filterByFormula: `ID = '${guild}'`,
        maxRecords: 1,
    }).eachPage((records) => {
        RPGBase('Rolls').create([{
            "fields": {
                "Who":user,
                "Roll":result,
                "Comment": comment,
                "Date": new Date(),
                "Place": [records[0].id],
                "isSuccess?": isSuccess,
                "isBonus?": isBonus,
                "command": command
            }
        }])
    })
}

//Help Embed Message
const Help = (reset = false) => (
    new MessageEmbed()
        .setTitle(`Pomocnik ${reset ? '- upDate!' : ''}`)
        .setColor(0xe75480)
        .setDescription([
            `${reset ? 'Brak Mistrza Gry na kanale' : ''}`,
            `Ustaw Mistrza Gry: /setMG \`Kiszu\` !`,
            '',
            `Podstawowe rzuty:`,
            `    /r 1k3 + 2k4 \`komentarz\``,
            `    /cr - Call of Cthulhu`,
            `    /dr - Dungeon & Dragons`,
            `    /wr - Warhammer`,
            `    /tr - Tales from the Loop`,
            '',
            `Więcej: https://github.com/P4NTY/P4NTY-RPG-Assistant`
        ].join('\n'))
);


const TestText = (test) => {
    if (test === -2) `:anger: Critical Fail    `
    else if (test === -1) return `:x: Fail    `;
    else {
        return `(+${test + 1}) :white_check_mark: ${MapMod.map( x => x.value).indexOf(test + 1) !== -1
            ? MapMod[MapMod.map( x => x.value).indexOf(test + 1)].name: ''} Sukcess   `;
    }
}

//When next session Embed Message
const When = (msg) => {
    RPGBase('Places').select({
        view: "Grid view",
        fields: ["Name"],
        filterByFormula: `ID = ${msg.guild.id}`,
        maxRecords: 1,
    }).eachPage(records => {
        if (records.length) {
            RPGBase('Sessions').select({
                maxRecords: 1,
                view: "Grid view",
                filterByFormula:`AND(DATESTR(DATEADD(TODAY(),0,'days')) <= DATESTR(Day),Where = '${records[0].get('Name')}')`
            }).eachPage(recs => {
                if (recs.length){
                    msg.reply(
                        SesionInfoEmbed(
                            'Następna sesja',
                            recs[0].get('Name'),
                            recs[0].get('Day'),
                            recs[0].get('Player (from MG)'),
                    ))
                }
                else msg.reply( 'Brak kolejnej sesji' );
            })
        }
        else msg.reply( 'Nie mogliśmy znaleźć serwera' );
    })
}

//Auto notofication new Session Embed Message
const Notification = (client) => {
    RPGBase('Places').select({
        fields: ["Name", "Notification ID"],
        filterByFormula: `Type = 'Discord'`,
    }).eachPage(records => {
        const servers = [];
        records.forEach( record => servers.push({
            id: record.id,
            name: record.get('Name'),
            channel: record.get("Notification ID")
        }) );
        RPGBase('Sessions').select({
            fields: ["Name", "Day",'Where','Player (from MG)','Hero (from Players)','Player (from Players)'],
            filterByFormula:`AND(OR(DATESTR(DATEADD(TODAY(),1,'days')) = DATESTR(Day),DATESTR(TODAY()) = DATESTR(Day)),REGEX_MATCH('${servers.map( ({name}) => name).toString()}', Where))`
        }).eachPage((recs, fetchNextPage) => {
            try {
                recs.forEach( rec => {
                    client.channels.cache.get(servers.filter( ({id}) => id === rec.get('Where')[0] )[0].channel).send(
                        SesionInfoEmbed(
                            new Date(rec.get('Day')).toDateString() === new Date().toDateString() ? 'Dzisiaj Sesja!' : 'Jutro Sesja!',
                            rec.get('Name'),
                            rec.get('Day'),
                            rec.get('Player (from MG)')
                        )
                    )
                    client.channels.cache.get(servers.filter( ({id}) => id === rec.get('Where')[0] )[0].channel).send(
                        client.channels.cache.get(servers.filter( ({id}) => id === rec.get('Where')[0] )[0].channel).members.filter( member =>
                            [rec.get('Player (from MG)'),...rec.get('Player (from Players)')||[]].join('').indexOf(member.user.username) !== -1
                        ).map( player => player).join(' ') + '    :arrow_heading_up:'
                    );
                });
            } catch (error) {
                console.log(error)
            }
            fetchNextPage();
        }, err => console.log(err))
    }, err => console.log(err))
}

//Settings Embed Message
const Settings = (msg, MG) => {
    RPGBase('Places').select({
        filterByFormula: `ID = ${msg.guild.id}`,
        maxRecords: 1
    }).eachPage( (records)=>{
        if (records.length) {
            records.forEach( record => {
                msg.reply(
                    new MessageEmbed()
                        .setTitle( msg.guild.name + ': Ustawienia')
                        .setColor(0xe75480)
                        .setDescription([
                            `Server ID: ${msg.guild.id}`,
                            `Notification channel: ${msg.channel.guild.channels.cache.find(channel => channel.id === record.get('Notification ID')).name||'Brak'}`,
                            `MG: ${msg.channel.guild.channels.cache.map( ({id,name}) => typeof MG[id] !== 'undefined' ? `[ ${name}: ${MG[id]} ]` : '' ).join('')||'Brak'}`
                        ].join('\n'))
                )
            })
        } else msg.reply( 'Brak serwera o takiej nazwie' )
    }, err => console.log(err));
}

//Error funcion
const fnError = (error, question) => {
    console.error({
        error: error,
        msg: question
    })
    return 'Niestety coś poszło nie tak :(';
}

const ManageServer = (msg, MG) => {
    RPGBase('Places').select({
        filterByFormula: `ID = ${msg.guild.id}`,
        maxRecords: 1
    }).eachPage( records => {
        if(records.length){
            RPGBase('Places').update(records[0].id, {
                "Notification ID": msg.author.lastMessageChannelID
            }, (err) => {
                if (err) console.error(new Error(err));
                else Settings(msg, MG);
            });
        }
        else {
            RPGBase('Places').create([{
                "fields": {
                    "Name": msg.guild.name,
                    "Type": "Discord",
                    "ID": msg.guild.id,
                    "Notification ID": msg.author.lastMessageChannelID
                }
            }], function( err ) {
                if (err) console.error(err);
                else Settings(msg, MG);
            });
        }
    })
}


const Card = (whom, player, server) => {
    const key=[3,7];
    function fnCodeHash (string) {
        return string.split('').map( char => (char.charCodeAt()-key[0])*key[1] ).map( ascii => String.fromCharCode(ascii)).join('')
    }

    fetch(`https://kiszu.pl/api/getCard.php?player=${player === 'ᖽᐸᓰSᗱᑘ' ? 'Kiszu' : player}`).then( res => res.json()).then( response => {
        result = '';
        
        response.forEach(character => {
            const data = JSON.stringify({
                player: player === 'ᖽᐸᓰSᗱᑘ' ? 'Kiszu' : player.replace('%',''),
                server: server,
                character: character
            })
            result += new URL(`https://kiszu.pl/Card_Call/?id=${fnCodeHash(data)}`).href + '\n';
        });
        whom.send(result);
    })
}

module.exports = { SesionInfoEmbed, SaveRoll, Help, TestText, When, Notification, Settings, fnError, ManageServer, Card, changeNumber };