const bcrypt = require('bcrypt');

const plainPass = 'Passwordhere';

bcrypt.genSalt(10, (err, salt) => {
    if (err) console.error(err);
    bcrypt.hash(plainPass, salt, (err, encrypted) => {
        if (err) console.error(err);
        console.log(`encrypted - ${encrypted}`);
    })
})

const encryptedPass = '$2b$10$S6jmtN4Lj2tc5ShUZKJcl.ETYYz.pERc1i7Y6lN85RIItZA4P814e';
bcrypt.compare(plainPass, encryptedPass, (err, result) => {
    if (err) console.error(err);
    console.log(`result - ${result}`)
})