const express = require('express')
const fs = require('fs');
// const https = require('https');
const app = express();
const port = 4000;
const cors = require('cors');

app.use(express.json());
app.use(cors());
const LINES = 10;

const URL = '../logs.txt';

app.get('/', (req, res) => {
  const stream = fs.createReadStream(URL);

  // stream.resume();
  let cnt=0;
  let logs = [];

  stream.on('open', function () {
    console.log('stream opened');
  });

  stream.on('data', function (chunk) {
    cnt++;
    console.log('processing chunk', cnt);
    const chunkOfLogs = chunk.toString().split(/\r\n|\n\r|\n|\r/);
    const chunkSize = chunkOfLogs.length;
    logs = chunkOfLogs.slice(Math.max(chunkSize - LINES, 0));
  });

  stream.on('error', function(err) {
    console.log('Error reading the stream', err);
    res.end(err);
  });

  stream.on('end', (data) => {
    console.log('ending the read',  cnt, logs);
    const response = logs.map(curr => {
      return {
        line: curr,
        server_timestamp: Date.now()
      }
    });
    // stream.pause();
    res.status(200).send({logs:response});
  });
});

app.listen(port, () => {
  console.log(`App server listening on port ${port}!`);
});