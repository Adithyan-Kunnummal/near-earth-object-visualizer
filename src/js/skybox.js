import * as THREE from 'three'
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js'

export default class Skybox {
    constructor(scene, textureLoader, texturePath = "images/stars.jpg", height = 15, radius = 100) {
        const texture = textureLoader.load(texturePath);
        texture.colorSpace = THREE.SRGBColorSpace;

        this.skybox = new GroundedSkybox(texture, height, radius);
        this.skybox.position.y = -height;
        
        scene.add(this.skybox);
    }

    animate(time, speed = 1) {
        speed *= 0.01
        this.skybox.rotation.y = time/1000 * speed;
    }
}