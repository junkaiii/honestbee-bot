# HonestBee Smart Bot

The HonestBee Smart Bot is a chat bot that allows customers to keep track of their groceries and search for recipes through the food2fork api. It comes with a purchase advisor that checks whats available at home and gives suggestions on what is needed to buy in order to make the recipe.

___Walkthrough:___

You: init user (only need to be done once, once done, the bot will create a unique identifier for you and will remember you on next visit).

You: add ingredient (follow the instructions to add the ingredients available in your pantry)

Bot: What is the ingredient you want to add?

You: Ground Beef

Bot: Awesome. How many did you buy

You: 2

Bot: Whats the unit of purchase?

You: pound (you could enter pound, kg etc)

Bot: Ok, ingredient added! (Ingredient has been added to your profile)

You: find me <--what you would like to cook with--> (eg. find me pasta)

Bot: I found these recipes that use pasta: 1. Pasta with Pesto Cream Sauce, 2. The Best Lasagna Ever, 3. Shrimp Scampi ...

You: 1 (Choose the recipe you would like to cook with and reply with the coressponding number)

Bot: You have chosen: Pasta with Pesto Cream Sauce is that correct?

You: Yes

Bot: Great, you will need Ground Beef, Hot Breakfast Sausage... (Bot will tell you what are the ingredients needed)

Bot: You will need to buy 0.5 pound of Ground Beef...(Bot automatically knows what you are missing and need to buy or topup.)



__To deploy in local environment:__
  - Set your Slack token in line 26. (To generate a new nickname and token for the bot visit - https://my.slack.com/services/new/bot)
  - Type npm install
  - Type npm start
  - Open your slack page and start chatting with the bot!



__Current setbacks and improvments in next version:__
  - Diffing mechanism is not fully completed - it only compares alerts when you have a shortage of a particular ingredient not when it is completely unavailable in your pantry.
  - Rewrite 'find me' conversation - Refactor the code into proper conversations.
  - Send pictures of recipes over slack
  - Human speech?
