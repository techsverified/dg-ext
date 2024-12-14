
document.getElementById('requestPermissionButton').addEventListener('click', function () {
    // request microphone permission.
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function (stream) {
        alert('Permission granted!');
        stream.getTracks().forEach(track => track.stop()); // stop the media stream after we get it.
      })
      .catch(function (err) {
        alert('permission denied! : ' + err.message);
      });
  });
  
// get DOM elements
const apiInput = document.getElementById('api');
const saveButton = document.getElementById('setApiKey');

// reload func
function loadApiKey() {
  chrome.storage.local.get('key', ({ key }) => {
    if (key) {
      apiInput.value = key;
    }
  });
}

// save func
function saveApiKey() {
  const key = apiInput.value;
  chrome.storage.local.set({ 'key': key }, () => {
    // refresh just incase
    loadApiKey();
    alert('API Key saved!');
  });
}

// load on script init
loadApiKey();

saveButton.addEventListener('click', saveApiKey);