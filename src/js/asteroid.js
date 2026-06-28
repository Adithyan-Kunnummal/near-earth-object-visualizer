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
        this.speed = 2;
        this.missRadius = 10;

        this.mesh.scale.set(this.estimated_average_radius, this.estimated_average_radius, this.estimated_average_radius);
        this.resetPosition(earth)
    }

    animate(earth) {
        this.mesh.position.add(this.velocity);
    }

    resetPosition(earth) {
        this.mesh.position.set(
            getRandomNumber(-this.spawnDistance, this.spawnDistance),
            getRandomNumber(-this.spawnDistance, this.spawnDistance),
            getRandomNumber(-this.spawnDistance, this.spawnDistance));
        
            const earthPos = new THREE.Vector3();
            earth.mesh.getWorldPosition(earthPos);

            const direction = new THREE.Vector3()
                .subVectors(earthPos, this.mesh.position)
                .normalize();

            let randomVec = new THREE.Vector3(
                Math.random() * 2 - 1,
                Math.random() * 2 - 1,
                Math.random() * 2 - 1
            ).normalize();

            if (Math.abs(direction.dot(randomVec)) > 0.99) {
                randomVec.set(1, 0, 0);
            }

            const perp1 = new THREE.Vector3()
                .crossVectors(direction, randomVec)
                .normalize();

            const perp2 = new THREE.Vector3()
                .crossVectors(direction, perp1)
                .normalize();

            const angle = Math.random() * Math.PI * 2;

            const missOffset = perp1.multiplyScalar(Math.cos(angle) * this.missRadius)
                .add(
                    perp2.multiplyScalar(Math.sin(angle) * this.missRadius)
                );

            const targetPos = earthPos.clone().add(missOffset);

            this.velocity = new THREE.Vector3()
                .subVectors(targetPos, this.mesh.position)
                .normalize()
                .multiplyScalar(this.speed);

        }
}

function getRandomFromArr(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}