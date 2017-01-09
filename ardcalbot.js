var Discord = require("discord.js");
var bot = new Discord.Client();
calId = 267482898985123840; //discord #calendar id
var versionNum = 1.0;
var eventText = [];

	


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
		calendarId: '5i97ee31755cdpednf3fc9b3u0@group.calendar.google.com',
		text: eventText[j]
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
  });
  console.log ("New Event: " + eventText[j]);
}
  
}



//--------------------------------------------------------------------------------------------


bot.on("message", msg => {
    if (msg.channel.id == calId)  {
	var numLines = msg.content.split("\n");
	for (u = 0; u < numLines.length; u++){
		var msgContent = numLines[u].split(" "); // turns content into array of words seperated by (and removing) spaces
		var splitKeyDate = msgContent.indexOf("-");
		for (i = 0; i < splitKeyDate; i++){
			if (msgContent[i] != "and"){
				var eventTextDate;
				var eventTextTime;
				var eventTextDetails;
				
				eventTextDate = msgContent[i];
				
				var msgContentDetails = msgContent.slice();
				msgContentDetails.splice(0, (splitKeyDate+1));
				eventTextTime = ((msgContentDetails[0]) + " EST");
				
				var eventDetails = "";
				console.log(msgContentDetails);
				if (msgContentDetails.indexOf("-") < 0){
					for (p = 2; p < (msgContentDetails.length); p++){
					eventDetails += " ";
					eventDetails += msgContentDetails[p];
					}
					eventLink = "N/A";
					
				}
				else{
					
					
				for (k = 2; k < (msgContentDetails.length - 2); k++){
					eventDetails += " ";
					eventDetails += msgContentDetails[k];
				}
					eventLink = msgContentDetails[msgContentDetails.length - 1];
				}
				eventTextDetails = (eventDetails + ". Link: " + eventLink);
				
				eventText.push(eventTextDetails + " on " + eventTextDate + " at " + eventTextTime + " for three hours");
				

				
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

bot.login("MjY3NDc4MjM1Nzg3Mjk2Nzc1.C1M2yA.p_Vr0ZtutWCm9sRtgu7ep5vzn9c");