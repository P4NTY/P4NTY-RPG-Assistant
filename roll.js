const roll = (dice = 1, walls = 6) => {
    const result = [];
    if (dice > 1) {
        for (let index = 0; index < dice; index++)
            result.push(Math.floor(Math.random() * walls) + 1);
        return [result, result.reduce((acc, val) => acc + val, 0)];
    } else
        return [[Math.floor(Math.random() * walls) + 1]];
}

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

module.exports = { roll, tf_roll, fate_tf_roll, getResolve };