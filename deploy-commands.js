const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { clientId, token } = require('./config.json');
const fs = require('fs');
const path = require('path');

const commands = [];

const commandFolders = fs.readdirSync(path.join(__dirname, 'commandes'));

for (const folder of commandFolders) {
  const folderPath = path.join(__dirname, 'commandes', folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('🌍 Déploiement global des commandes slash...');
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    console.log('✅ Commandes globales déployées avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors du déploiement global des commandes :', error);
  }
})();
