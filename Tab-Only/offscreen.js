console.log("Offscreen document is running");


let socket;
let keepAliveInterval;
let globalRecorder;
let apiKey;


async function initSocket() {
  socket = new WebSocket('wss://api.deepgram.com/v1/listen?channels=1&encoding=opus&interim_results=true&language=en-US&model=nova-2&utterance_end_ms=1000&vad_events=true&no_delay=true', 
 ['token', apiKey]);

  socket.onopen = () => {
    console.log('WebSocket connection established');
    startKeepAlive();
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    //alerting here could help with more log-verbosity to the user
  };

  socket.onclose = (event) => {
    console.log('WebSocket closed', event);
    clearInterval(keepAliveInterval);  // hault sending keep-alives when the socket is closed
  };

  // transcription handler
  socket.onmessage = (event) => {
    const result = JSON.parse(event.data);
    //console.log('Raw result:', result);
    if (result.type === 'Results' && result.is_final) { // non .is_final = interem results :D
      const transcript = result.channel.alternatives[0].transcript;
      console.log('Transcription:', transcript);

      // send transcript to side-panel
      chrome.runtime.sendMessage({
        type: 'transcription-update',
        target: 'side-panel',
        transcript
      });

    // additional processing 
    console.log('Is final:', result.is_final);
    //console.log('Duration:', result.duration);
    //console.log('Start time:', result.start);
  } else {
    console.log('Received non-transcript message:', result.type);
  }
};
  
}

// keep the blood flowing.
function startKeepAlive() {
  keepAliveInterval = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'KeepAlive' }));
      console.log('Sent KeepAlive message');
    }
  }, 5000);  // keep-alive polling rate
}

function reset (){
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'CloseStream' }));
    socket.close();
    console.log('\nWebSocket closed gracefully...');
}
clearInterval(keepAliveInterval); // KILL keep-alive
globalRecorder = null;
}

async function startRecording() {
  console.log('Starting media recorder...');
  
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then(async screenAudio => {
      if (screenAudio.getAudioTracks().length === 0) { // sound check
        reset();
        reject(new Error('NO SOUND TRACK PROVIDED. Please refresh.'));
        return alert("There was no sound on the mediaStream you provided.");
      }
      
      const recorder = new MediaRecorder(screenAudio);
      
      recorder.ondataavailable = (event) => {
          if (socket.readyState === WebSocket.OPEN) {
              socket.send(event.data);
          } else {
              console.log("WebSocket not open");
          }
      };

      recorder.start(200); // basically blob polling rate
      globalRecorder = recorder; // store the recorder globally for passing :)
      resolve(recorder);
    }).catch(error => {
      alert("We didn't recieve a mediaStream from the tab :(");
      reset();
      reject(error);
    });
  });
}

async function stopRecording() {
    if (globalRecorder) {
        globalRecorder.stop(); //now we reference global.
        globalRecorder.stream.getTracks().forEach((track) => track.stop());
        console.log("Media recorder stopped...");
        reset();
    } else {
        console.error("No recorder to stop");
    }
}

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.target === 'offscreen') {
      switch (message.type) {
        case 'start-recording':
          console.log(message);
          apiKey = message.key;
          try {
            await initSocket();
            await new Promise(r => setTimeout(r, 2000));
            if (socket.readyState === WebSocket.OPEN) {
                await startRecording(); // We don't need the return value here since we use globalRecorder
            } else {
              alert("There was an issue connecting to DeepGram, please check your API key and try again.");
              console.log("Socket not open");
            }
          } catch (error) {
            console.error('Error starting recording:', error);
          }
          break;
        case 'stop-recording':
          await stopRecording();
          break;
        default:
          throw new Error('Unrecognized message:', message.type);
      }
    }
});