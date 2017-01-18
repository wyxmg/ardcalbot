var Discord = require("discord.js");
var bot = new Discord.Client();
var versionNum = 1.2;
var eventText = [];
var calChannel = "calendar";

	

var jsonfile = require('jsonfile');
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';




var raidLeaders;
var raidFile = 'leaderlist.json'
jsonfile.readFile(raidFile, function(err, obj) {
  raidLeaders = obj;
})
















// Load client secrets from a local file.


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}



/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * creates Function for new event
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function addARDEvent(auth) {
  var calendar = google.calendar('v3');
	for (j = 0; j < eventText.length; j++){
	  calendar.events.quickAdd({
		auth: auth,
		calendarId: 'aredditdystopia@gmail.com',//'aredditdystopia@gmail.com',
		colorId: 'green',
		text: eventText[j]
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
	else if (response){
		var summ = response.summary;
		response.colorId = 0;
		for (qu = 0; qu < raidLeaders.length; qu++){
			if (summ.toLowerCase().includes(raidLeaders[qu])){
				response.colorId = (qu+1);
				console.log("Raid Leader: " + raidLeaders[qu]);
			}
		}
		//console.log(response);
			calendar.events.update({
			  auth: auth,
			  calendarId: 'aredditdystopia@gmail.com',//areddit
			  eventId: response.id,
			  resource: response
			}, function(err, event) {
			  if (err) {
				console.log('There was an error contacting the Calendar service: ' + err);
				return;
			  }
			  //console.log('Event update: %s', event.htmlLink);
			});
		
	}
  });
  console.log ("New Event: " + eventText[j]);
}
  eventText = [];
}



//--------------------------------------------------------------------------------------------


bot.on("message", msg => {
	if (msg.content.startsWith("!") && msg.channel.recipient != undefined){
		if (msg.content.startsWith("!add")){
			var raidLeader = msg.content.substring(5);
			raidLeaders.push(raidLeader.toLowerCase());
			jsonfile.writeFileSync(raidFile, raidLeaders);
			console.log("Added raid leader " + raidLeader);
			msg.reply("Added raid leader " + raidLeader);
		}
		else if (msg.content.startsWith("!get")){
			var tempRaidList = "Raid Leaders Saved: \n";
			for (z = 0; z < raidLeaders.length; z++){
				tempRaidList += (raidLeaders[z] + "\n");
			}
			msg.reply(tempRaidList);
		}
		else if (msg.content.startsWith("!help")){
			var catal = "Commands: \n-------------- \n !add : adds a new raid leader *usage: !add* \n !get : retrieves list of raid leaders *usage: !get* \n !remove and !delete : removes a raid leader *usage: !remove RAIDLEADER* \n !help : Nice job!";
			msg.reply(catal);
		}
		else if (msg.content.startsWith("!remove") || msg.content.startsWith("!delete")){
			var raidLeader = msg.content.substring(8);
			if (raidLeaders.indexOf(raidLeader.toLowerCase()) > -1){
				raidLeaders.splice(raidLeaders.indexOf(raidLeader.toLowerCase()), 1);
				jsonfile.writeFileSync(raidFile, raidLeaders);
				msg.reply("Removed raid leader " + raidLeader);
				console.log("Removed raid leader " + raidLeader);
			}
			else{
				msg.reply("Raid Leader not found: " + raidLeader);
			}
		}
		else{
			msg.reply("Command not recognized- please use !help for commands")
		}
	}
    else if (msg.channel.name == calChannel) {
	var numLines = msg.content.split("\n");
	for (u = 0; u < numLines.length; u++){
		var msgContent = numLines[u].split(" "); // turns content into array of words seperated by (and removing) spaces
		var splitKeyDate = msgContent.indexOf("EST");
		var eventTime = (msgContent[(splitKeyDate-1)]);
		var eventDetails = "";
		for (ii = (splitKeyDate+1); ii < msgContent.length; ii ++){
			eventDetails += (" " + msgContent[ii]);
		}
		for (i = 0; i < splitKeyDate; i++){
			if (msgContent[i].includes("/")) {
				var eventDate = msgContent[i];
				eventText.push(eventDate + " - " + eventTime + " EST " + eventDetails);
				console.log(eventText);
			}
			
		}
		
	}
		fs.readFile('client_secret.json', function processClientSecrets(err, content) { // this is now outside of the loop because the callback was giving me a headache, and putting this in without it is like putting toombz on DPS- it just doesn't work
				  if (err) {
					console.log('Error loading client secret file: ' + err);
					return;
				  }
				  // Authorize a client with the loaded credentials, then call the
				  // Google Calendar API.
				  authorize(JSON.parse(content), addARDEvent);
				});
		
		
		
    }
});

bot.on('ready', () => {
  console.log('Ready! ARD Calendar Bot v' + versionNum);
});

bot.login("MjY3NDc4MjM1Nzg3Mjk2Nzc1.C2F44A.o8rOHAJUTsWvt_pr9m2ZILHuWcE");