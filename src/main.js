import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js';

import Skybox from './js/skybox.js';
import Body from './js/body.js'
import Asteroid from './js/asteroid.js'
import getNEOData from './js/neo-data-parser.js';
import raycast from './js/raycast.js'
import bodiesInfo from './js/bodyInfo.js'

// Physics constants


const canvas = document.querySelector('#c');
const scene = new THREE.Scene();

// Camera
const fov = 75;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
const controls = new OrbitControls(camera, canvas);
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

// Asteroid info
const asteroidInfo = document.getElementById('asteroid-name');
const boxPosition = new THREE.Vector3();

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

const sun = new Body(textureLoader, '/images/sun.jpg', 0 , 1.988e30, 0, 4);
const mercury = new Body(textureLoader, '/images/mercury.jpg', 5.79e10, 3.301e23,  47.9 * 1000, 1);
const venus = new Body(textureLoader, '/images/venus.jpg', 1.082e11, 4.867e24, 35 * 1000, 2);
const earth = new Body(textureLoader, '/images/earth_daymap.jpg', 1.496e11, 5.972e24, 29.78 * 1000, 2);
const mars = new Body(textureLoader, '/images/mars.jpg', 2.279e11, 6.417e23, 24.1 * 1000, 1.5);
const jupiter = new Body(textureLoader, '/images/jupiter.jpg', 7.786e11, 1.898e27, 13.1 * 1000, 8);
const saturn = new Body(textureLoader, '/images/saturn.jpg', 1.433e12, 5.683e26, 9.7 * 1000, 7);
const uranus = new Body(textureLoader, '/images/uranus.jpg', 2.872e12, 8.681e25, 6.8 * 1000, 5);
const neptune = new Body(textureLoader, '/images/neptune.jpg', 4.495e12, 1.024e26,  5.4 * 1000, 5);


const bodies = [sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune];
bodies.forEach((body) => {
    scene.add(body.mesh);
})

earth.mesh.name = 'earth'
sun.mesh.name = 'sun'

const bodyInfoContainer = document.getElementById('heavenly-body-info-container');
const bodyNameDiv = document.getElementById('heavenly-body-name');
const bodyInfoDiv = document.getElementById('heavenly-body-info');

// const skybox = new Skybox(scene, textureLoader);

// Asteroid
const NEOData = await getNEOData("2015-09-07", "2015-09-08");
const asteroid = new Asteroid(
    textureLoader,
    "/images/asteroid.jpg",
    NEOData["2015-09-08"][0],
    earth
);

earth.mesh.add(asteroid.mesh); // So that asteroid can "near miss" earth.
let initialAsteroidPos = asteroid.mesh.position.clone();

// Asteroid form
const asteroidForm = document.getElementById('asteroid-form');
function handleAsteroidFormSubmit(e) {
    e.preventDefault();
    console.log('lmao');
}
asteroidForm.addEventListener('submit', handleAsteroidFormSubmit);

/* Resize renderer if renderer's canvas
   size is not the same as the display size. */
function resizeRendererToDisplaySize(renderer) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) { renderer.setSize(width, height, false); }
    return needResize;
}

const timer = new THREE.Timer();
const simSpeed = 365.25 * 24 * 60 * 60/ 60; // 1 yr in 30 sec
timer.connect( document )
// Game loop
function render() {
    if(resizeRendererToDisplaySize(renderer)) {
        /* Changing aspect of camera to aspect of canvas  
           display size to prevent stretching of objects. */
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    // Rotations and revolutions
    const dt = timer.getDelta() * simSpeed;
    bodies.forEach((body) => {
        body.calcPosition(bodies, dt);
    })
    earth.calcPosition(bodies, dt);
    
    // skybox.animate(dt, 1);

    // Reset asteroid if it goes beyond 80 units
    if(Math.abs(asteroid.mesh.position.distanceTo(earth.mesh.position)) >= 80 ) {
        asteroid.resetPosition(earth);
        initialAsteroidPos = asteroid.mesh.position.clone();
    }

    asteroid.animate(earth);

    // Attatch asteroid info div to asteroid
    attatchInfoDivToAsteroid();

    // asteroidPOV();
    
    // Camera follows earth
    // const earthWorldPos = new THREE.Vector3();
    // earth.mesh.getWorldPosition(earthWorldPos);
    // controls.target.lerp(earthWorldPos, 0.1);
    // controls.update();

    // Raycast to get object being hovered on
    let objectHoveredOn = raycast(raycaster, mouse, camera, scene);
    // displayBodyInfo(objectHoveredOn);

    renderer.render(scene, camera);
    timer.update();

}
renderer.setAnimationLoop(render);

function asteroidPOV() {
    const asteroidWorldPos = new THREE.Vector3();
    asteroid.mesh.getWorldPosition(asteroidWorldPos);

    const earthWorldPos = new THREE.Vector3();
    earth.mesh.getWorldPosition(earthWorldPos);

    camera.position.copy(asteroidWorldPos.clone().add(new THREE.Vector3(0,1,0)));
    camera.lookAt(earthWorldPos);
}

function attatchInfoDivToAsteroid() {
    boxPosition.setFromMatrixPosition(asteroid.mesh.matrixWorld);
    boxPosition.project(camera);

    const widthHalf = canvas.width/2;
    const heightHalf = canvas.height/2;

    boxPosition.x = (boxPosition.x * widthHalf) + widthHalf;
    boxPosition.y = -(boxPosition.y * heightHalf)+ heightHalf;

    asteroidInfo.style.top = `${boxPosition.y}px`;
    asteroidInfo.style.left = `${boxPosition.x}px`;

    if(boxPosition.x < 0 ||
        boxPosition.y < 0 ||
        boxPosition.x > canvas.clientWidth ||
        boxPosition.y > canvas.clientHeight
    ) {
        asteroidInfo.style.display = 'none';
    } else {
        asteroidInfo.style.display = 'block';
    }
}

function displayBodyInfo(objectHoveredOn) {
    if(objectHoveredOn.name != ''){
        bodyInfoContainer.style.display = 'block';
        bodyNameDiv.innerText = bodiesInfo[objectHoveredOn.name].name;
        bodyInfoDiv.innerText = bodiesInfo[objectHoveredOn.name].info;
    } else {
        bodyInfoContainer.style.display = 'none';
        bodyNameDiv.innerText = "";
        bodyInfoDiv.innerText = "";
    }
}