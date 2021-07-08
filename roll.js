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
    let counter = 0;
    if ((rolling >= 96 && skill < 50) || rolling === 100) counter = -2;
    else if (rolling === 1) counter = 3;
    else if ((skill / mod) < rolling) counter = -1;
    else if ((skill / mod) / 5 >= rolling) counter = 2;
    else if ((skill / mod) / 2 >= rolling) counter = 1;

    return [counter, rolling, result];
}

const tales_roll = (dice) => {
    const result = roll(dice,6)[0];
    return [result, result.filter( res => res === 6 ).length];
}

const war_roll = (mod = 0) => {
    const unit = roll(1,10)[0];
    const dec = Math.floor(Math.random() * 10) * 10;
    return [ [dec,unit], parseInt(mod), parseInt(dec)+parseInt(unit)+parseInt(mod) ]
}

const dnd_roll = (bonus = 0, penal = 0, mod = 0) => {
    //do przebudoy
    const result = roll(1,20);
    if ( bonus - penal !== 0) {
        result.push(...roll(Math.abs(bonus - penal),20)[0]);
    }
    const modifcator = mod !== 0 && mod.indexOf('b') === -1 && mod.indexOf('p') === -1 ? parseInt(mod) : 0;
    const opt = [result, modifcator];
    switch ((bonus - penal) / (Math.abs(bonus - penal))) {
        case 1: opt.push(Math.max(...result) + parseInt(modifcator)); break;
        case -1: opt.push(Math.min(...result) + parseInt(modifcator)); break;
        default: opt.push(parseInt(result[0]) + parseInt(modifcator)); break;
    }
    return opt;
}

const tf_roll = (dice = 1) => {
    const result = [];
    for (let index = 0; index < dice; index++) {
        result.push( roll(1,2)[0][0] === 1 ? 1 : -1 )
    }
    return [result, result.reduce( (acc,val) => acc + val , 0 )];
}

const fate_tf_roll = (dice = 1) => {
    const result = [];
    for (let index = 0; index < dice; index++) {
        result.push( roll(1,3)[0] - 2 )
    }
    return [result, result.reduce( (acc,val) => acc + val , 0 )];
}

module.exports = { roll, c_roll, test_roll, tales_roll, war_roll, dnd_roll, tf_roll, fate_tf_roll };
