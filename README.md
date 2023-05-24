## Run via Docker

### setup

#### MONGO_URI, Mongo Express,
 
##### Windows & WSL

- If you are running Mongo on WSL, set MONGO_URI to `mongodb://localhost:27017` in `.env`
- If you are wanting to run MongoExpress, you will need to be more specific and use `mongodb://172.20.22.225:27017` for Express to connect. You can use `http://172.20.22.225:8081/` in your Windows browser to view MongoExpress.

##### Mac

I'd guess `MONGO_URI=mongodb://localhost:27017` is fine?

run all services `docker-compose up`
build `docker-build -t teamflash-bot .`
run `docker run teamflash-bot`

## Boilerplate Readme

## 2. Adding the bot to your Discord server

To test your bot and actually use it, you need to create its "profile" and invite it to a Discord server! The amazing [discord.js Guide](https://discordjs.guide/) explains it very well [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot). Follow the steps on the page, then continue reading this guide!

Once you have generated a token, head to the `.env` file and paste it after the `BOT_TOKEN=`. Additionally, provide your bot's client ID for the `CLIENT_ID` field. You can find this in the "General Information" section, on the menu to the left in the Discord Developer Portal.

Finally, head to [this section](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links) to add the bot to your server!

## 3. Building and Running the Starter Code

- Run `npm install` to download all required Node.js packages.
- Run `npm run build` to build the TypeScript code. This will create a `build` folder, which contains the executable JavaScript code.
- Run `npm run deploy` to make your bot deploy commands. Deploying means telling Discord servers about your commands: their name, and a description.
- Finally, run `npm start` to start your bot up! The program should print "Bot is connected to Discord" if everything went well.

After you make any changes to the code, make sure to run `npm run build` and `npm start` again! As you should only be writing code in the `src` folder, this ensures you build it (i.e., "convert" it to JavaScript) in order to run it.

### b. Writing a new command

To create a new command, you should first start by creating a new TypeScript file `<command name>.ts` inside of the `src/commands` directory. You should make sure that the name of your file corresponds exactly to the name of the command you want to create.

Then, you must create a JavaScript object, that implements the `ICommand` interface. This interface specifies that your object must have two fields, `data` of type `SlashCommandBuilder`, and an asynchronous `execute` command. The `data` field holds information about the command (its name, and description), while the `execute` function contains the code that should be ran when a user types a comand. That is where you will write all the code for your command.

After that, you should make sure to set your `module.exports` equal to the ICommand object you just created. This ensures that it is accessible from other TypeScript files in the project.

Finally, you must run `npm run deploy` to deploy your new command to Discord's servers, before starting up your bot.

Useful comments can be found in the sample `ping.ts` we provided.
This [article from the discord.js Guide](https://discordjs.guide/slash-commands/response-methods.html#ephemeral-responses) is also very useful for creating commands.

## 5. Useful Resources

- A great [tutorial by Naomi Carrigan](https://www.freecodecamp.org/news/build-a-100-days-of-code-discord-bot-with-typescript-mongodb-and-discord-js-13/) which helped me write this guide.
- The absolutely amazing [discord.js Guide](https://discordjs.guide/).
- [discord.js Official Documentation](https://discord.js.org/#/docs/discord.js/main/general/welcome)
