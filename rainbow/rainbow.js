var fs = require('fs');
var md5 = require('md5');
var sprintf = require('sprintf-js').sprintf;
var readline = require('readline-sync').question;

//////////////////////////////////SETTINGS//////////////////////////////////////

function Table() {
  try {
    var data = fs.readFileSync('./config.json');
    var config = JSON.parse(data);
  } catch (err) {
    config = setSettings();
  }
  this.tableLength = config.Length;
  this.tablePath = config.Path;
  this.tableNum = config.Num;
}

/*
* User inputs chain length, number, and desired path to table.
*/
function setSettings() {
  var usrInput = {
    Length: 0,
    Num: 0,
    Path: ''
  }

  try {
    usrInput.Length = parseInt(readline('Chain length: '));
  } catch (err) {
    console.log('Chain length must be a number.\n' + err.message);
    throw err;
  }

  try {
    usrInput.Num = parseInt(readline('Number of chains: '));
  } catch (err) {
    console.log('Chain number must be a number.\n' + err.message);
    throw err;
  }

  try {
    usrInput.Path = readline('Path to table: ');
  } catch (err) {
    console.log('Invalid input.\n' + err.message);
    throw err;
  }

  var data = JSON.stringify(usrInput);
  try {
    fs.writeFileSync('./config.json', data);
  } catch (err) {
    console.log('\nThere has been an error saving your configuration data.' + err.message);
  }
  console.log('\nConfiguration saved successfully.');
  return usrInput;
}

//////////////////////////////////RAINBOW///////////////////////////////////////

/*
* Tries to match given hash with a hash in the table. If no match can be found,
* the reduction function is called and it searches through again.
*/
// Table.prototype.crack = function() {
//   var stream = fs.createReadStream(this.tablePath);
//
// }

/*
* Generates the list of chains, recording the first and last terms.
*/
Table.prototype.tableGen = function() {
  var head;
  var entry;
  var stream = fs.createWriteStream(this.tablePath);
  for (var j = 0; j < this.tableNum; j++) {
    head = toString(j);
    hash = chainGen(head);
    entry = sprintf('%s: %s\n', head, hash);
    stream.pipe(entry);
  }
};

/*
* Generates the [ reduce -> hash -> reduce ->... ] sequence.
*/
Table.prototype.chainGen = function(head) {
  var hash = md5(head);
  var reduced;
  for (var link = 0; link < this.tableLength; link++) {
    reduced = reduce(i, hash);
    hash = md5(reduced);
  }
  return hash;
};

/*
* The reduction function. Creates acceptable input for next hash.
*/
Table.prototype.reduce = function(link, hash) {
  var num;
  var reduced;
  var cycles = 2*randomInt(5,16);

  for (i = 0; i < cycle; i++) {
    num += hash[i]
    if (i%2 == 0 && i > 0) {
      num = parseInt(num + link, 36);
      num = num % 36;
      reduced += toString(num);
    }
  }
  return reduced;
};

/*
* Produces a random int between min and max.
*/
function randomInt(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

///////////////////////////////////ENTRY////////////////////////////////////////

var table = new Table();
switch (process.argv[2]) {
  case '-g' || '--generate':
    table.tableGen();
    break;
  // case '-c' || '--crack':
  //   table.crack();
  //   break;
  case '-s' || '--settings':
    setSettings();
    break;
  default:
    // table.crack();
    break;
}
