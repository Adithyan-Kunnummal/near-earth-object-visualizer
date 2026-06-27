import * as THREE from 'three'
import Body from './body.js';

export default class Asteroid {
    constructor (textureLoader, texturePath, data, earth, radius = 1, widthSegments = 32, heightSegments = 16) {
        this.estimated_radius_min = data["estimated_diameter"]["kilometers"]["estimated_diameter_min"] / 2;
        this.estimated_radius_max = data["estimated_diameter"]["kilometers"]["estimated_diameter_max"] / 2;
        this.estimated_average_radius = (this.estimated_radius_min + this.estimated_radius_max) / 2;
        this.relative_velocity = data["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"];


        const body = new Body(textureLoader, texturePath, radius, widthSegments, heightSegments);
        this.mesh = body.mesh;
        
        this.spawnDistance = 60;
        this.speed = 1;
        this.missOffset = new THREE.Vector3(
            getRandomNumber(6, 8),
            getRandomNumber(6, 8),
            getRandomNumber(6, 8)
        )

        this.mesh.scale.set(this.estimated_average_radius, this.estimated_average_radius, this.estimated_average_radius);
        this.mesh.position.set(
            getRandomNumber(-this.spawnDistance, this.spawnDistance),
            getRandomNumber(-this.spawnDistance, this.spawnDistance),
            getRandomNumber(-this.spawnDistance, this.spawnDistance)
        ); // Random starting position.

        const direction = new THREE.Vector3().subVectors(earth.mesh.position.clone(), this.mesh.position); // get direction to earth.
        this.velocity = direction.normalize().multiplyScalar(this.speed);
    }

    animate(earth) {
        this.mesh.position.add(this.velocity);
    }

    resetPosition(earth) {
        this.mesh.position.set(
            getRandomNumber(-this.spawnDistance, this.spawnDistance),
            getRandomNumber(-this.spawnDistance, this.spawnDistance),
            getRandomNumber(-this.spawnDistance, this.spawnDistance));

        const direction = new THREE.Vector3().subVectors(earth.mesh.position.clone(), this.mesh.position); // recompute direction.
        this.velocity = direction.normalize().multiplyScalar(this.speed);
    }

    
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}