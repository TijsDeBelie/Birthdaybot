const mongoDB = require('./db.js')
const dotenv = require('dotenv')
const adPhrasesData = require('./assets/ad-phrases.json')
const imagesData = require('./assets/images.json')

dotenv.config();

function random(len) {
  return Math.floor(Math.random() * len);
}

const birthday = {
  cronTick: () => {
    mongoDB.connect().then(() => {
      let timezoneShift = -3;
      if (+process.env.TIMEZONE_SHIFT !== undefined) {
        timezoneShift = +process.env.TIMEZONE_SHIFT;
      }
      let today = new Date(+ new Date + timezoneShift * 60 * 60 * 1000);
      let day = today.getDate();
      day = day < 10 ? `0${day}` : day;
      let month = today.getMonth() + 1;
      month = month < 10 ? `0${month}` : month;
      let year = today.getFullYear();
      let search = `${day}.${month}`;
      mongoDB.getBirthdays(search).then(users => {
        let servers = {};
        users.forEach(user => {
          user.server_ids.forEach(id => {
            servers[id] = servers[id] || [];
            servers[id].push(user);
          });
        });

        Object.keys(servers).forEach(serverId => {
          let usersText = '';
          servers[serverId].forEach(user => {
            if (usersText.length) {
              usersText = `${usersText}, `;
            }
            usersText = `${usersText}<@${user.user_id}>`;
            if (user.year) {
              usersText = ` ${usersText}(${year - user.year} Year)`;
            }
          });

          let images = imagesData.images;
          `Happy Birthday to ${usersText}`
          let greeting = `Happy Birthday to ${usersText}!!!\n${images[random(images.length)]} :wink:`;

          let guild = birthday._client.guilds.get(serverId);
          if (guild) {
            console.log(guild.name)
            let channels = guild.channels;
            let generalName = process.env.CHANNEL_GENERAL || 'general'
            let general = channels.text.find((val => val.name === generalName)) || channels.text.first() || channels.text.random();
            console.log(general.name)
            general.send(greeting).catch(console.error)
            console.log(greeting)
          }
        });
      });
    });
  },

  showAd: () => {
    mongoDB.connect().then(() => {
      return mongoDB.getServers().then(servers => {
        servers.forEach(server => {
          let guild = birthday._client.guilds.get(server.id);
          if (guild) {
            let channels = guild.channels;
            let botCommandName = process.env.CHANNEL_BOT_COMMANDS || 'bot_commands' || 'bot-commands' || 'bot' || 'general' || 'welcome';
            let botCommandsChannel = channels.text.find(val => val.name === botCommandName);

            if (botCommandsChannel) {
              botCommandsChannel.send(adPhrasesData.adPhrases[random(adPhrasesData.adPhrases.length)]);
            }
          }
        });

      });
    });
  }

};

module.exports = birthday;
