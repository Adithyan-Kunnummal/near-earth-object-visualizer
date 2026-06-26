import * as THREE from 'three'

const radius = 1;
const widthSegments = 32;
const heightSegments = 16;
const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

export default function createSphereInstance(texturePath) {
    const loader = new THREE.TextureLoader();
    const sphereMaterial = new THREE.MeshBasicMaterial({map: loadTexture(loader, texturePath)});
    const sphereMesh = new THREE.Mesh(geometry, sphereMaterial);

    return sphereMesh
}

function loadTexture(loader, path) {
    const texture = loader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}