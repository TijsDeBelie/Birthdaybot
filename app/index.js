

const express = require('express');
const dotenv = require('dotenv');
const Discord = require('discord.js');
const processMessage = require('./prme.js');
const cron = require('cron');
const mongoDB = require('./db.js');
const birthday = require('./birthday.js');

const app = express();
dotenv.config();
const client = new Discord.Client();

const CronJob = cron.CronJob;

const bdReminder = new cron.CronJob({
  cronTime: '0 1 * * *',
  onTick: birthday.cronTick,
  start: true,
  timeZone: 'Europe/Kiev'
});

const adReminder = new cron.CronJob({
  cronTime: '00 00 10 * * Mon',
  onTick: birthday.showAd,
  start: true,
  timeZone: 'Europe/Kiev'
});

client.on('ready', () => {
  console.log('I am ready!', new Date());
  birthday._client = client;
  bdReminder.start();
  adReminder.start();
});

client.on('message', message => {
  processMessage.process(message);
});

client.login(process.env.DISCORD_TOKEN);

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  response.send('bd-bot page');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running at localhost:' + app.get('port'))
});
