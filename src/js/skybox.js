import * as THREE from 'three'
import { GroundedSkybox } from 'three/addons/objects/GroundedSkybox.js'

export default function createSkybox(scene) {
    const height = 15, radius = 100;
    const loader = new THREE.TextureLoader();
    const texture = loader.load("images/stars.jpg");
    texture.colorSpace = THREE.SRGBColorSpace;

    const skybox = new GroundedSkybox(texture, height, radius);
    skybox.position.y = -height;
    scene.add(skybox);

    return skybox;
}