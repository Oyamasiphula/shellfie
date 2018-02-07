const player = require('play-sound')(opts = {});

player.play('./media/motionTrigAlarmSound.mp3', (err) => {
    if (err) console.log(`Could not play sound: ${err}`);
});
