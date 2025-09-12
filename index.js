const { Client, GatewayIntentBits, Collection, ActivityType, MessageFlags } = require('discord.js');
const { token, status } = require('./config.json');
const fs = require('fs');
const path = require('path');
const { getVoiceConnection } = require('@discordjs/voice');
const { Player } = require('discord-player');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});

client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        filter: "audioonly",
        highWaterMark: 1 << 25
    }
});

client.commands = new Collection();
client.queue = new Collection();
client.timeouts = new Collection();

const commandFolders = fs.readdirSync(path.join(__dirname, 'commandes'));
for (const folder of commandFolders) {
    const folderPath = path.join(__dirname, 'commandes', folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(folderPath, file));
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[ATTENTION] La commande à ${path.join(folderPath, file)} est invalide.`);
        }
    }
}

client.once('clientReady', (readyClient) => {
    console.log(`✅ Bot en ligne en tant que ${readyClient.user.tag}`);
    readyClient.user.setPresence({ status: status.status });
    readyClient.user.setActivity({ name: "sur le port 22", type: ActivityType.Listening });
    console.log(`🎮 Statut : ${readyClient.user.presence.status} | Activité : ${readyClient.user.presence.activities[0].name}`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (oldState.channelId && !newState.channelId) {
        const voiceConnection = getVoiceConnection(oldState.guild.id);
        if (voiceConnection && voiceConnection.joinConfig.channelId === oldState.channelId) {
            const channel = oldState.channel;
            const membersCount = channel.members.filter(member => !member.user.bot).size;

            if (membersCount === 0) {
                if (client.timeouts.has(oldState.guild.id)) {
                    clearTimeout(client.timeouts.get(oldState.guild.id));
                }
                const timeoutId = setTimeout(() => {
                    const existingConnection = getVoiceConnection(oldState.guild.id);
                    if (existingConnection) {
                        existingConnection.destroy();
                        console.log(`Déconnecté du salon vocal car il est vide.`);
                        client.timeouts.delete(oldState.guild.id);
                    }
                }, 30 * 60 * 1000);

                client.timeouts.set(oldState.guild.id, timeoutId);
            }
        }
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('❌ Erreur (Commande) :', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Une erreur est survenue.', flags: [MessageFlags.Ephemeral] });
            } else {
                await interaction.reply({ content: 'Une erreur est survenue.', flags: [MessageFlags.Ephemeral] });
            }
        }
        return;
    }

    if (interaction.isButton() || interaction.isStringSelectMenu()) {
        const customId = interaction.customId;
        const commandName = customId.split('_')[0];
        const command = client.commands.get(commandName);

        if (!command) {
            console.error(`Aucune commande trouvée pour le customId: ${customId}`);
            return interaction.reply({ content: 'Une erreur est survenue.', flags: [MessageFlags.Ephemeral] });
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`❌ Erreur (Composant ${customId}) :`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Une erreur est survenue.', flags: [MessageFlags.Ephemeral] });
            } else {
                await interaction.reply({ content: 'Une erreur est survenue.', flags: [MessageFlags.Ephemeral] });
            }
        }
    }
});

client.login(token);