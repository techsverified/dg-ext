
document.addEventListener('DOMContentLoaded', async () => { 
  const existingContexts = await chrome.runtime.getContexts({});
  console.log('panel opened');

  const offscreenDocument = existingContexts.find(
    (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
  ); 
  
  // if there's no off-sreen doc then make one.
  if (!offscreenDocument) { 
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'We gon capture sum media!'
    });
  }

  // recButtn handler
  const recordButton = document.getElementById('recordButton');
  recordButton.addEventListener('click', () => {
    chrome.storage.local.get('key', (result) => { 
      console.log(result.key);
      if (result.key) {      // if we have a key set..
        chrome.runtime.sendMessage({
          type: 'start-recording',
          target: 'offscreen',
          key: result.key
        });
      } else {
        alert("No key set, please set it in the extensions settings.");
      }
    });
  });
  
  // stopButtn handler
  const stopButton = document.getElementById('stopButton');
  stopButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'stop-recording',
      target: 'offscreen'
    });
  });

  // transcription display mech
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'transcription-update') {
      console.log('Received transcription from offscreen:', message.transcript);
      const transcriptContainer = document.getElementById('transcriptContainer');
      const newTranscript = document.createElement('p');
      newTranscript.textContent = message.transcript;
      newTranscript.style.fontWeight = 'bold';
      newTranscript.style.margin = '5px 0';
      transcriptContainer.appendChild(newTranscript);
      transcriptContainer.scrollTop = transcriptContainer.scrollHeight; // always scroll down
    }
  });
});