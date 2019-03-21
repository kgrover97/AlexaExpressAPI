'use strict';

var _database = require('./database');

var _database2 = _interopRequireDefault(_database);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var http = require('http');


var port = 3000;
var filePath = __dirname + '/MockProject/src/HelloWorld.java';
var NO_COMMENT = "There is no comment available for this line";

app.use(bodyParser.json());

app.get('/', function (req, res) {
    http.get({
        hostname: '142.93.158.249',
        port: 3000,
        path: '/build-files',
        agent: false // Create a new agent just for this one request
    }, function (result) {
        // Do stuff with response
        res.send(result.toString());
    });
});

app.get('/build-files', function (req, res) {
    fs.readFile(filePath, function (err, data) {
        if (err) throw err;
        var dataParsed = data.toString().split("\n");

        for (var i = 0; i < dataParsed.length; i++) {
            // console.log("Data: " + dataParsed[i]);
            _database2.default.fileData[i] = dataParsed[i];
        }

        res.send(_database2.default.fileData.toString());
    });
});

app.post('/add-line-comment', function (req, res) {
    var body = req.body;

    if (!body.hasOwnProperty("line") || !body.hasOwnProperty("comment")) {
        res.status(400).send("Invalid Request follow format:\n{\n'line': number,\n'comment': String\n}");
        return;
    }

    var lineValue = _database2.default.fileData[body.line - 1];
    if (!_database2.default.fileDict.hasOwnProperty(lineValue)) {
        _database2.default.fileDict[lineValue] = [];
    }
    _database2.default.fileDict[lineValue].push(body.comment);

    // TODO: Change to boolean
    res.status(200).send(lineValue + ": " + _database2.default.fileDict[lineValue]);
});

app.post('/add-line-comment-range', function (req, res) {
    var body = req.body;

    if (!body.hasOwnProperty("start") || !body.hasOwnProperty("end") || !body.hasOwnProperty("comment")) {
        res.status(400).send("Invalid Request follow format:\n{\n'start': number,\n'end': number,\n'comment': String\n}");
        return;
    }

    for (var i = body.start; i <= body.end; i++) {
        var lineValue = _database2.default.fileData[i - 1];
        if (!_database2.default.fileDict.hasOwnProperty(lineValue)) {
            _database2.default.fileDict[lineValue] = [];
        }
        _database2.default.fileDict[lineValue].push(body.comment);
    }

    console.log(JSON.stringify(_database2.default.fileDict));

    res.status(200).send(true);
});

app.get('/get-line-comment', function (req, res) {
    var body = req.body;

    if (!body.hasOwnProperty("line")) {
        throw new Error("Invalid Request follow format:\n{\n'line': number\n}");
    }

    var lineValue = _database2.default.fileData[body.line - 1];
    if (_database2.default.fileDict.hasOwnProperty(lineValue)) {
        var lineComment = _database2.default.fileDict[lineValue];
        res.status(200).send(lineComment);
    } else {
        res.status(201).send(NO_COMMENT);
    }
});

app.listen(port, function () {
    return console.log('Example app listening on port ' + port + '!');
});