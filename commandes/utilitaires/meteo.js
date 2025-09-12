const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { weatherApiKey } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meteo')
        .setDescription('Affiche la météo d\'une ville.')
        .addStringOption(option =>
            option.setName('ville')
                .setDescription('Le nom de la ville')
                .setRequired(true)),

    async execute(interaction) {
        const ville = interaction.options.getString('ville');

        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                params: {
                    q: ville,
                    appid: weatherApiKey,
                    units: 'metric',
                    lang: 'fr'
                }
            });

            const meteo = response.data;
            const condition = meteo.weather[0].main.toLowerCase();
            const weatherId = meteo.weather[0].icon;
            
            
            const weatherIconUrl = `https://openweathermap.org/img/wn/${weatherId}@4x.png`;
            
            const backgroundImages = {
                clear: 'https://source.unsplash.com/800x400/?sunny',
                clouds: 'https://source.unsplash.com/800x400/?cloudy',
                rain: 'https://source.unsplash.com/800x400/?rain',
                thunderstorm: 'https://source.unsplash.com/800x400/?storm',
                drizzle: 'https://source.unsplash.com/800x400/?drizzle',
                snow: 'https://source.unsplash.com/800x400/?snow',
                mist: 'https://source.unsplash.com/800x400/?fog',
                fog: 'https://source.unsplash.com/800x400/?fog',
                haze: 'https://source.unsplash.com/800x400/?haze'
            };

            const backgroundImage = backgroundImages[condition] || 'https://source.unsplash.com/800x400/?weather';

            const weatherIcons = {
                clear: '☀️', clouds: '☁️', rain: '🌧️', thunderstorm: '⛈️',
                drizzle: '🌦️', snow: '❄️', mist: '🌫️', fog: '🌫️', haze: '🌁'
            };

            const weatherEmoji = weatherIcons[condition] || '🌍';

            const timezoneOffset = meteo.timezone;
            const utcTime = Date.now();
            const localTime = new Date(utcTime + timezoneOffset * 1000);

            const formattedLocalTime = localTime.toLocaleString('fr-FR', { timeZone: 'UTC' });

            const embed = new EmbedBuilder()
                .setTitle(`${weatherEmoji} Météo à ${meteo.name}`)
                .setDescription(`**${meteo.weather[0].description.charAt(0).toUpperCase() + meteo.weather[0].description.slice(1)}**`)
                .setImage(backgroundImage)
                .setThumbnail(weatherIconUrl)
                .addFields(
                    { name: '🌡️ Température', value: `${meteo.main.temp}°C`, inline: true },
                    { name: '🥶 Ressenti', value: `${meteo.main.feels_like}°C`, inline: true },
                    { name: '💧 Humidité', value: `${meteo.main.humidity}%`, inline: true },
                    { name: '🌬️ Vent', value: `${meteo.wind.speed} m/s`, inline: true },
                    { name: '🌍 Pression', value: `${meteo.main.pressure} hPa`, inline: true },
                    { name: '⏰ Heure locale', value: `${formattedLocalTime}`, inline: false }
                )
                .setColor('#1E90FF')
                .setFooter({ text: 'Données fournies par OpenWeatherMap', iconURL: 'https://openweathermap.org/themes/openweathermap/assets/img/logo_white_cropped.png' })
                .setURL(`https://openweathermap.org/city/${meteo.id}`);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            if (error.response && error.response.status === 404) {
                await interaction.reply({ content: '❌ Ville introuvable ou mal écrite.', ephemeral: true });
            } else {
                console.error('Erreur lors de la récupération de la météo :', error);
                await interaction.reply({ content: '❌ Une erreur est survenue lors de la récupération des données météo.', ephemeral: true });
            }
        }
    }
};