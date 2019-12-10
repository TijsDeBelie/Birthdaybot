import mongoDB from './db';

const processMessage = {
  formatNumbers: (numbers) => {
    if (numbers) {
      numbers = numbers.slice(0, 3);
      for (let i = 0; i < 2; i++) {
        if (numbers[i] && numbers[i].length === 1) {
          numbers[i] = `0${numbers[i]}`;
        }
      }
      if (numbers[2] && numbers[2].length === 2) {
        let year = 19;
        if (+numbers[2] < 15) {
          year = 20;
        }
        numbers[2] = `${year}${numbers[2]}`;
      }
    }
    return numbers;
  },

  validateNumbers: (numbers) => {
    if (numbers) {
      if (numbers.length >= 2) {
        if (+numbers[0] <= 0 || +numbers[0] > 31) {
          return 'the date you entered is incorrect.';
        } else if (+numbers[1] <= 0 || +numbers[1] > 12) {
          return 'the month you entered is incorrect.';
        } else if (numbers[2] && (!+numbers[2] || +numbers[2] < 1900 || +numbers[2] > (new Date).getFullYear())) {
          return 'the year you entered is incorrect.';
        }
      } else {
        return 'you must enter a date and month separately.';
      }
    } else {
      return 'I couldn\'t find any date.';
    }
  },

  updateUserData: async (userData) => {
    await mongoDB.connect();
    const oldUserData = await mongoDB.findUser(userData.user_id);
    if (oldUserData) {
      if (!~oldUserData.server_ids.indexOf(userData.server_ids[0])) {
        oldUserData.server_ids.push(userData.server_ids[0]);
      }
      userData.server_ids = oldUserData.server_ids;
    }
    return mongoDB.updateUser(userData, !oldUserData);
  },

  process: (message) => {
    message.content = message.content.toLowerCase();
    let mess = message.content;
    if (!mess.indexOf('!bdbot') || !mess.indexOf('!bd-bot')) {
      let confusedPhrase = `I don't know that command :confused: please do \`!bdbot help\``;

      let spaceIndex = mess.indexOf(' ');
      if (~spaceIndex) {
        mess = mess.substr(spaceIndex + 1);
      } else {
        return message.reply(confusedPhrase);
      }
      if (parseInt(mess, 10)) {
        return processMessage.addBirthday(message, mess);
      }
      return processMessage.showHelp(message);
    }
  },

  addBirthday: (message, mess) => {
    let userData = {
      user_id: message.author.id,
      username: message.author.username,
      server_ids: [message.channel.guild.id]
    };

    let numbers = mess.match(/\d+/g);
    numbers = processMessage.formatNumbers(numbers);
    let error = processMessage.validateNumbers(numbers);
    if (error) {
      error = `${error} Please try again: slight_smile:`;
      message.reply(error);
    } else {
      userData.date = `${numbers[0]}.${numbers[1]}`;
      userData.year = numbers[2];
      processMessage.updateServers(message.channel.guild.id, message.channel.guild.name);
      processMessage.updateUserData(userData).then(() => {
        message.reply(`I succesfully saved your birthday: ${numbers[0]}.${numbers[1]}${numbers[2] ? '.' + numbers[2] : ''} if it's not correct you can re-enter it in the format dd.mmm or dd.mmm.yyyy by executing the same command`);
      });
    }
  },

  updateServers: async (serverId, serverName) => {
    await mongoDB.connect();
    const servers = await mongoDB.getServers();
    let exist = servers.find(server => server.id === serverId);
    if (!exist) {
      return mongoDB.addServer({
        id: serverId,
        name: serverName
      });
    }
  },

  showHelp: (message) => {
    message.reply(`To add your birthday, !bdbot dd.mm or !bdbot dd.mm.yyyy \n dd = day, \nmm = month, \nyyyy=year`);
  }
};

export default processMessage;