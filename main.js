import * as THREE from 'three'
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js'

import createCamera from '/camera.js'
import createSphereInstance from '/sphere.js'
import createSkybox from '/skybox.js'

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    const camera = createCamera(canvas);
    const scene = new THREE.Scene();

    // Light
    {
        const color = 0xffffff;
        const intensity = 3;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    // Solar system
    const objects = [];

    const solarSystem = new THREE.Object3D();
    scene.add(solarSystem);
    objects.push(solarSystem);

    // Sun
    const sunMesh = createSphereInstance("images/sun.jpg");
    sunMesh.scale.set(3,3,3);
    solarSystem.add(sunMesh);
    objects.push(sunMesh);

    // Earth
    const earthOrbit = new THREE.Object3D();
    solarSystem.add(earthOrbit);
    objects.push(earthOrbit);

    const earthMesh = createSphereInstance("images/earth_daymap.jpg");
    earthMesh.scale.set(2,2,2);
    earthOrbit.position.x = 10;
    earthOrbit.add(earthMesh);
    objects.push(earthMesh);

    
    // Moon
    const moonOrbit = new THREE.Object3D();
    earthOrbit.add(moonOrbit);
    

    const moonMesh = createSphereInstance("images/moon.jpg");
    moonMesh.scale.set(1,1,1);
    moonOrbit.position.x = 5;
    moonOrbit.add(moonMesh);
    objects.push(moonMesh);

    // Skybox
    const skyBox = createSkybox(scene);

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
        objects.forEach((obj) => {
            obj.rotation.y = time/1000;
        })
        skyBox.rotation.y = time/80000;
        skyBox.rotation.x = time/80000;

        renderer.render(scene, camera);
    }
    renderer.setAnimationLoop(render);

}

if ( WebGL.isWebGL2Available() ) {
    main();
} else {
    const warning = WebGL.getWebGL2ErrorMessage();
    document.getElementById( 'container' ).appendChild( warning );
}

