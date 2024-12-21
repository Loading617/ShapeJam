import * as THREE from 'three';

// Web Audio API: Capture and Analyze Audio
async function setupAudio(): Promise<{ analyser: AnalyserNode; audioContext: AudioContext }> {
  const audioContext = new AudioContext();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioContext.createMediaStreamSource(stream);

  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 512; // Lower value for better beat detection accuracy
  source.connect(analyser);

  return { analyser, audioContext };
}

// Beat Detection
class BeatDetector {
  private history: number[] = [];
  private sensitivity: number;

  constructor(private analyser: AnalyserNode, sensitivity: number = 1.5) {
    this.sensitivity = sensitivity;
  }

  detectBeat(): boolean {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    const energy = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

    this.history.push(energy);
    if (this.history.length > 60) this.history.shift(); // Keep 1-second history (assuming ~60 FPS)

    const avgEnergy = this.history.reduce((sum, value) => sum + value, 0) / this.history.length;

    return energy > avgEnergy * this.sensitivity;
  }
}

// WebGL Scene Setup
function setupScene(): { scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer } {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.z = 5;
  return { scene, camera, renderer };
}

// Add a Visual Object
function createVisualObject(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const sphere = new THREE.Mesh(geometry, material);

  return sphere;
}

// Animate Scene with Beat Detection
function animate(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  sphere: THREE.Mesh,
  beatDetector: BeatDetector
) {
  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(5, 5, 5);
  scene.add(light);

  function render() {
    if (beatDetector.detectBeat()) {
      // React to Beat
      sphere.scale.set(1.5, 1.5, 1.5);
      (sphere.material as THREE.MeshStandardMaterial).color.setHex(0xff0000); // Change color
    } else {
      // Reset Visuals
      sphere.scale.set(1, 1, 1);
      (sphere.material as THREE.MeshStandardMaterial).color.setHex(0x00ff00);
    }

    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  render();
}

// Main Function
async function main() {
  const { analyser } = await setupAudio();
  const { scene, camera, renderer } = setupScene();

  const sphere = createVisualObject();
  scene.add(sphere);

  const beatDetector = new BeatDetector(analyser, 1.5);
  animate(renderer, scene, camera, sphere, beatDetector);
}

main().catch(console.error);
