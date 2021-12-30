var imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
var HTMLParser = require('js-html-parser');
const _ = require('lodash');
var moment = require('moment');
const Config = require('./account').Config;
moment.locale('ru');


function Message(options) {
    const model = {
      date: {
        day: moment(options.date).format("DD MMMM "),
        time: options.date.toISOString().slice(11,16)
      },
      from: {
        name: options.from.value[0].name + " ",
        address: options.from.value[0].address
      },
      to: {
	name: options.to.name,
	address: options.to.address
      },
      subject: options.subject,
      text: parserTextfromHTML(options.html),
      html: options.html
    }
    return model
}
  
function receiveMessagesfromEmail(config, delay=24*3600*1000){
  var count = 0;
  var emails = [];
  return new Promise(function(resolve, reject){
    imaps.connect(config).then(function (connection) {
    connection.openBox('INBOX').then(function () {
        var yesterday = new Date();
        yesterday.setTime(Date.now() - delay);
        var searchCriteria = ['UNSEEN', ['SINCE', yesterday]];
        var fetchOptions = {
        bodies: ['']
        };
        connection.search(searchCriteria, fetchOptions).then(function (messages) {
        messages.forEach(function (item) {
            var all = _.find(item.parts, { "which": "" })
            var id = item.attributes.uid;
            var idHeader = "Imap-Id: "+id+"\r\n";
            simpleParser(idHeader+all.body, (err, mail) => {
                emails.unshift(new Message(mail));
            });
        });
        connection.closeBox(false).then(function (){
            connection.end();
        }).catch(function(){
            connection.end();
            console.log('Error closeBox');
            
        });
        setTimeout(() => resolve(emails), 4000);
        });
    }).catch(function(){
        connection.end();
        console.log('Error openBox');
    });
    }).catch(function(){console.log('Error openBox');});
  });
}

const collectMessages = (req, res) => {
  if(!req.body) res.sendStatus(400);
  var emails = [];
  var accounts = req.body;
  var configs = accounts.map(account => Config(account));
  var promises = configs.map(config => receiveMessagesfromEmail(config));
  Promise.all(promises)
  .then(
    responses => {
      responses.forEach(function(response){
        response.forEach(msg => emails.push(msg))
      })
      res.send(emails);
      emails = []
    }
  )
  .catch(error => res.send(error))
}

function parserTextfromHTML(html){
  const root = HTMLParser.parse(html)
  return root.text.replace(/\s{2,}/g, ' ')
}

module.exports = {
  collectMessages,
}
