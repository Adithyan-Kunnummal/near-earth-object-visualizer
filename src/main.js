import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js';

import Stars from './stars';
import Body from './body'
import NEO from './neo.js'
import raycast from './raycast'
import bodiesInfo from './bodyInfo'
import KER from './keplerian-elements-and-rates'
import {getNEOList, getNEOData} from './neo-data-parser';

const canvas = document.querySelector('#c');
const scene = new THREE.Scene();

// Camera
const fov = 75;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 2800
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
};
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

const sun = new Body(scene, textureLoader, '/images/sun.jpg', {}, 4);
const mercury = new Body(scene, textureLoader, '/images/mercury.jpg', KER["mercury"], 1);
const venus = new Body(scene, textureLoader, '/images/venus.jpg', KER["venus"], 2);
const earth = new Body(scene, textureLoader, '/images/earth_daymap.jpg', KER["earth"], 2);
const mars = new Body(scene, textureLoader, '/images/mars.jpg', KER["mars"], 1.5);
const jupiter = new Body(scene, textureLoader, '/images/jupiter.jpg', KER["jupiter"], 8);
const saturn = new Body(scene, textureLoader, '/images/saturn.jpg', KER["saturn"], 7);
const uranus = new Body(scene, textureLoader, '/images/uranus.jpg', KER["uranus"], 5);
const neptune = new Body(scene, textureLoader, '/images/neptune.jpg', KER["neptune"], 5);

// Naming bodies to identify the body being pointed at with mouse
sun.mesh.userData.id = 'sun';
mercury.mesh.userData.id = 'mercury';
venus.mesh.userData.id = 'venus';
earth.mesh.userData.id = 'earth';
mars.mesh.userData.id = 'mars';
jupiter.mesh.userData.id = 'jupiter';
saturn.mesh.userData.id = 'saturn';
uranus.mesh.userData.id = 'uranus';
neptune.mesh.userData.id = 'neptune';

// Add bodies to scene
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
const NEOList = await getNEOList(date, date);
const NEOs = [];

// Create and render todays NEO objects
NEOList[date].forEach(async (NEOData) => {
    const data = await getNEOData(NEOData.id);
    const orbitalData = data.orbital_data;

    const NEOKER = {
        a: orbitalData.semi_major_axis,
        e: orbitalData.eccentricity,
        I: orbitalData.inclination,
        n: orbitalData.mean_motion,
        omega: orbitalData.perihelion_argument,
        Omega: orbitalData.ascending_node_longitude,
        M0: orbitalData.mean_anomaly,
        tEpoch: orbitalData.epoch_osculation,
    };

    const NEOBody = new NEO(
        scene,
        textureLoader,
        "/images/asteroid.jpg",
        NEOData,
        earth,
        NEOKER
    );

    // Draw NEO's orbit
    NEOBody.drawOrbit(scene);

    NEOs.push(NEOBody);
});

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

    // Attatch NEO info div to NEO
    NEOs.forEach((NEO) => {
        NEO.updateInfoDiv(canvas, camera)
    });

    // Camera follows earth
    const earthWorldPos = new THREE.Vector3();
    earth.mesh.getWorldPosition(earthWorldPos);
    controls.target.lerp(earthWorldPos, 0.1);
    controls.update();

    // Raycast to get object being hovered on
    let objectHoveredOn = raycast(raycaster, mouse, camera, scene);
    displayBodyInfo(objectHoveredOn);

    renderer.render(scene, camera);
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