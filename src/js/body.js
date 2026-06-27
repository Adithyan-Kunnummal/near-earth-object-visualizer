import * as THREE from 'three'

export default class Body {
    constructor(textureLoader, texturePath, radius = 1, widthSegments = 32, heightSegments = 16) {
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

        const texture = textureLoader.load(texturePath);
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({map: texture});

        this.mesh = new THREE.Mesh(geometry, material);
        
    }

    animate(deltaTime, speed = 1) {
        speed *= 0.001
        this.mesh.rotation.y = deltaTime * speed
    }
}