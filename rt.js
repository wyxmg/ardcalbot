var fs = require('fs');
var jsonfile = require('jsonfile');


var raidFile = 'leaderlist.json';
var obji = jsonfile.readFileSync(raidFile);
console.log(obji[0][1]);
obji.push(["toombz", "blue"]);
jsonfile.writeFileSync(raidFile, obji);