import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js';

import Stars from './js/stars.js';
import Body from './js/body.js'
import Asteroid from './js/asteroid.js'
import getNEOData from './js/neo-data-parser.js';
import raycast from './js/raycast.js'
import bodiesInfo from './js/bodyInfo.js'
import KER from './js/keplerian-elements-and-rates.js'

const canvas = document.querySelector('#c');
const scene = new THREE.Scene();

// Camera
const fov = 75;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 2500
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const controls = new OrbitControls(camera, canvas);
controls.maxDistance = 1200;
camera.position.set(0, 10, 30);

// Renderer
const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

// Mouse pos to pos on screen
const mouse = new THREE.Vector2(999,999);
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('mousemove', onMouseMove, false);

// Raycaster
const raycaster = new THREE.Raycaster();

// Light
{
    const color = 0xffffff;
    const intensity = 2;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
}

// Bodies
const textureLoader = new THREE.TextureLoader();

const sun = new Body(scene, textureLoader, '/images/sun.jpg', 0 , 1.988e30, 0, {}, 4);
const mercury = new Body(scene, textureLoader, '/images/mercury.jpg', 5.79e10, 3.301e23,  47.9 * 1000, KER["mercury"], 1);
const venus = new Body(scene, textureLoader, '/images/venus.jpg', 1.082e11, 4.867e24, 35 * 1000, KER["venus"], 2);
const earth = new Body(scene, textureLoader, '/images/earth_daymap.jpg', 1.496e11, 5.972e24, 29.78 * 1000, KER["earth"], 2);
const mars = new Body(scene, textureLoader, '/images/mars.jpg', 2.279e11, 6.417e23, 24.1 * 1000, KER["mars"], 1.5);
const jupiter = new Body(scene, textureLoader, '/images/jupiter.jpg', 7.786e11, 1.898e27, 13.1 * 1000, KER["jupiter"], 8);
const saturn = new Body(scene, textureLoader, '/images/saturn.jpg', 1.433e12, 5.683e26, 9.7 * 1000, KER["saturn"], 7);
const uranus = new Body(scene, textureLoader, '/images/uranus.jpg', 2.872e12, 8.681e25, 6.8 * 1000, KER["uranus"], 5);
const neptune = new Body(scene, textureLoader, '/images/neptune.jpg', 4.495e12, 1.024e26,  5.4 * 1000, KER["neptune"], 5);

sun.mesh.userData.id = 'sun';
mercury.mesh.userData.id = 'mercury';
venus.mesh.userData.id = 'venus';
earth.mesh.userData.id = 'earth';
mars.mesh.userData.id = 'mars';
jupiter.mesh.userData.id = 'jupiter';
saturn.mesh.userData.id = 'saturn';
uranus.mesh.userData.id = 'uranus';
neptune.mesh.userData.id = 'neptune';

const bodies = [sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];
bodies.forEach((body) => {
    scene.add(body.mesh);
});

// Drawing sun at the center
sun.mesh.position.set(0,0,0);

// Drawing orbits for all planets
bodies.forEach((body) => {
    if(body.mesh.userData.id == 'sun') return
    body.drawOrbit(scene);
});

// Reference to divs holding info about bodies
const bodyInfoContainer = document.getElementById('heavenly-body-info-container');
const bodyNameDiv = document.getElementById('heavenly-body-name');
const bodyInfoDiv = document.getElementById('heavenly-body-info');

// Stars
const stars = new Stars(scene);

// Today's NEOs
const date = new Date().toISOString().split('T')[0];
const NEOData = await getNEOData(date, date);
const NEOs = [];
NEOData[date].map((NEO) => {
    NEOs.push(new Asteroid(
        scene,
        textureLoader,
        "/images/asteroid.jpg",
        NEO,
        earth
    ))
});

// Adding asteroids to earths mesh so they have similar movement
NEOs.forEach((NEO) => {
    earth.mesh.add(NEO.mesh);
})

/* Resize renderer if renderer's canvas
   size is not the same as the display size. */
function resizeRendererToDisplaySize(renderer) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) { renderer.setSize(width, height, false); }
    return needResize;
}

// Time
const timer = new THREE.Timer();
const simulationSpeed = 365.25 * 24 * 60 * 60/ 120; // 1 yr in 30 sec
timer.connect(document);

// Game loop
function render() {
    if(resizeRendererToDisplaySize(renderer)) {
        /* Changing aspect of camera to aspect of canvas  
           display size to prevent stretching of objects. */
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    // Rotate stars along y axis
    stars.animate();

    // Attatch asteroid info div to asteroid
    NEOs.forEach((NEO) => {
        NEO.attatchInfoDiv(canvas, camera)
    })

    // Line from asteroid to earth
    NEOs.forEach((NEO) => {
        NEO.updateLineToEarth(earth)
    })

    // Camera follows earth
    const earthWorldPos = new THREE.Vector3();
    earth.mesh.getWorldPosition(earthWorldPos);
    controls.target.lerp(earthWorldPos, 0.1);
    controls.update();

    // Raycast to get object being hovered on
    let objectHoveredOn = raycast(raycaster, mouse, camera, scene);
    displayBodyInfo(objectHoveredOn);

    renderer.render(scene, camera);
    timer.update();

}
renderer.setAnimationLoop(render);

// Celestial body info
function displayBodyInfo(objectHoveredOn) {
    if (!objectHoveredOn || !objectHoveredOn.userData.id) {
        bodyInfoContainer.style.display = 'none';
        return;
    }

    const info = bodiesInfo[objectHoveredOn.userData.id];

    if (!info) {
        bodyInfoContainer.style.display = 'none';
        return;
    }

    bodyInfoContainer.style.display = 'block';
    bodyNameDiv.innerText = info.name;
    bodyInfoDiv.innerText = info.info;
}