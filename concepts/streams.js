// Streaming from input.txt

var http = require('http');
var fs = require('fs');

var server = http.createServer(function (req, res) {
    var stream = fs.createReadStream(__dirname + '/input.txt');
    stream.pipe(res);
});
server.listen(3000);
