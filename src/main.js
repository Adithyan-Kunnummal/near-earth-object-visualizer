import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import {createCamera, makeCameraFollow} from './js/camera.js';
import createSphereInstance from './js/sphere.js';
import createSkybox from './js/skybox.js';
import getBodies from './js/bodies.js'
import data from './js/neo-data-parser.js';

async function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    const camera = createCamera(canvas);
    const scene = new THREE.Scene();
    const controls = new OrbitControls(camera, canvas);

    // Light
    {
        const color = 0xffffff;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    // Solar system
    const {solarSystem, sunMesh, earthOrbit, earthMesh, moonOrbit, moonMesh} = getBodies(scene);

    // Skybox
    const skyBox = createSkybox(scene);

    // Asteroid
    const asteroidMesh = await data();
    asteroidMesh.position.x = 20;
    asteroidMesh.position.y = 20;
    asteroidMesh.position.z = 20;
    earthOrbit.add(asteroidMesh);


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

    function render(time) {
        // Change camera aspect if renderer was resized.
        if(resizeRendererToDisplaySize(renderer)) {

            /* Changing aspect of camera to aspect of canvas  
               display size to prevent stretching of objects. */
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        // rotate objects
        sunMesh.rotation.y = time/1000;
        earthMesh.rotation.y = time/1000;
        earthOrbit.rotation.y = time/10000;
        moonMesh.rotation.y = time/1000;
        moonOrbit.rotation.y = time/10000;
        skyBox.rotation.y = time/80000;

        // animate asteroid
        asteroidMesh.position.y -= 0.05;
        asteroidMesh.position.z -= 0.05;

        renderer.render(scene, camera);

        // Making camera follow earth
        makeCameraFollow(camera, earthMesh, controls, canvas);
    }
    renderer.setAnimationLoop(render);


}

if ( WebGL.isWebGL2Available() ) {
    main();
} else {
    const warning = WebGL.getWebGL2ErrorMessage();
    document.getElementById( 'container' ).appendChild( warning );
}