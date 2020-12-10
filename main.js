//To turn on the bot, navigate to your folder with cmd and run the code using "node ." command without the "".
//Before trying to run you need to download node.js and set up the discord.js and done.js. Here's a good guide https://developers.google.com/sheets/api/quickstart/nodejs
//This was part of a student project, so there's room for improvement.

const Discord = require('discord.js');//Require discord module.

const config = require('./config.json');//Here's the prefix "!" and token for our bot

const client = new Discord.Client();
//Creating the bot
var tuloste; //Variable for the data that we want the bot to print.

client.once('ready', () => {
    console.log('Valobotti on hereilla!');//Once the client is up and running, it will send a message to console.
});

//Below is the code and instructions from google node.js quickstart guide. Some of it is modified slightly.

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), tulostaViimeinenRivi);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */

function tulostaViimeinenRivi(auth) { //Gets the row we want the bot to post from the google sheet.
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: 'Your spreadsheet from the URL', //Which spreadsheet
    range: 'Which page from the spreadsheet and which columns', //Where in spreadsheet
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    
   
     if (rows.length) {
      
    rows.map((row) => {
        console.log(`${row[0]},${row[1]}, ${row[2]}, ${row[3]}`);
        if(row[2] == 1)
        {
        tuloste =`Liikettä havaittu viimeksi ${row[3]}, lamppu sytytetty.`;
        }
        else{
            tuloste = `Liikettä havaittu viimeksi ${row[3]}, lamppua ei sytytetty.`;
        }

      });
    } else {
      console.log('No data found.');
    }
     
  });
  
}


client.on('message', message => { //Discord bot message command
    if (message.content === '!valoja') { //Our command with the prefix
        fs.readFile('credentials.json', (err, content) => { //Authorizing again so the bot gets the new values without restarting the bot.
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Sheets API.
            authorize(JSON.parse(content), tulostaViimeinenRivi);
            
          }); 
          setTimeout(() => { //Timeout to let the code run before bot posting so the bot has the latest values from the spreadsheet.
            message.channel.send(`${tuloste}`); 
          }, 2000); 
    }
});


client.login(config.token);

