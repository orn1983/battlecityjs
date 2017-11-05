var g_SFX = new SFXManager();
var KEY_TOGGLE_SOUND = 'N'.charCodeAt(0);

function handleSFXtoggles() {
    if (eatKey(KEY_TOGGLE_SOUND))
        g_SFX.toggleSound();
}

function playSounds() {
    g_SFX.processRequests();
}

function SFXManager() {
    this.soundsEnabled = true;

    this.SFX = {
        "bulletFire": {
            "audio": new Audio("sounds/bullet_fire.wav"),
            "interruptable": true,
            "requested": false,
            "repeating": false},
        "bulletShieldHit": {
            "audio": new Audio("sounds/bullet_shield_hit.wav"),
            "interruptable": true,
            "requested": false,
            "repeating": false},
        "bulletWallHit": {
            "audio": new Audio("sounds/bullet_wall_hit.wav"),
            "interruptable": true,
            "requested": false,
            "repeating": false},
        "tankIdle": {
            "audio": new Audio("sounds/tank_idle.wav"),
            "interruptable": false,
            "requested": false,
            "repeating": true},
        "tankMove": {
            "audio": new Audio("sounds/tank_move.wav"),
            "interruptable": false,
            "requested": false,
            "repeating": true}
    };

    this.configure = function() {
        this.SFX.bulletFire.audio.volume = 1;
        this.SFX.bulletShieldHit.audio.volume = 1;
        this.SFX.bulletWallHit.audio.volume = 1;
    }

    this.request = function(sound) {
        this.SFX[sound].requested = true;
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

    this.processRequests = function() {
        for (var sound in this.SFX) {
            if (this.SFX[sound].requested) {
                if (sound !== "tankIdle" && sound !== "tankMove") {
                    this.play(sound);
                    this.SFX[sound].requested = false;
                }
                else {
                    // Special case for tank movement as we only play one at a time,
                    // even if we have two tanks requesting the sound
                    if (sound === "tankIdle") {
                        if (!this.SFX["tankMove"].requested) {
                            this.stop("tankMove");
                            this.play(sound);
                        }
                        this.SFX[sound].requested = false;
                    }
                    else {
                        this.stop("tankIdle");
                        this.play(sound);
                        this.SFX[sound].requested = false;
                    }
                }
            }
        }
    }

    this.stop = function (sound) {
        this.SFX[sound].audio.pause();
        this.SFX[sound].audio.currentTime = 0;
        this.SFX[sound].requested = false;
    };

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
}

