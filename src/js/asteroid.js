import * as THREE from 'three'
import Body from './body.js';

export default class Asteroid {
    constructor (scene, textureLoader, texturePath, data, earth, radius = 1, widthSegments = 32, heightSegments = 16) {
        this.estimated_radius_min = data["estimated_diameter"]["kilometers"]["estimated_diameter_min"] / 2;
        this.estimated_radius_max = data["estimated_diameter"]["kilometers"]["estimated_diameter_max"] / 2;
        this.estimated_average_radius = (this.estimated_radius_min + this.estimated_radius_max) / 2;
        this.relative_velocity = data["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"];

        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        const texture = textureLoader.load(texturePath);
        texture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.MeshBasicMaterial({ map: texture });

        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);
        
        this.spawnDistance = 60;
        this.speed = 0.5;
        this.missRadius = 10;

        this.mesh.scale.set(this.estimated_average_radius, this.estimated_average_radius, this.estimated_average_radius);
        this.resetPosition(earth);

        // Attaching NEO name div to the mesh
        this.boxPosition = new THREE.Vector3();
        this.infoDiv = document.createElement("div");
        this.infoDiv.textContent = data.name;

        this.infoDiv.style.position = "absolute";
        this.infoDiv.style.color = "white";
        this.infoDiv.style.zIndex = "1000";
        document.body.appendChild(this.infoDiv);
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

    attatchInfoDiv(canvas, camera) {
    this.boxPosition.setFromMatrixPosition(this.mesh.matrixWorld);
    this.boxPosition.project(camera);

    const widthHalf = canvas.width/2;
    const heightHalf = canvas.height/2;

    this.boxPosition.x = (this.boxPosition.x * widthHalf) + widthHalf;
    this.boxPosition.y = -(this.boxPosition.y * heightHalf)+ heightHalf;

    this.infoDiv.style.top = `${this.boxPosition.y}px`;
    this.infoDiv.style.left = `${this.boxPosition.x}px`;

    if(this.boxPosition.x < 0 ||
        this.boxPosition.y < 0 ||
        this.boxPosition.x > canvas.clientWidth ||
        this.boxPosition.y > canvas.clientHeight
    ) {
        this.infoDiv.style.display = 'none';
    } else {
        this.infoDiv.style.display = 'block';
    }
}
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}