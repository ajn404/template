import * as THREE from "three";
import { Renderer } from "./components/Renderer";
import { Camera } from "./components/Camera";
import { player } from "./components/Player";
import { map, initializeMap } from "./components/Map";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./style.css";
import { DirectionalLight } from "./components/DirectionalLight";
import { animateVehicles } from "./animateVehicles";

const scene: THREE.Scene = new THREE.Scene();
scene.add(player);
scene.add(map);

const ambientLight: THREE.AmbientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const dirLight: THREE.DirectionalLight = DirectionalLight();
scene.add(dirLight);

const camera: THREE.OrthographicCamera = Camera();
scene.add(camera);

initializeGame();

function initializeGame(): void {
  initializeMap();
}

const renderer: THREE.WebGLRenderer = Renderer();
renderer.render(scene, camera);

const controls: OrbitControls = new OrbitControls(camera, renderer.domElement);
controls.update();

function animate(): void { 
  animateVehicles();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate); 