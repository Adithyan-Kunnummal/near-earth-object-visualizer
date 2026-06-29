import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js';

import Skybox from './js/skybox.js';
import Body from './js/body.js'
import Asteroid from './js/asteroid.js'
import getNEOData from './js/neo-data-parser.js';
import raycast from './js/raycast.js'

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
const mouse = new THREE.Vector2();
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('mousemove', onMouseMove, false);

// Raycaster
const raycaster = new THREE.Raycaster();

// Asteroid info
const asteroidInfo = document.getElementById('asteroid-info');
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

const sun = new Body(textureLoader, '/images/sun.jpg', 3);
const earth = new Body(textureLoader, '/images/earth_daymap.jpg', 2);
const moon = new Body(textureLoader, '/images/moon.jpg', 1);

const solarSystem = new THREE.Object3D();
const earthOrbit = new THREE.Object3D();
const moonOrbit = new THREE.Object3D();

scene.add(solarSystem);
solarSystem.add(sun.mesh);
solarSystem.add(earthOrbit);
earthOrbit.add(earth.mesh);
earth.mesh.add(moonOrbit);
moonOrbit.add(moon.mesh);

const skybox = new Skybox(scene, textureLoader);

// Asteroid
const NEOData = await getNEOData("2015-09-07", "2015-09-08");
const asteroid = new Asteroid(
    textureLoader,
    "/images/asteroid.jpg",
    NEOData["2015-09-08"][0],
    earth
);

earthOrbit.add(asteroid.mesh); // So that asteroid can "near miss" earth.
let initialAsteroidPos = asteroid.mesh.position.clone();

/* Resize renderer if renderer's canvas
   size is not the same as the display size. */
function resizeRendererToDisplaySize(renderer) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) { renderer.setSize(width, height, false); }
    return needResize;
}

// Game loop
function render(time) {
    if(resizeRendererToDisplaySize(renderer)) {
        /* Changing aspect of camera to aspect of canvas  
           display size to prevent stretching of objects. */
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    // Rotations and revolutions
    sun.rotate(time, 0.1); earth.rotate(time); moon.rotate(time);
    earth.revolve(time, 15); moon.revolve(time, 5);
    
    skybox.animate(time, 8);

    // Reset asteroid if it goes beyond 80 units
    if(Math.abs(asteroid.mesh.position.distanceTo(earth.mesh.position)) >= 80 ) {
        asteroid.resetPosition(earth);
        initialAsteroidPos = asteroid.mesh.position.clone();
    }

    asteroid.animate(earth);

    // Attatch asteroid info div to asteroid
    attatchInfoDivToAsteroid(boxPosition, camera);

    // asteroidPOV(asteroid, earth, camera);
    
    // Camera follows earth
    const earthWorldPos = new THREE.Vector3();
    earth.mesh.getWorldPosition(earthWorldPos);
    controls.target.lerp(earthWorldPos, 0.1);
    controls.update();

    // Raycast to get object being hovered on
    raycast(raycaster, mouse, camera, scene)

    renderer.render(scene, camera);

}
renderer.setAnimationLoop(render);

function asteroidPOV(asteroid, earth, camera) {
    const asteroidWorldPos = new THREE.Vector3();
    asteroid.mesh.getWorldPosition(asteroidWorldPos);

    const earthWorldPos = new THREE.Vector3();
    earth.mesh.getWorldPosition(earthWorldPos);

    camera.position.copy(asteroidWorldPos.clone().add(new THREE.Vector3(0,1,0)));
    camera.lookAt(earthWorldPos);
}

function attatchInfoDivToAsteroid(boxPosition, camera) {
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