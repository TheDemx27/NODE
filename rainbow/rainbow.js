var fs = require('fs')
var md5 = require('md5')
var sprintf = require('sprintf-js').sprintf
var readline = require('readline-sync').question

//////////////////////////////////SETTINGS//////////////////////////////////////

function Table() {
  try {
    var data = fs.readFileSync('./config.json')
    var config = JSON.parse(data)
  } catch (err) {
    config = setSettings()
  }
  this.maxCharNum = config.MaxChar
  this.minCharNum = config.MinChar
  this.tableLength = config.Length
  this.chainNum = config.Num
  this.tablePath = config.Path
}

/*
* User inputs chain length, number, and desired path to table.
*/
function setSettings() {
  var usrInput = {
    MinChar: 0,
    MaxChar: 0,
    Length: 0,
    Num: 0,
    Path: ''
  }

  try {
    usrInput.MinChar = parseInt(readline('Minimum character number: '))
  } catch (err) {
    console.log('Character number must be an integer.\n' + err.message)
    throw err
  }

  try {
    usrInput.MaxChar = parseInt(readline('Maximum character number: '))
  } catch (err) {
    console.log('Character number must be an integer.\n' + err.message)
    throw err
  }

  try {
    usrInput.Length = parseInt(readline('Chain length: '))
  } catch (err) {
    console.log('Chain length must be a number.\n' + err.message)
    throw err
  }

  try {
    usrInput.Num = parseInt(readline('Number of chains: '))
  } catch (err) {
    console.log('Chain number must be a number.\n' + err.message)
    throw err
  }

  try {
    usrInput.Path = readline('Path to table: ')
  } catch (err) {
    console.log('Invalid input.\n' + err.message)
    throw err
  }

  var data = JSON.stringify(usrInput)
  try {
    fs.writeFileSync('./config.json', data)
  } catch (err) {
    console.log('\nThere has been an error saving your configuration data.' + err.message)
  }
  console.log('\nConfiguration saved successfully.')
  return usrInput
}

//////////////////////////////////RAINBOW///////////////////////////////////////

/*
* Tries to match given hash with a hash in the table. If no match can be found,
* the reduction function is called and it searches through again.
*/
Table.prototype.crack = function(hash) {
  var table
  var chunk

/*
* Read the table.
*/
  if (!this.tablePath) {
    table.setSettings()
  }
  var stream = fs.createReadStream(this.tablePath)
  stream.on('readable', function() {
    try {table = stream.read().toString()} catch (e) {}
  })
/*
* Parse the table.
*/
  var index
  var currentTails
  var currentHeads
  var stepNum = 0
  for (var i = 0; i < table.length; i++) {
    switch table[i] {
    case ':':
      currentHeads.push(chunk)
      chunk = ''
      break
    case ',':
      currentTails.push(chunk)
      chunk = ''
      break
    default:
      chunk += table[i]
      break
    }
  }

  /*
  * Search table for hash.
  */
  var stepped
  var head
  var tail
  index = currentTails.indexOf(hash)
  while (index == -1 && stepNum <= this.tableLength) {
    hash = step(hash)
    stepNum++
    index = currentTails.indexOf(hash)
  }
  if (stepNum == this.tableLength && index == -1) {
    console.log('Hash not found.')
  } else if (index != -1) {
    head = currentHeads[index]
    for (var i = 0; i < stepNum-1; i++) {
      stepped = step(md5(head))
    }
    console.log(table.reduce(stepped))
  }
};

Table.prototype.step = function(hash) {
  reduced = table.reduce(hash)
  return md5(reduced)
};

/*
* Generates the list of chains, recording the first and last terms.
*/
Table.prototype.tableGen = function() {
  var head
  var entry
  var stream = fs.createWriteStream(this.tablePath)
  for (var j = 0; j < this.chainNum; j++) {
    process.stdout.write((j + 1) + '/' + this.chainNum + '\r')
    head = j.toString()
    hash = table.chainGen(head)
    entry = sprintf('%s:%s,', head, hash)
    stream.write(entry)
  }
  console.log('\nDone')
  stream.end()
};

/*
* Generates the [ reduce -> hash -> reduce ->... ] sequence.
*/
Table.prototype.chainGen = function(head) {
  var hash = md5(head)
  var reduced
  for (var link = 0; link < this.tableLength; link++) {
    step(hash)
  }
  return hash
};

/*
* The reduction function. Creates acceptable input for next hash.
*/
Table.prototype.reduce = function(hash) {
  hash = parseInt(hash, 16)
  hash = hash.toString(36)
  var length = 7 //(link % this.maxCharNum + 1) + this.minCharNum
  var reduced = hash.substring(0, length)
  return reduced
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

///////////////////////////////////ENTRY////////////////////////////////////////

var table = new Table()
switch (process.argv[2]) {
  case '-g' || '--generate':
    table.tableGen()
    break
  case '-c' || '--crack':
    table.crack()
    break
  case '-s' || '--settings':
    setSettings()
    break
  default:
    console.log(process.argv[2])
    break
}
