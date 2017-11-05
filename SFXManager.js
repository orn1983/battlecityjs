var g_SFX = new SFXManager();
var KEY_TOGGLE_SOUND = 'N'.charCodeAt(0);

function handleSFXtoggles() {
    if (eatKey(KEY_TOGGLE_SOUND))
        g_SFX.toggleSound();
}

function SFXManager() {
    this.soundsEnabled = true;

    this.SFX = {
        "bulletFire": {
            "audio": new Audio("sounds/bullet_fire.wav"),
            "interruptable": true,
            "repeating": false},
        "bulletShieldHit": {
            "audio": new Audio("sounds/bullet_shield_hit.wav"),
            "interruptable": true,
            "repeating": false},
        "bulletWallHit": {
            "audio": new Audio("sounds/bullet_wall_hit.wav"),
            "interruptable": true,
            "repeating": false},
        "tankIdle": {
            "audio": new Audio("sounds/tank_idle.wav"),
            "interruptable": false,
            "repeating": true},
        "tankMove": {
            "audio": new Audio("sounds/tank_move.wav"),
            "interruptable": false,
            "repeating": true}
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
            if (this.SFX[sound].repeating === true) {
                this.SFX[sound].audio.addEventListener("ended", function () {
                    // OA: There is an audiable silence in between. TODO fix maybe?
                    this.currentTime = 0;
                    this.play();
                }, false);
            }
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
        if (!this.soundsEnabled) {
            for (var sound in this.SFX) {
                this.stop(sound);
            }
        }

    }

    this.configure();
    this.playMusic();
}

