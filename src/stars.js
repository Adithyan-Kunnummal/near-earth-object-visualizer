import * as THREE from 'three'
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js'

export default class Stars {
    constructor(scene) {
        this.numStars = 5000;
        this.starsGeometry = new THREE.BufferGeometry();

        // Each vertex stores x, y, z info
        this.vertices = new Float32Array(this.numStars * 3); 

        this.vertices.forEach((_, i) => {
            // Random position between -1500, 1500
            this.vertices[i] = (Math.random() - 0.5) * 3000; 
        })

        this.starsGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(this.vertices, 3)
        );

        this.startsMaterial = new THREE.PointsMaterial({
            color: 0xababab,
            size: 0.2
        });
        this.stars = new THREE.Points( this.starsGeometry, this.startsMaterial );

        scene.add(this.stars)
    }

    animate() {
        this.stars.rotation.y += 0.0008
    }
}