const { EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const embed = (name, url) => 
    new EmbedBuilder()
        .setAuthor({ name: name})
        .setThumbnail(url)
;
const btnReRoll = () => 
    button = new ButtonBuilder()
        .setLabel('Re-roll')
        .setStyle(ButtonStyle.Secondary)
;
const btnWarn = () =>
button = new ButtonBuilder()
    .setStyle(ButtonStyle.Danger)
    .setDisabled(true)

module.exports = { embed, btnReRoll, btnWarn }