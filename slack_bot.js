// if (!process.env.token) {
//     console.log('Error: Specify token in environment');
//     process.exit(1);
// }

var Botkit = require('botkit');
var os = require('os');
var axios = require('axios');

var current_user;


var mongoStorage = require('botkit-storage-mongo')({
  mongoUri: 'mongodb://junkaiii:4480866l@ds057066.mlab.com:57066/slackbot'
});

var controller = Botkit.slackbot({
  // logLevel: 1, // 1 to 7
  stats_optout: true, // set true for privacy.
  // storage: mongoStorage,
  // json_file_store: 'path_to_json_database'
});

var bot = controller.spawn({
  token: 'xoxb-90244858867-lxtbcRgXJNYL0RVQL1Fz9Jkf'
    // token: process.env.token
}).startRTM();

controller.hears(['find me (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {

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
                  convo.say('Great, you will need: ');
                  axios.get('http://food2fork.com/api/get?key=d3799f6871828e8da7fce781da27fb8f&rId=' + chosen_recipe)
                    .then(function(response) {
                      // response = response;
                      // console.log(response.data.recipe.ingredients);
                      for (var i = 0; i < response.data.recipe.ingredients.length; i++) {
                        bot.reply(message, response.data.recipe.ingredients[i]);
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

controller.hears(['call me (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
  var name = message.match[1];
  controller.storage.users.get(message.user, function(err, user) {
    if (!user) {
      user = {
        id: message.user,
        ingredients: [{
          name: "mayonnaise",
          quantity: 0.25,
          unit: "cup"
        }]
      };
    }
    user.name = name;
    controller.storage.users.save(user, function(err, id) {
      bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
    });
  });
});

controller.hears(['what ingredients'], 'direct_message,direct_mention,mention', function(bot, message) {
  controller.storage.users.get(message.user, function(err, user) {
    if (!user) {
      user = {
        id: message.user,
        ingredients: [{
          name: "mayonnaise",
          quantity: 0.25,
          unit: "tub"
        },{
          name: "jam",
          quantity: 1,
          unit: "jar"
        }]
      };
    }
    controller.storage.users.save(user, function(err, id) {
      for (var i = 0; i < user.ingredients.length; i++) {
        bot.reply(message, 'You have: ' + user.ingredients[i].name);
      }
    });
  });
});


var ingredient_to_add = {};

askName = function(response, convo) {
  convo.ask("What is the ingredient you want to add?", function(response, convo) {
    convo.say("Awesome.");
    console.log(response);
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
    convo.say("Ok! Goodbye.");
    ingredient_to_add.unit = response.text;
    console.log(current_user);
    controller.storage.users.get(current_user.id, function(err, user) {
      current_user.ingredients.push(ingredient_to_add);
      controller.storage.users.save(current_user, function(err, id) {
        console.log(current_user);
        convo.say('Ingredient added!');
      });
    });
    convo.next();
  });
};

controller.hears(['add ingredient'], 'direct_message,direct_mention,mention', function(bot, message) {
  controller.storage.users.get(message.user, function(err, user) {
    current_user = user;
  });
  bot.startConversation(message, askName);
});

controller.hears(['test'], 'direct_message,direct_mention,mention', function(bot, message) {
  controller.storage.users.get(message.user, function(err, user) {
    console.log(user);
  });
});
