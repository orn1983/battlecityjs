// =================
// KEYBOARD HANDLING
// =================

var keys = [];

function handleKeydown(evt) {
    // Prevent default actions for player controls
    if (evt.keyCode === keyCode(" ") ||
        evt.keyCode === 38 || // UP ARROW
        evt.keyCode === 40 || // DOWN ARROW
        evt.keyCode === 37 || // LEFT ARROW
        evt.keyCode === 39    // RIGHT ARROW
       )
        evt.preventDefault();
    keys[evt.keyCode] = true;
}

function handleKeyup(evt) {
    keys[evt.keyCode] = false;
}

// Inspects, and then clears, a key's state
//
// This allows a keypress to be "one-shot" e.g. for toggles
// ..until the auto-repeat kicks in, that is.
//
function eatKey(keyCode) {
    var isDown = keys[keyCode];
    keys[keyCode] = false;
    return isDown;
}

// A tiny little convenience function
function keyCode(keyChar) {
    return keyChar.charCodeAt(0);
}

window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);
