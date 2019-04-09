const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
// const http = require('http');
// const request = require('request');
const rp = require('request-promise');
import db from "./database";

const port = 3000;
const filePath = __dirname + '/MockProject/src/HelloWorld.java';
const NO_COMMENT = "There is no comment on this line, check that this line is not a for loop or a blank line";

app.use(bodyParser.json());

app.get('/', (req, res) => {
    http.get({
        hostname: '142.93.158.249',
        port: 3000,
        path: '/build-files',
        agent: false  // Create a new agent just for this one request
    }, (result) => {
        // Do stuff with response
        res.send(result.toString());
    });
});

app.get('/build-files', function (req, res) {

    const options = {
        uri: 'https://api.github.com/repos/kgrover97/HelloWorld/contents/HelloWorld.java',
        qs: {
            access_token: '42007401ca94547207c15f90c801a130a03f5e11'
        },
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    };

    rp(options)
        .then(function (data) {
            console.log('Data: ', data);
            console.log("Data URL is: " + data.download_url);

            const fileOptions = {
                uri: data.download_url,
                qs: {
                    access_token: '42007401ca94547207c15f90c801a130a03f5e11'
                },
                headers: {
                    'User-Agent': 'Request-Promise'
                }
            };

            rp(fileOptions)
                .then(function (fileData) {
                    let dataParsed = fileData.split("\n");
                    console.log("Data Parsed: " + fileData);
                    for (let i = 0; i < dataParsed.length; i++) {
                        db.fileData[i] = dataParsed[i];
                    }
                    res.status(200).send(dataParsed);
                })
                .catch(function (err) {
                    console.log("Database fill error: " + err);
                    res.status(401).send("Could not fill database");
                });


        })
        .catch(function (err) {
            console.log("Fail in getting git data: " + err);
            res.status(401).send("Fail in getting git data");
        });
});

app.get('/all-comments', function (req, res) {
    res.status(200).send(db.fileData);
});

app.get('/get-dict', function (req, res) {
    res.status(200).send(db.fileDict);
});

app.post('/add-line-comment', function (req, res) {
    let body = req.body;

    if (!body.hasOwnProperty("line") || !body.hasOwnProperty("comment")) {
        res.status(400).send("Invalid Request follow format:\n{\n'line': number,\n'comment': String\n}");
        return;
    }

    let lineValue = db.fileData[body.line - 1];

    if (lineValue === undefined) {
        res.status(202).send("Line is empty, please select a different line.");
        return;
    } else if (lineValue.includes("for(") || lineValue.includes("for (")) {
        res.status(202).send("Line is a for loop, please select a different line within the loop or select .");
        return;
    }

    if (!db.fileDict.hasOwnProperty(lineValue)) {
        db.fileDict[lineValue] = [];
    }

    db.fileDict[lineValue].push(body.comment);

    res.status(200).send("Line " + body.line + " set to " + body.comment);
});

app.post('/add-line-comment-range', function (req, res) {
    let body = req.body;
    console.log(body);

    if (!body.hasOwnProperty("start") || !body.hasOwnProperty("end") || !body.hasOwnProperty("comment")) {
        console.log("Invalid body");
        res.status(400).send("Invalid Request follow format:\n{\n'start': number,\n'end': number,\n'comment': String\n}");
        return;
    }


    console.log("Start: " + body.start);
    console.log("End: " + body.end);
    for (let i = body.start; i <= body.end; i++) {
        let lineValue = db.fileData[i - 1];
        if (lineValue === undefined || lineValue.includes("for(") || lineValue.includes("for (")) continue;

        console.log("Line Val: " + lineValue);

        if (!db.fileDict.hasOwnProperty(lineValue)) {
            db.fileDict[lineValue] = [];
            console.log("Line " + i + " did not have comments so an array was added");
        }
        db.fileDict[lineValue].push(body.comment);
        console.log("Line " + i + " had comment: " + body.comment + " added to it");
    }

    console.log("Found the following in DB: ");
    console.log(JSON.stringify(db.fileDict));

    res.status(200).send(true);
});

app.post('/get-line-comment', function (req, res) {
    let body = req.body;

    if (!body.hasOwnProperty("line")) {
        throw new Error("Invalid Request follow format:\n{\n'line': number\n}");
    }

    let lineValue = db.fileData[body.line - 1];

    if (db.fileDict.hasOwnProperty(lineValue)) {
        let lineComment = db.fileDict[lineValue];
        res.status(200).send(lineComment);
    } else {
        res.status(201).send(NO_COMMENT);
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));