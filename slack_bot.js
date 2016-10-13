// if (!process.env.token) {
//     console.log('Error: Specify token in environment');
//     process.exit(1);
// }

var Botkit = require('botkit');
var os = require('os');
var axios = require('axios');

var current_user;
var output = [];


var mongoStorage = require('botkit-storage-mongo')({
  mongoUri: 'yourmongoURI'
});

var controller = Botkit.slackbot({
  // logLevel: 1, // 1 to 7
  stats_optout: true, // set true for privacy.
  // storage: mongoStorage,
  json_file_store: 'path_to_json_database'
});

var bot = controller.spawn({
  token: 'xoxb-90244858867-lxtbcRgXJNYL0RVQL1Fz9Jkf'
    // token: process.env.token
}).startRTM();

controller.hears(['find me (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
  controller.storage.users.get(message.user, function(err, user) {


    var ingredient = message.match[1];
    var recipes = [];
    var ids = [];

    axios.get('http://food2fork.com/api/search?key=d3799f6871828e8da7fce781da27fb8f&q=' + ingredient)
      .then(function(response) {
        bot.reply(message, 'I found these recipes that use ' + ingredient + ':');
        for (var i = 0; i < response.data.recipes.length; i++) {
          if (i === 10) {
            break;
          }
          bot.reply(message, (i + 1) + '. ' + response.data.recipes[i].title);
          recipes.push(response.data.recipes[i].title);
          ids.push(response.data.recipes[i].recipe_id);
        }
        bot.startConversation(message, function(err, convo) {
          convo.ask('Which would you like to have?', function(response, convo) {
            chosen_recipe = ids[response.text];
            for (var i = 0; i < recipes.length; i++) {
              if (response.text == i + 1) {
                convo.ask('You have chosen: ' + recipes[i] + ' is that correct?', function(response, convo) {
                  if (response.text == 'yes') {
                    bot.reply(message, 'Great, you will need: ');
                    axios.get('http://food2fork.com/api/get?key=d3799f6871828e8da7fce781da27fb8f&rId=' + chosen_recipe)
                      .then(function(response) {
                        // response = response;
                        // console.log(response.data.recipe.ingredients);
                        for (var i = 0; i < response.data.recipe.ingredients.length; i++) {
                          bot.reply(message, response.data.recipe.ingredients[i]);

                          var recepie_ingredient = new Object();
                          var string = response.data.recipe.ingredients[i];

                          if (string.match(/\d\-\d\/\d/g) != null) {
                            whole_number = string.split(' ')[0].split('-')[0];
                            first_fraction = string.split(' ')[0].split('-')[1].split('/')[0];
                            second_fraction = string.split(' ')[0].split('-')[1].split('/')[1];
                            recepie_ingredient.quantity = parseInt(whole_number) + (first_fraction / second_fraction);
                          } else if (string.match(/\d\/\d/g) != null) {
                            first_fraction = string.split(' ')[0].split('/')[0];
                            second_fraction = string.split(' ')[0].split('/')[1];
                            recepie_ingredient.quantity = first_fraction / second_fraction;
                          } else {
                            recepie_ingredient.quantity = parseInt(string.match(/\d*\d/g));
                          }

                          recepie_ingredient.unit = string.split(' ')[1];

                          recepie_ingredient.name = string.split(' ').slice(2).join(' ');

                          output[i] = recepie_ingredient;
                        }
                        for (j = 0; j < user.ingredients.length; j++) {
                          for (i = 0; i < output.length - 1; i++) {
                            if (output[i].name == user.ingredients[j].name) {
                              difference = user.ingredients[j].quantity - output[i].quantity;
                              console.log('You will need to buy ' + difference + ' ' + output[i].unit + ' of ' + output[i].name);
                              bot.reply(message, 'You will need to buy ' + difference + ' ' + output[i].unit + ' of ' + output[i].name);
                              console.log('found');
                            }
                            // if (user.ingredients[j].name != output[i].name) {
                            //   bot.reply(message, 'You will need to buy ' + output[i].quanitiy + ' ' + output[i].unit + ' of ' + output[i].name);
                            // }
                            else {
                              console.log('not found');
                            }
                          }
                        }
                      })
                      .catch(function(error) {
                        console.log(error);
                      });
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
  });
});

controller.hears(['init user'], 'direct_message,direct_mention,mention', function(bot, message) {
  controller.storage.users.get(message.user, function(err, user) {
    if (!user) {
      user = {
        id: message.user,
        ingredients: []
      };
    }
    controller.storage.users.save(user, function(err, id) {});
  });
});

// controller.hears(['call me (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
//   var name = message.match[1];
//   controller.storage.users.get(message.user, function(err, user) {
//     if (!user) {
//       user = {
//         id: message.user,
//         ingredients: [{
//           name: "mayonnaise",
//           quantity: 0.25,
//           unit: "cup"
//         }]
//       };
//     }
//     user.name = name;
//     controller.storage.users.save(user, function(err, id) {
//       bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
//     });
//   });
// });

controller.hears(['what ingredients'], 'direct_message,direct_mention,mention', function(bot, message) {
  controller.storage.users.get(message.user, function(err, user) {
    if (!user) {
      bot.reply(message, 'You do not have an account with us yet. Type "init user" to start!');
    } else {
      controller.storage.users.save(user, function(err, id) {
        if (user.ingredients.length < 1) {
          bot.reply(message, 'You have no ingredients yet! Type "add ingredient" to add some!');
        } else {
          for (var i = 0; i < user.ingredients.length; i++) {
            bot.reply(message, 'You have: ' + user.ingredients[i].name);
          }
        }
      });
    }
  });
});


var ingredient_to_add = {};

askName = function(response, convo) {
  convo.ask("What is the ingredient you want to add?", function(response, convo) {
    convo.say("Awesome.");
    ingredient_to_add.name = response.text;
    askQuantity(response, convo);
    convo.next();
  });
};
askQuantity = function(response, convo) {
  convo.ask("How many did you buy?", function(response, convo) {
    convo.say("Ok.");
    ingredient_to_add.quantity = response.text;
    askUnit(response, convo);
    convo.next();
  });
};
askUnit = function(response, convo) {
  convo.ask("Whats the unit of purchase?", function(response, convo) {
    ingredient_to_add.unit = response.text;
    controller.storage.users.get(current_user.id, function(err, user) {
      user.ingredients.push(ingredient_to_add);
      controller.storage.users.save(user, function(err, id) {});
      convo.say('Ok, ingredient added!');
    });
    convo.next();
  });
};

controller.hears(['add ingredient'], 'direct_message,direct_mention,mention', function(bot, message) {
  controller.storage.users.get(message.user, function(err, user) {
    current_user = user;
    if (!user) {
      bot.reply(message, 'You do not have an account with us yet. Type "init user" to start!');
    } else {
      bot.startConversation(message, askName);
    }
  });
});

controller.hears(['test'], 'direct_message,direct_mention,mention', function(bot, message) {
  controller.storage.users.get(message.user, function(err, user) {
    console.log(user);
  });
});
