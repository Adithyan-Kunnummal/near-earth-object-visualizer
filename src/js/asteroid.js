import * as THREE from 'three'
import Body from './body.js';

export default class Asteroid {
    constructor (scene, textureLoader, texturePath, data, earth, radius = 1, widthSegments = 32, heightSegments = 16) {
        this.estimated_radius_min = data["estimated_diameter"]["kilometers"]["estimated_diameter_min"] / 2;
        this.estimated_radius_max = data["estimated_diameter"]["kilometers"]["estimated_diameter_max"] / 2;
        this.estimated_average_radius = (this.estimated_radius_min + this.estimated_radius_max) / 2;
        this.relative_velocity = data["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"];
        this.missDistance = data["close_approach_data"][0]["miss_distance"]["astronomical"];

        // Render NEO
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        const texture = textureLoader.load(texturePath);
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({ map: texture });
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);
        
        this.spawnDistance = 60;

        this.mesh.position.set(
            getRandomNumber(-this.spawnDistance, this.spawnDistance),
            getRandomNumber(-this.spawnDistance, this.spawnDistance),
            getRandomNumber(-this.spawnDistance, this.spawnDistance));
        this.mesh.scale.set(
            this.estimated_average_radius,
            this.estimated_average_radius,
            this.estimated_average_radius);

        // Draw line to earth
        this.NEOWorldPos = new THREE.Vector3();
        this.earthWorldPos = new THREE.Vector3();

        this.mesh.getWorldPosition(this.NEOWorldPos);
        earth.mesh.getWorldPosition(this.earthWorldPos);

        const NEOEarthLinegeometry = new THREE.BufferGeometry().setFromPoints([this.NEOWorldPos, this.earthWorldPos]);
        const NEOEarthLinematerial = new THREE.LineDashedMaterial( {
                color: 0x505050,
                scale: 1,
                dashSize: 2,
                gapSize: 1,
            } );
        this.NEOEarthLine = new THREE.Line(NEOEarthLinegeometry, NEOEarthLinematerial);
        this.NEOEarthLine.computeLineDistances();
        scene.add(this.NEOEarthLine);

        // Attaching NEO name div to the mesh
        this.boxPosition = new THREE.Vector3();
        this.infoDiv = document.createElement("div");
        this.infoDiv.textContent = data.name;

        this.infoDiv.style.position = "absolute";
        this.infoDiv.style.color = "white";
        this.infoDiv.style.zIndex = "1000";
        document.body.appendChild(this.infoDiv);
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

    updateLineToEarth(earth) {
        this.mesh.getWorldPosition(this.NEOWorldPos);
        earth.mesh.getWorldPosition(this.earthWorldPos);

        this.NEOEarthLine.geometry.setFromPoints([this.NEOWorldPos, this.earthWorldPos]);
    }
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}