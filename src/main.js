import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js';

import Camera from  './js/camera.js';
import Skybox from './js/skybox.js';
import Body from './js/body.js'
import Asteroid from './js/asteroid.js'
import getNEOData from './js/neo-data-parser.js';
import raycast from './js/raycast.js'

async function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    const camera = new Camera(canvas);
    const scene = new THREE.Scene();
    const textureLoader = new THREE.TextureLoader();
    const mouse = new THREE.Vector2(999,999);
    const raycaster = new THREE.Raycaster( );
    const asteroidInfo = document.getElementById('asteroid-info');
    const boxPosition = new THREE.Vector3();

    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener('mousemove', onMouseMove, false);


    // Light
    {
        const color = 0xffffff;
        const intensity = 2;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    const sun = new Body(textureLoader, '/images/sun.jpg', 3);
    const earth = new Body(textureLoader, '/images/earth_daymap.jpg', 2);
    const moon = new Body(textureLoader, '/images/moon.jpg', 1);

    const solarSystem = new THREE.Object3D();
    const earthOrbit = new THREE.Object3D();
    const moonOrbit = new THREE.Object3D();

    // Scenegraph
    scene.add(solarSystem);
    solarSystem.add(sun.mesh);
    solarSystem.add(earthOrbit);
    earthOrbit.add(earth.mesh);
    earth.mesh.add(moonOrbit);
    moonOrbit.add(moon.mesh);

    const skybox = new Skybox(scene, textureLoader);

    // Asteroid
    const NEOData = await getNEOData("2015-09-07", "2015-09-08");
    const asteroid = new Asteroid(textureLoader, "/images/asteroid.jpg", NEOData["2015-09-08"][0], earth);

    earthOrbit.add(asteroid.mesh); // So that asteroid can "near miss" earth.
    let initialAsteroidPos = asteroid.mesh.position.clone();

    /* Resize renderer if renderer's canvas
       size is not the same as the display size. */
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }


    // GameLoop
    function render(time) {
        // Change camera aspect if renderer was resized.
        if(resizeRendererToDisplaySize(renderer)) {

            /* Changing aspect of camera to aspect of canvas  
               display size to prevent stretching of objects. */
            const canvas = renderer.domElement;
            camera.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.camera.updateProjectionMatrix();
        }

        // Rotations and revolutions
        sun.animate(time, 0.1)
        earth.animate(time)
        moon.animate(time)

        earth.mesh.position.x = 15 * Math.sin(time * 0.0001);
        earth.mesh.position.z = 15 * Math.cos(time * 0.0001);
        moon.mesh.position.x = 5 * Math.sin(time * 0.00001);
        moon.mesh.position.z = 5 * Math.cos(time * 0.00001);
        skybox.animate(time, 0.8);

        // Reset asteroid if it goes beyond 20 units
        if(Math.abs(asteroid.mesh.position.distanceTo(earth.mesh.position)) >= 80 ) {
            asteroid.resetPosition(earth);
            initialAsteroidPos = asteroid.mesh.position.clone();
        }

        asteroid.animate(earth);

        // Asteroid POV
        // const worldPos = new THREE.Vector3();
        // asteroid.mesh.getWorldPosition(worldPos);
        // const earthWorldPos = new THREE.Vector3();
        // earth.mesh.getWorldPosition(earthWorldPos);
        // camera.camera.position.copy(worldPos.clone().add(new THREE.Vector3(0,0,0)));
        // camera.camera.lookAt(earthWorldPos);

        boxPosition.setFromMatrixPosition(asteroid.mesh.matrixWorld);
        boxPosition.project(camera.camera);
        const widthHalf = canvas.width/2;
        const heightHalf = canvas.height/2;
        boxPosition.x = (boxPosition.x * widthHalf) + widthHalf;
        boxPosition.y = -(boxPosition.y * heightHalf)+ heightHalf;
        asteroidInfo.style.top = `${boxPosition.y}px`;
        asteroidInfo.style.left = `${boxPosition.x}px`;

        if(boxPosition.x < 0 ||
           boxPosition.x > canvas.clientWidth ||
           boxPosition.y < 0 ||
           boxPosition.y > canvas.clientHeight
        ) {
            asteroidInfo.style.display = 'none';
        }
        else {
            asteroidInfo.style.display = 'block';
        }
        
        camera.makeCameraFollowObject(earth.mesh);

        raycast(raycaster, mouse, camera.camera, scene)

        renderer.render(scene, camera.camera);

    }
    renderer.setAnimationLoop(render);

}

if ( WebGL.isWebGL2Available() ) {
    main();
} else {
    const warning = WebGL.getWebGL2ErrorMessage();
    document.getElementById( 'container' ).appendChild( warning );
}

