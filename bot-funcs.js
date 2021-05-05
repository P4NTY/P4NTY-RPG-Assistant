const Airtable = require('airtable');
const RPGBase = new Airtable({apiKey: AIRTABLE_TOKEN}).base(BASE_TOKEN);
//Discord connection
const { Client, MessageEmbed } = require('discord.js');
const client = new Client();

const MapMod = [{
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
}];

//Session Embed Message temlpate
const SesionInfoEmbed = (title, name, data, mg, players) => (
    new MessageEmbed()
        .setTitle(`${title}: ${name}`)
        .setColor(0xe75480)
        .setDescription(`
            Dzień? ${['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'][new Date(data).getDay()]} - ${new Date(data).toLocaleDateString()}
            Godzina? ${data.split('T')[1].slice(0,5)}

            MG: ${mg}
            Gracze: ${players||''}

            Dodaj sesję: https://airtable.com/shr94r4Rp8FgftniJ
            Kalendarz: https://airtable.com/shr2VxE9sbc9xUb7w
        `)
);

//Send roll to data base
const SaveRoll = (user,result, comment, channel, command='', isSuccess=false, isBonus=false) => {
    RPGBase('Places').select({
        fields: ["Name"],
        filterByFormula: `ID = '${channel}'`,
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
        .setDescription(`
            ${reset ? 'Brak Mistrza Gry na kanale' : ''}
            Ustaw Mistrza Gry: /setMG \`Kiszu\` !

            Podstawowe rzuty:
                /r 1k3 + 2k4 \`komentarz\`
                /cr - Call of Cthulhu
                /dr - Dungeon & Dragons
                /wr - Warhammer
                /tr - Tales from the Loop

            Więcej: https://github.com/P4NTY/P4NTY-RPG-Assistant
        `)
);


const TestText = (test) => {
    if (test <= -1) {
        return `:x: Porażka    `
    } else {
        return `(+${test + 1}) :white_check_mark: ${MapMod.map( x => x.value).indexOf(test + 1) !== -1
            ? MapMod[MapMod.map( x => x.value).indexOf(test + 1)].name
        : 'Zwykły'} Sukces   `;
    }
}

//When next session Embed Message
const When = (msg) => {
    RPGBase('Places').select({
        view: "Grid view",
        fields: ["Name"],
        filterByFormula: `ID = ${msg.author.lastMessageChannelID}`,
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
                            recs[0].get('Hero (from Players)')
                    ))
                }
                else msg.reply( 'Brak kolejnej sesji' );
            })
        }
        else msg.reply( 'Nie mogliśmy znaleźć serwera' );
    })
}

//Auto notofication new Session Embed Message
const Notification = () => {
    RPGBase('Places').select({
        fields: ["Name", "ID"],
        filterByFormula: `Type = 'Discord'`,
    }).eachPage(records => {
        const servers = [];
        records.forEach( record => servers.push(record.get('Name')) );
        RPGBase('Sessions').select({
            fields: ["Name", "Day", 'Player (from MG)','Hero (from Players)','Player (from Players)'],
            filterByFormula:`AND(OR(DATESTR(DATEADD(TODAY(),1,'days')) = DATESTR(Day),DATESTR(TODAY()) = DATESTR(Day)),REGEX_MATCH('${servers.toString()}', Where))`
        }).eachPage((recs, fetchNextPage) => {
            recs.forEach( rec => {
                client.channels.cache.get(records.filter( ({id}) => id === rec.get('Where')[0] )[0].get("ID")).send(
                    SesionInfoEmbed(
                        new Date(rec.get('Day')).toDateString() === new Date().toDateString() ? 'Dzisiaj Sesja!' : 'Jutro Sesja!',
                        rec.get('Name'),
                        rec.get('Day'),
                        rec.get('Player (from MG)'),
                        rec.get('Hero (from Players)')
                ));
                client.channels.cache.get(records.filter( ({id}) => id === rec.get('Where')[0] )[0].get("ID")).send(
                    [rec.get('Player (from MG)'),...rec.get('Player (from Players)')||[]].map( player => '@' + player).join(' ') + ':arrow_heading_up:'
                );
            });
            fetchNextPage();
        })
    })
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
                        .setDescription(`
                        Server ID: ${msg.guild.id}
                        Notification channel: ${msg.channel.guild.channels.cache.find(channel => channel.id === record.get('Notification ID')).name||'Brak'}
                        MG: ${msg.channel.guild.channels.cache.map( ({id,name}) => typeof MG[id] !== 'undefined' ? `[ ${name}: ${MG[id]} ]` : '' ).join('')||'Brak'}
                    `)
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

module.exports = { SesionInfoEmbed, SaveRoll, Help, TestText, When, Notification, Settings, fnError, ManageServer };
