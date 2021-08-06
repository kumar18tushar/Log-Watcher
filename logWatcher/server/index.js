const express = require('express')
const fs = require('fs');
const https = require('https');
const app = express();
const port = 4000;
const cors = require('cors');
const moment = require('moment');

app.use(express.json());
app.use(cors());

const LINES = 10;
const IS_REMOTE = false;
// const URL = 'https://remote-file-url';
const URL = '../logs.txt';

const preFillTheLogFile = async() => {
  let data = '';
  let ctr = 0;
  for(let itr=0;itr<100000;itr++) {
    const date = new moment().add(ctr, 's').toISOString();
    ctr+=100;
    data += `${date}$LogText${itr}\n`
  }
  fs.writeFile('../logs.txt', data, (err) => {
    if (err) throw err;
  });
}

const processStream = (stream, res) => {
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
    console.log('ending the read');
    const response = logs.map(curr => {
      const currentLog = curr.split("$");

      return (curr.length) ? {
        line: currentLog[1],
        server_timestamp: currentLog[0]
      }: null
    }).filter(x => x);
    res.status(200).send({logs:response});
  });
}

const readAndProcessFileStream = (url, isRemote, process, res) => {
  if(isRemote) {
    https.get(url, (stream) => process(stream, res));
    return;
  }
  const stream = fs.createReadStream(url);
  process(stream, res);
}

app.get('/', (req, res) => {
  readAndProcessFileStream(URL, IS_REMOTE, processStream, res);    
});

app.listen(port, () => {
  /* for testing purpose */
  // preFillTheLogFile();
  console.log(`App server listening on port ${port}!`);
});