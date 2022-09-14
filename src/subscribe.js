const EventSource = require("eventsource");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

let reorgFile = path.join(__dirname, 'reorgs.json');

let endpoint = `${process.env.SUBSCRIPTION_PATH}/eth/v1/events?topics=chain_reorg`;
let stream = new EventSource(endpoint);

let appendBlock = (block) => {
  fs.readFile(reorgFile, (error, data) => {
    if (error) {
      return console.error('Error reading file', error);
    }

    let json = JSON.parse(data);
    json.push(block);

    fs.writeFile(reorgFile, JSON.stringify(json), (error) => {
      if (error) {
        return console.error('Error writing to file', error);
      }
    });
  });
}

stream.addEventListener('chain_reorg', (e) => {
  let reorgEvent = JSON.parse(e.data);
  console.log('Chain reorg detected');
  console.log(reorgEvent);
  appendBlock(reorgEvent);
});

stream.addEventListener('open', (e) => {
  console.log('Subscribed to event stream -', e);
});

stream.addEventListener('error', (e) => {
  console.error('Error with event stream -', e);
});
