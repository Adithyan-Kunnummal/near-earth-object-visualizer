import * as THREE from 'three'
import createSphereInstance from './sphere.js';

export default class Asteroid {
    constructor (data, earthMesh) {
        this.estimated_radius_min = data["estimated_diameter"]["kilometers"]["estimated_diameter_min"] / 2;
        this.estimated_radius_max = data["estimated_diameter"]["kilometers"]["estimated_diameter_max"] / 2;
        this.estimated_average_radius = (this.estimated_radius_min + this.estimated_radius_max) / 2;
        this.relative_velocity = data["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"];
        this.asteroidMesh = createSphereInstance("/images/asteroid.jpg");

        this.speed = 0.5
        const direction = new THREE.Vector3().subVectors(earthMesh.position, this.mesh.position); // get direction to earth.
        this.velocity = direction.normalize().multiplyScalar(this.speed);

        this.asteroidMesh.scale.set(this.estimated_average_radius, this.estimated_average_radius, this.estimated_average_radius);
        this.asteroidMesh.position.set(20, getRandomNumber(-20, 20), getRandomNumber(-20, 20));
    }

    get mesh() {
        return this.asteroidMesh;
    }

    animate() {
        
        this.mesh.position.add(this.velocity)   
    }

    resetPosition(earthMesh) {
        this.asteroidMesh.position.set(20, getRandomNumber(-20, 20), getRandomNumber(-20, 20));
        const direction = new THREE.Vector3().subVectors(earthMesh.position, this.mesh.position); // recomute direction.
        this.velocity = direction.normalize().multiplyScalar(this.speed);
    }
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}