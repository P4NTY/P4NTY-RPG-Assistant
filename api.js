const cluster = require("cluster");

if (cluster.isMaster) {
    for(let i = 0 ; i < Math.max(require('os').cpus().length -1, 1) ; i++) cluster.fork();
    cluster.on('exit',()=>cluster.fork());
}
else {
    //exppress
    const express = require('express');
    const app = express();
    //connect to database with player stats
    const Airtable = require('airtable');
    const RPGBase = new Airtable({apiKey:process.env.airTable}).base(process.env.RPGBase);
    //rolls functions
    const rolls = require("./roll");

    app.get("/getPreson",(req,res) => {
        const output = {
            character: req.query.character||'',
            skills: {},
            stats: {}
        };
        if (output.character !== '') {
            RPGBase('Skills').select({
                fields: ['Name', 'Type', 'Value'],
                filterByFormula: `{Hero (from Player)} = '${output.character}'`
            }).eachPage( (records,fetchNextPage) => {
                records.forEach( record => {
                    if ( record.get('Type') === 'Cechy' ) output.stats[record.get('Name')] = record.get('Value');
                    else output.skills[record.get('Name')] = record.get('Value');
                });
                fetchNextPage();
            }, (err) => {
                if (err) res.send(new Error(err));
                else res.send(output);
            })
        }
        else res.send(new Error('Brak parametru'));
    });

    app.get("/roll", (req,res)=>{
        const param = {
            command: req.query.command||'',
            dices: req.query.dices,
            walls: req.query.walls,
            skill: req.query.skill,
            mod: req.query.mod||0,
            bonus: req.query.bonus||0,
            peanl: req.query.peanl||0,
            comment: req.query.comment||''
        };

        if (param.command !== ''){
            switch (param.command) {
                case 'r':
                    res.send(rolls.roll(param.dices,param.walls));
                break;
                case 'cr':
                    res.send(rolls.c_roll(param.bonus,param.penal));
                break;
                case 'tr':
                    res.send(rolls.tales_roll(param.dices));
                break;
                case 'dr':
                    res.send(rolls.dnd_roll(param.bonus, param.penal, param.mod));
                break;
                case 'wr':
                    res.send(rolls.war_roll(param.mod));
                break;
                default:
                break;
            }
        }
        else res.send(new Error('Brak parametru'));
    });

    app.listen(process.env.PORT||8080,()=> console.log(`started at 127.0.0.1:${process.env.PORT||8080} PID: ${process.pid}`) )
}