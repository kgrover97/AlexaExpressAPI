const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const http = require('http');
import db from "./database";

const port = 3000;
const filePath = __dirname + '/MockProject/src/HelloWorld.java';
const NO_COMMENT = "There is no comment available for this line";

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
    fs.readFile(filePath, (err, data) => {
        if (err) throw err;
        let dataParsed = data.toString().split("\n");

        for (let i = 0; i < dataParsed.length; i++) {
            // console.log("Data: " + dataParsed[i]);
            db.fileData[i] = dataParsed[i];
        }

        res.status(200).send(true);
    });
});

app.post('/add-line-comment', function (req, res) {
    let body = req.body;

    if (!body.hasOwnProperty("line") || !body.hasOwnProperty("comment")) {
        res.status(400).send("Invalid Request follow format:\n{\n'line': number,\n'comment': String\n}");
        return;
    }

    let lineValue = db.fileData[body.line - 1];
    if (!db.fileDict.hasOwnProperty(lineValue)) {
        db.fileDict[lineValue] = [];
    }
    db.fileDict[lineValue].push(body.comment);

    // TODO: Change to boolean
    res.status(200).send(lineValue + ": " + db.fileDict[lineValue]);
});

app.post('/add-line-comment-range', function (req, res) {
    let body = req.body;

    if (!body.hasOwnProperty("start") || !body.hasOwnProperty("end") || !body.hasOwnProperty("comment")) {
        res.status(400).send("Invalid Request follow format:\n{\n'start': number,\n'end': number,\n'comment': String\n}");
        return;
    }


    console.log("Start: " + body.start);
    console.log("End: " + body.end);
    for (let i = body.start; i <= body.end; i++) {
        let lineValue = db.fileData[i - 1];
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