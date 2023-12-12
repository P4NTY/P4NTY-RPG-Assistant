const { EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const embed = (name, url) => 
    new EmbedBuilder()
        .setAuthor({ name: name})
        .setThumbnail(url)
;
const btnReRoll = () => 
    button = new ButtonBuilder()
        .setLabel('Re-roll')
        .setStyle(ButtonStyle.Primary)
;
const btnWarn = () =>
    button = new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true)
;
const btnInfo = () => 
    button = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)

module.exports = { embed, btnReRoll, btnWarn, btnInfo }