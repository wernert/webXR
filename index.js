
//#region ------------------ Wake Lock ---------------------
// https://developers.google.com/web/updates/2019/12/nic79#wake-lock

// The wake lock sentinel.
let wakeLock = null;

// Function that attempts to request a wake lock.
wlog = (txt) => { document.getElementById("lockstat")
  .innerHTML += txt;
};

if ('wakeLock' in navigator){wlog('WakeLock  supported');}
else {wlog('WakeLock not supported');}

const requestWakeLock = async () => {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      wlog('Wake Lock was released');
    });
    wlog('Wake Lock is active');
  } catch (err) {
    wlog(`error: ${err.name}, ${err.message}`);
  }
};

// Function that attempts to release the wake lock.
const releaseWakeLock = async () => {
  if (!wakeLock) {
    return;
  }
  try {
    await wakeLock.release();
    wakeLock = null;
  } catch (err) {
    wlog(`error: ${err.name}, ${err.message}`);
  }
};
//#endregion

//#region ------------------ rotation lock ------------------
// https://whatwebcando.today/screen-orientation.html

var $ = document.getElementById.bind(document);

var orientKey = 'orientation';
if ('mozOrientation' in screen) {
  orientKey = 'mozOrientation';
} else if ('msOrientation' in screen) {
  orientKey = 'msOrientation';
}

var target = $('logTarget');
var device = $('device');
var orientationTypeLabel = $('orientationType');

function logChange (event) {
  var timeBadge = new Date().toTimeString().split(' ')[0];
  var newState = document.createElement('p');
  newState.innerHTML = '' + timeBadge + ' ' + event + '.';
  target.appendChild(newState);
}

if (screen[orientKey]) {
  function update() {
    var type = screen[orientKey].type || screen[orientKey];
    orientationTypeLabel.innerHTML = type;

    var landscape = type.indexOf('landscape') !== -1;

    if (landscape) {
      device.style.width = '180px';
      device.style.height = '100px';
    } else {
      device.style.width = '100px';
      device.style.height = '180px';
    }

    var rotate = type.indexOf('secondary') === -1 ? 0 : 180;
    var rotateStr = 'rotate(' + rotate + 'deg)';

    device.style.webkitTransform = rotateStr;
    device.style.MozTransform = rotateStr;
    device.style.transform = rotateStr;
  }

  update();

  var onOrientationChange = null;

  if ('onchange' in screen[orientKey]) { // newer API
    onOrientationChange = function () {
      logChange('Orientation changed to ' + screen[orientKey].type + '');
      update();
    };
  
    screen[orientKey].addEventListener('change', onOrientationChange);
  } else if ('onorientationchange' in screen) { // older API
    onOrientationChange = function () {
      logChange('Orientation changed to ' + screen[orientKey] + '');
      update();
    };
  
    screen.addEventListener('orientationchange', onOrientationChange);
  }

  // browsers require full screen mode in order to obtain the orientation lock
  var goFullScreen = null;
  var exitFullScreen = null;
  if ('requestFullscreen' in document.documentElement) {
    goFullScreen = 'requestFullscreen';
    exitFullScreen = 'exitFullscreen';
  } else if ('mozRequestFullScreen' in document.documentElement) {
    goFullScreen = 'mozRequestFullScreen';
    exitFullScreen = 'mozCancelFullScreen';
  } else if ('webkitRequestFullscreen' in document.documentElement) {
    goFullScreen = 'webkitRequestFullscreen';
    exitFullScreen = 'webkitExitFullscreen';
  } else if ('msRequestFullscreen') {
    goFullScreen = 'msRequestFullscreen';
    exitFullScreen = 'msExitFullscreen';
  }
}
$('lock').addEventListener('click', function () {
  document.documentElement[goFullScreen] && document.documentElement[goFullScreen]();

  var promise = null;
  if (screen[orientKey].lock) {
    promise = screen[orientKey].lock(screen[orientKey].type);
  } else {
    promise = screen.orientationLock(screen[orientKey]);
  }

  promise
    .then(function () {
      logChange('Screen lock acquired');
      $('unlock').style.display = 'block';
      $('lock').style.display = 'none';
    })
    .catch(function (err) {
      logChange('Cannot acquire orientation lock: ' + err);
      document[exitFullScreen] && document[exitFullScreen]();
    });
});

$('unlock').addEventListener('click', function () {
  document[exitFullScreen] && document[exitFullScreen]();

  if (screen[orientKey].unlock) {
    screen[orientKey].unlock();
  } else {
    screen.orientationUnlock();
  }

  logChange('Screen lock removed.');
  $('unlock').style.display = 'none';
  $('lock').style.display = 'block';
});
  //#endregion