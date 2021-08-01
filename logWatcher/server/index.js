const express = require('express')
const Tail = require('better-tail')
const app = express();
const port = 4000;
const cors = require('cors');

app.use(express.json());
app.use(cors());
const LINES = 10;
const logs = [];

app.get('/', (req, res) => res.json({logs}));

const tail = new Tail('../logs.txt', { follow: true, lines: LINES });
    tail.on('line', function (line) {
      currentLine = line;
      logs.push({line: currentLine, created_at: Date.now()});
      if(logs.length > LINES) {
        logs.shift();
      }
  }).on('error', function (err) {
      console.error(err)
    })

app.listen(port, () => {
  console.log(`App server listening on port ${port}!`);
});
