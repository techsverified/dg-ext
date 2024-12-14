document.getElementById('requestPermissionButton').addEventListener('click', function () {
    // Request microphone permission
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function (stream) {
        alert('Permission granted!');
        stream.getTracks().forEach(track => track.stop()); // stop the media stream after granted
      })
      .catch(function (err) {
        alert('Permission denied: ' + err.message);
      });
  });
  
// get DOM elements
const apiInput = document.getElementById('api');
const saveButton = document.getElementById('setApiKey');

// reload api key into input field
function loadApiKey() {
  chrome.storage.local.get('key', ({ key }) => {
    if (key) {
      apiInput.value = key;
    }
  });
}

// save 
function saveApiKey() {
  const key = apiInput.value;
  chrome.storage.local.set({ 'key': key }, () => {
    // refresh after save.
    loadApiKey();
    alert('API Key saved!');
  });
}

// load on script init.
loadApiKey();

saveButton.addEventListener('click', saveApiKey);