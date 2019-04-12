'use strict';

var _Constants = require('./Constants');

var _database = require('./database');

var _database2 = _interopRequireDefault(_database);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var app = express();
// const fs = require('fs');
var bodyParser = require('body-parser');
// const http = require('http');
// const request = require('request');
var rp = require('request-promise');


var port = 3000;
// const filePath = __dirname + '/MockProject/src/HelloWorld.java';
var NO_COMMENT = "There is no comment on this line";

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

    var options = {
        uri: 'https://api.github.com/repos/kgrover97/HelloWorld/contents/HelloWorld.java',
        qs: {
            access_token: _Constants.GITHUB_KEY
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };

    rp(options).then(function (data) {
        console.log('Data: ', data);
        console.log("Data URL is: " + data.download_url);

        var fileOptions = {
            uri: data.download_url,
            qs: {
                access_token: '42007401ca94547207c15f90c801a130a03f5e11'
            },
            headers: {
                'User-Agent': 'Request-Promise'
            }
        };

        rp(fileOptions).then(function (fileData) {
            var dataParsed = fileData.split("\n");
            console.log("Data Parsed: " + fileData);
            for (var i = 0; i < dataParsed.length; i++) {
                _database2.default.fileData[i] = dataParsed[i];
            }
            res.status(200).send(dataParsed);
        }).catch(function (err) {
            console.log("Database fill error: " + err);
            res.status(401).send("Could not fill database");
        });
    }).catch(function (err) {
        console.log("Fail in getting git data: " + err);
        res.status(401).send("Fail in getting git data");
    });
});

app.get('/all-comments', function (req, res) {
    res.status(200).send(_database2.default.fileData);
});

app.get('/get-dict', function (req, res) {
    res.status(200).send(_database2.default.fileDict);
});

app.post('/add-line-comment', function (req, res) {
    var body = req.body;

    if (!body.hasOwnProperty("line") || !body.hasOwnProperty("comment")) {
        res.status(400).send("Invalid Request follow format:\n{\n'line': number,\n'comment': String\n}");
        return;
    }

    var lineValue = _database2.default.fileData[body.line - 1];

    if (lineValue === undefined || lineValue.trim() === "") {
        res.status(202).send("Line is empty, please select a different line.");
        return;
    } else if (lineValue.includes("for(") || lineValue.includes("for (")) {
        res.status(202).send("Line is a for loop, please select a different line within the loop or select .");
        return;
    }

    if (!_database2.default.fileDict.hasOwnProperty(lineValue)) {
        _database2.default.fileDict[lineValue] = [];
    }

    _database2.default.fileDict[lineValue].push(body.comment);

    res.status(200).send("Line " + body.line + " set to " + body.comment);
});

app.post('/add-line-comment-range', function (req, res) {
    var body = req.body;
    console.log(body);

    if (!body.hasOwnProperty("start") || !body.hasOwnProperty("end") || !body.hasOwnProperty("comment")) {
        console.log("Invalid body");
        res.status(400).send("Invalid Request follow format:\n{\n'start': number,\n'end': number,\n'comment': String\n}");
        return;
    }

    console.log("Start: " + body.start);
    console.log("End: " + body.end);
    for (var i = body.start; i <= body.end; i++) {
        var lineValue = _database2.default.fileData[i - 1];
        if (lineValue === undefined || lineValue.trim().includes("for(") || lineValue.trim() === "") {
            if (lineValue !== undefined) {
                console.log("Trimmed line value is: " + lineValue.trim());
            } else {
                console.log("Line was undefined");
            }
            continue;
        }

        console.log("Line Val: " + lineValue);

        if (!_database2.default.fileDict.hasOwnProperty(lineValue)) {
            _database2.default.fileDict[lineValue] = [];
            console.log("Line " + i + " did not have comments so an array was added");
        }
        _database2.default.fileDict[lineValue].push(body.comment);
        console.log("Line " + i + " had comment: " + body.comment + " added to it");
    }

    console.log("Found the following in DB: ");
    console.log(JSON.stringify(_database2.default.fileDict));

    res.status(200).send(true);
});

app.post('/get-line-comment', function (req, res) {
    var body = req.body;

    if (!body.hasOwnProperty("line")) {
        throw new Error("Invalid Request follow format:\n{\n'line': number\n}");
    }

    var lineValue = _database2.default.fileData[body.line - 1];

    if (_database2.default.fileDict.hasOwnProperty(lineValue)) {
        var lineComment = _database2.default.fileDict[lineValue];
        res.status(200).send(lineComment);
    } else {
        if (lineValue === undefined || lineValue.trim() === "" || lineValue.trim().includes("for(")) {
            res.status(201).send("This line is blank or a for loop, please select a different line");
        } else {
            res.status(201).send(NO_COMMENT);
        }
    }
});

app.listen(port, function () {
    return console.log('Example app listening on port ' + port + '!');
});