const roll = (dice = 1, walls = 6) => {
    const result = [];
    if (dice > 1) {
        for (let index = 0; index < dice; index++)
            result.push(Math.floor(Math.random() * walls) + 1);
        return [result, result.reduce((acc, val) => acc + val, 0)];
    } else
        return [[Math.floor(Math.random() * walls) + 1]];
}

const c_roll = (bonus = 0, penal = 0) => {
    const unit = roll(1,10)[0], dec = [];
    for (let i = 0; i <= Math.abs(bonus - penal); i++) dec.push((Math.floor(Math.random() * 10)) * 10);
    switch ((bonus - penal) / (Math.abs(bonus - penal))) {
        case 1:
            return [parseInt(unit) + Math.min(...dec), [unit, ...dec]];
        case -1:
            return [parseInt(unit) + Math.max(...dec), [unit, ...dec]];
        default:
            return [parseInt(unit) + dec[0], [unit, ...dec]];
    }
}

const test_roll = (skill, bonus = 0, penal = 0, mod = 1) => {
    const [rolling, result] = c_roll(bonus, penal);
    let counter = 2;
    if ((rolling >= 96 && skill <= 50) || rolling === 100) counter = 0;
    else if (rolling === 1) counter = 5;
    else if ((skill / mod) < rolling) counter = 1;
    else if ((skill / mod) / 5 >= rolling) counter = 4;
    else if ((skill / mod) / 2 >= rolling) counter = 3;

    return [counter, rolling, result];
}

const tales_roll = (dice) => {
    const result = roll(dice,6)[0];
    return [result, result.filter( res => res === 6 ).length];
}

const war_roll = (skill, mod = 0) => {
    const [unit] = roll(1,10)[0];
    const dec = Math.floor(Math.random() * 10) * 10;
    let count = 0;
    let critic = 0;

    if (unit + dec <= 5 ) count = Math.max(1, parseInt((skill+mod)/10)-parseInt((dec+unit)/10));
    else if (unit + dec > 95 ) count = Math.min( -1, parseInt((skill+mod)/10)-parseInt((dec+unit)/10) );
    else count = parseInt((skill+mod)/10)-parseInt((dec+unit)/10);

    if ( unit === dec/10 ) critic = Math.round( (skill + mod - unit - dec)/(Math.abs(skill + mod - unit - dec)) )||1;

    return [ count,critic, [unit,dec], parseInt(dec)+parseInt(unit) ];
}

const dnd_roll = () =>  roll(1,20);

const tf_roll = (dice = 1) => {
    const result = [];
    for (let index = 0; index < dice; index++) {
        result.push( roll(1,2)[0][0] === 1 ? 1 : -1 )
    }
    return [result, result.reduce( (acc,val) => acc + val , 0 )];
}

const fate_tf_roll = (dice = 1) => {
    const sgin = {
        [-1]: ':red_square:',
        [0]: ':black_large_square:',
        [1]: ':green_square:'
    }
    const result = [];
    for (let index = 0; index < dice; index++) {
        result.push( roll(1,3)[0] - 2 )
    }
    return [result.map( value => sgin[value] ), result.reduce( (acc,val) => acc + val , 0 )];
}

const vampire_roll = (pool, hunger ) => {
    const dices_pool = roll(pool,10)[0];
    const dices_hunger = roll(hunger,10)[0];
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

const getResolve = (msg) => {
    let stop = false;
    const reg = /\d+[k||d](\d+|f|c)/;
    do {
        if (msg.match(reg) === null ) stop = true;
        else {
            const thro = msg.match(reg)[0];
            switch (thro.split(/[k||d]/)[1]) {
                case 'f': msg = msg.replace(thro, '('+fate_tf_roll(thro.split(/[k||d]/)[0])[0]+')'); break;
                case 'c': msg = msg.replace(thro, '('+tf_roll(thro.split(/[k||d]/)[0])[0]+')'); break;
                default: msg = msg.replace(thro, '('+roll(thro.split(/[k||d]/)[0],thro.split(/[k||d]/)[1])[0]+')'); break;
            }
        }
    } while(!stop);
    return msg.replace(/,/g,'+');
}

module.exports = { roll, c_roll, test_roll, tales_roll, war_roll, dnd_roll, tf_roll, fate_tf_roll, getResolve, vampire_roll };