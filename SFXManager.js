var g_SFX = new SFXManager();
var KEY_TOGGLE_SOUND = 'N'.charCodeAt(0);

function handleSFXtoggles() {
    if (eatKey(KEY_TOGGLE_SOUND))
        g_SFX.toggleSound();
}

function SFXManager() {
    this.soundsEnabled = true;
    this.musicEnabled = true;

    this.SFX = {
        "bulletFire": {
            "audio": new Audio("sounds/bullet_fire.wav"),
            "interruptable": true},
        "bulletShieldHit": {
            "audio": new Audio("sounds/bullet_shield_hit.wav"),
            "interruptable": true},
        "bulletWallHit": {
            "audio": new Audio("sounds/bullet_wall_hit.wav"),
            "interruptable": true},
    };

    this.configure = function() {
        this.SFX.bulletFire.audio.volume = 1;
        this.SFX.bulletShieldHit.audio.volume = 1;
        this.SFX.bulletWallHit.audio.volume = 1;
    }

    this.play = function(sound) {
        if (!this.soundsEnabled)
          return;

        if (this.SFX[sound].interruptable == true ||
            this.SFX[sound].audio.paused == true) {
            // Call stop in case the sound is already playing (if applicable)
            this.stop(sound);
            this.SFX[sound].audio.play();
        }
    };

    this.stop = function (sound) {
        this.SFX[sound].audio.pause();
        this.SFX[sound].audio.currentTime = 0;
    };

    this.playMusic = function (_this) {
        if (!_this)
            _this = this;

        if (!_this.soundsEnabled)
            return;
    }

    this.stopMusic = function () {
       this.SFX.delorean.audio.pause();
       this.SFX.delorean.audio.currentTime = 0;
    }

    this.toggleSound = function () {
        this.soundsEnabled = !this.soundsEnabled;
    }

    this.configure();
    this.playMusic();
}

