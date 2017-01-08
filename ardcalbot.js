var Discord = require("discord.js");
var bot = new Discord.Client();
calId = 267482898985123840;
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
		calendarId: 'ab29nkg5qcpsd876664ou4a76s@group.calendar.google.com',
		text: eventText[j]//"Doctors appointment on 1/9 at 2pm PST"
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
  });
}
    console.log(eventText);
  
}



//--------------------------------------------------------------------------------------------


/*calendar.events.quickAdd({
    auth: auth,
    calendarId: 'ab29nkg5qcpsd876664ou4a76s@group.calendar.google.com',
    text: eventText//"Doctors appointment on 1/9 at 2pm PST"
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
  });
*/




bot.on("message", msg => {
    if (msg.channel.id == calId)  {
		var msgContent = msg.content.split(" "); // turns content into array of words seperated by (and removing) spaces
		console.log(msgContent);
		var splitKeyDate = msgContent.indexOf("-");
		for (i = 0; i < splitKeyDate; i++){
			if (msgContent[i] != "and"){
				var eventTextDate;
				var eventTextTime;
				var eventTextDetails;
				
				eventTextDate = msgContent[i];

				//msg.channel.sendMessage(msgContent[i]);
				
				var msgContentDetails = msgContent.slice();
				msgContentDetails.splice(0, (splitKeyDate+1));
				eventTextTime = ((msgContentDetails[0]) + " EST");
				
				var eventDetails = "";
				for (k = 2; k < (msgContentDetails.length - 2); k++){
					eventDetails += " ";
					eventDetails += msgContentDetails[k];
				}
				
				//eventDetails = eventDetails.substring(0, eventDetails.length);
				eventTextDetails = (eventDetails + ". Link: " + msgContentDetails[msgContentDetails.length - 1]);
				
				eventText.push(eventTextDetails + " on " + eventTextDate + " at " + eventTextTime + " for three hours");
				

				
			}
			
		}
		fs.readFile('client_secret.json', function processClientSecrets(err, content) {
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