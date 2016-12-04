const five = require('johnny-five');
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

var led = null;

// <layout> basic setup template handlebars as the template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res, next) {
  res.render('home');
});
app.get('/playground', function(req, res, next) {
  res.render('playground');
});

five.Board().on('ready', function() {
  console.log('Arduino is ready.');

  // Initial state for the LED light
  var state = {
    red: 1, green: 1, blue: 1
  };

  // Map pins to digital inputs on the board
  led = new five.Led.RGB({
    pins: {
      red: 6,
      green: 3,
      blue: 5
    }
  });

  // Helper function to set the colors
  var setStateColor = function(state) {
    led.color({
      red: state.red,
      blue: state.blue,
      green: state.green
    });
};

  // Listen to the web socket connection
  io.on('connection', function(client) {
    client.on('join', function(handshake) {
      console.log(handshake);
    });

    // Set initial state

    setStateColor(state);

  // Every time a 'rgb' event is sent, listen to it and grab its new values for each individual colour
    client.on('rgb', function(data) {
      state.red = data.color === 'red' ? data.value : state.red;
      state.green = data.color === 'green' ? data.value : state.green;
      state.blue = data.color === 'blue' ? data.value : state.blue;

      // Set the new colors
      setStateColor(state);

      client.emit('rgb', data);
      client.broadcast.emit('rgb', data);
    });

    // Turn on the RGB LED
    led.on();
  });
});

var port = process.env.PORT || 3000;

server.listen(port);
console.log('Server listening on http://localhost:${' + port + '}');
