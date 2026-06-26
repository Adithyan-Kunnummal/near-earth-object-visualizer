import * as THREE from 'three'
import createSphereInstance from './sphere.js'

export default function getBodies(scene) {
    const objects = [];

    // Solar system
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
    earthMesh.position.x = 15;
    earthOrbit.add(earthMesh);
    objects.push(earthMesh);

    // Moon
    const moonOrbit = new THREE.Object3D();
    earthOrbit.add(moonOrbit);


    const moonMesh = createSphereInstance("images/moon.jpg");
    moonMesh.scale.set(1,1,1);
    moonOrbit.position.x = 15
    moonMesh.position.x = 5;
    moonOrbit.add(moonMesh);
    objects.push(moonMesh);

    return {solarSystem, sunMesh, earthOrbit, earthMesh, moonOrbit, moonMesh}
}