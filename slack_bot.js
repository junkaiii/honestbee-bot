// if (!process.env.token) {
//     console.log('Error: Specify token in environment');
//     process.exit(1);
// }

var Botkit = require('botkit');
var os = require('os');
var axios = require('axios');


var mongoStorage = require('botkit-storage-mongo')({
  mongoUri: 'mongodb://<dbuser>:<dbpassword>@ds057066.mlab.com:57066/slackbot'
});

var controller = Botkit.slackbot({
  logLevel: 1, // 1 to 7
  stats_optout: true, // set true for privacy.
  storage: mongoStorage
});

var bot = controller.spawn({
  token: 'xoxb-90244858867-lxtbcRgXJNYL0RVQL1Fz9Jkf'
    // token: process.env.token
}).startRTM();


// controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {
//
//     bot.api.reactions.add({
//         timestamp: message.ts,
//         channel: message.channel,
//         name: 'robot_face',
//     }, function(err, res) {
//         if (err) {
//             bot.botkit.log('Failed to add emoji reaction :(', err);
//         }
//     });
//
//
//     controller.storage.users.get(message.user, function(err, user) {
//         if (user && user.name) {
//             bot.reply(message, 'Hello ' + user.name + '!!');
//         } else {
//             bot.reply(message, 'Hello.');
//         }
//     });
// });
//
// controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
//     var name = message.match[1];
//     controller.storage.users.get(message.user, function(err, user) {
//         if (!user) {
//             user = {
//                 id: message.user,
//             };
//         }
//         user.name = name;
//         controller.storage.users.save(user, function(err, id) {
//             bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
//         });
//     });
// });

controller.hears(['find me (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {

  var ingredient = message.match[1];
  var recipes = [];

  axios.get('http://food2fork.com/api/search?key=d3799f6871828e8da7fce781da27fb8f&q=' + ingredient)
    .then(function(response) {
      bot.reply(message, 'I found these recipes that use ' + ingredient + ':');
      for (var i = 0; i < response.data.recipes.length; i++) {
        if (i === 10) {
          break;
        }
        bot.reply(message, (i + 1) + '. ' + response.data.recipes[i].title);
        recipes.push(response.data.recipes[i].title);
      }
      bot.startConversation(message, function(err, convo) {
        convo.ask('Which would you like to have?', function(response, convo) {
          for (var i = 0; i < recipes.length; i++) {
            if (response.text == i + 1) {
              convo.ask('You have chosen: ' + recipes[i] + ' is that correct?', function(response, convo) {
                if (response.text == 'yes') {
                  convo.say('Great!');
                } else if (response.text == 'no') {
                  convo.say('Oh No!');
                }
                convo.next();
              });
            }
          }
          convo.next();
        });
      });
    })
    .catch(function(error) {
      bot.reply(message, 'Sorry, I did not find any recipes with ' + ingredient + '.');
    });



  // controller.storage.users.get(message.user, function(err, user) {
  //     if (!user) {
  //         user = {
  //             id: message.user,
  //         };
  //     }
  //     user.name = name;
  //     controller.storage.users.save(user, function(err, id) {
  //         // bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
  //         bot.reply(message, message.match);
  //
  //     });
  // });
});

// controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function(bot, message) {
//
//     controller.storage.users.get(message.user, function(err, user) {
//         if (user && user.name) {
//             bot.reply(message, 'Your name is ' + user.name);
//         } else {
//             bot.startConversation(message, function(err, convo) {
//                 if (!err) {
//                     convo.say('I do not know your name yet!');
//                     convo.ask('What should I call you?', function(response, convo) {
//                         convo.ask('You want me to call you `' + response.text + '`?', [
//                             {
//                                 pattern: 'yes',
//                                 callback: function(response, convo) {
//                                     // since no further messages are queued after this,
//                                     // the conversation will end naturally with status == 'completed'
//                                     convo.next();
//                                 }
//                             },
//                             {
//                                 pattern: 'no',
//                                 callback: function(response, convo) {
//                                     // stop the conversation. this will cause it to end with status == 'stopped'
//                                     convo.stop();
//                                 }
//                             },
//                             {
//                                 default: true,
//                                 callback: function(response, convo) {
//                                     convo.repeat();
//                                     convo.next();
//                                 }
//                             }
//                         ]);
//
//                         convo.next();
//
//                     }, {'key': 'nickname'}); // store the results in a field called nickname
//
//                     convo.on('end', function(convo) {
//                         if (convo.status == 'completed') {
//                             bot.reply(message, 'OK! I will update my dossier...');
//
//                             controller.storage.users.get(message.user, function(err, user) {
//                                 if (!user) {
//                                     user = {
//                                         id: message.user,
//                                     };
//                                 }
//                                 user.name = convo.extractResponse('nickname');
//                                 controller.storage.users.save(user, function(err, id) {
//                                     bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
//                                 });
//                             });
//
//
//
//                         } else {
//                             // this happens if the conversation ended prematurely for some reason
//                             bot.reply(message, 'OK, nevermind!');
//                         }
//                     });
//                 }
//             });
//         }
//     });
// });
//
//
// controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {
//
//     bot.startConversation(message, function(err, convo) {
//
//         convo.ask('Are you sure you want me to shutdown?', [
//             {
//                 pattern: bot.utterances.yes,
//                 callback: function(response, convo) {
//                     convo.say('Bye!');
//                     convo.next();
//                     setTimeout(function() {
//                         process.exit();
//                     }, 3000);
//                 }
//             },
//         {
//             pattern: bot.utterances.no,
//             default: true,
//             callback: function(response, convo) {
//                 convo.say('*Phew!*');
//                 convo.next();
//             }
//         }
//         ]);
//     });
// });
//
//
// controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
//     'direct_message,direct_mention,mention', function(bot, message) {
//
//         var hostname = os.hostname();
//         var uptime = formatUptime(process.uptime());
//
//         bot.reply(message,
//             ':robot_face: I am a bot named <@' + bot.identity.name +
//              '>. I have been running for ' + uptime + ' on ' + hostname + '.');
//
//     });
//
// function formatUptime(uptime) {
//     var unit = 'second';
//     if (uptime > 60) {
//         uptime = uptime / 60;
//         unit = 'minute';
//     }
//     if (uptime > 60) {
//         uptime = uptime / 60;
//         unit = 'hour';
//     }
//     if (uptime != 1) {
//         unit = unit + 's';
//     }
//
//     uptime = uptime + ' ' + unit;
//     return uptime;
// }
