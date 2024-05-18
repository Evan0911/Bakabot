const {REST, Routes} = require('discord.js');
const config = require('config');
const token = config.get('token');
const clientId = config.get('clientId');

const rest = new REST().setToken(token);

rest.put(Routes.applicationCommands(clientId), {body: []})
        .then(() => console.log('OK'))
        .catch(console.error);