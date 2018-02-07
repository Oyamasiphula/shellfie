      require('dotenv').config();
  var five = require("johnny-five"),
      player = require('play-sound')(opts = {}),
      board,
      motion,
      nodemailer = require('nodemailer'),
      accountSid = process.env.USERACCOUNTSID,
      authToken = process.env.USERAUTHTOKEN;

  var client = require('twilio')(accountSid, authToken);
  var myBoard,
      StartLedMode,
      piezoElement;
      // servo,
  var transporter = nodemailer.createTransport({
    service:process.env.USERMAILSERVER ,
    auth: {
          user: process.env.USERMAIL,
          pass: process.env.USERPASS
        }
});
  board = new five.Board();
  // setup e-mail data with unicode symbols
  var mailOptions = {
      from: process.env.FROMUSERMAILINSTANCE, // sender address
      to: process.env.TOUSERMAILINSTANCE, // list of receivers
      subject: process.env.TEXTMESSAGESUBJECT, // Subject line
      text: process.env.TEXTMESSAGE, // plaintext body
      html: process.env.HTMLBODY // html body
  };
  board.on("ready", function() {
    // Create a new `motion` hardware instance.
     motion = new five.Motion(7);
      StartLedMode = new five.Led(12);
        alertLedPin = new five.Led(13);
 //   servo = new five.Servo(8);
    piezoElement = new five.Piezo(3);
     // Inject the `motion` hardware into
    // the Repl instance's context;
    // allows direct command line access
    this.repl.inject({
      motion: motion,
        alertLedPin:alertLedPin,
          led2:StartLedMode,
              speaker: piezoElement
    // Pir Event API
    })
    // "calibrated" occurs once, at the beginning of a session,
    motion.on("calibrated", function(err) {
      console.log("calibrated");
    });
    // "motionstart" events are fired when the "calibrated"
    // Led strobe fast when motion has started
      motion.on("motionstart", function(err) {
      StartLedMode.strobe(50);
      console.log("motionstart");
    });
    // "motionstart" events are fired following a "motionstart event
    // when no movement has occurred led strobe slower in different patterns
   	 motion.on("motionend", function(err) {
		 console.log("Someone is braking into your room! Go CHECK! Go! Go!!! WARNING!!!");
    //  fire mplayer immediately when the motion has been triggered
     player.play('./media/motionTrigAlarmSound.mp3', (err) => {
         if (err) console.log(`Could not play sound: ${err}`);
     });

      StartLedMode.strobe(2000);
      //Below is call Me When led is done blinking using twilio
      client.calls.create({
          url: 'http://demo.twilio.com/docs/voice.xml',
          to: process.env.VERFDNUMTOCALL,
          from: process.env.VERFDTWILIONUM
      },
      (err, call) => {
        if(err){
        console.log(err)
        process.stdout.write(call.sid);
        }
      }
    );
     		// servo.sweep()
        // Below is send me an email after calling Me
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });

       //Below is Alert Sound Must play when motion is triggerd
      piezoElement.play({
      // song is composed by a string of notes
      // a default beat is set, and the default octave is used
      // any invalid note is read as "no note"
	  song: "G G A A G G A A G G A A A G G A A G G A A G G ",
      beats: 1 / 4,
      tempo: 100
    });
      alertLedPin.on();
    });
  });
