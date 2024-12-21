async function captureAudio(): Promise<AudioContext> {
    const audioContext = new AudioContext();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
  
    source.connect(analyser);
    analyser.fftSize = 2048;
  
    return { audioContext, analyser };
  }
  