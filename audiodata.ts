function visualizeAudio(analyser: AnalyserNode, object: THREE.Object3D) {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    function animate() {
      analyser.getByteFrequencyData(dataArray);
  
      // Example: Scale object based on audio intensity
      const avgFrequency = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      object.scale.set(avgFrequency / 50, avgFrequency / 50, avgFrequency / 50);
  
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
  }
  