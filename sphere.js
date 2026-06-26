import * as THREE from 'three'

const radius = 1;
const widthSegments = 32;
const heightSegments = 16;
const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

export default function createSphereInstance(path) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;

    const sphereMaterial = new THREE.MeshBasicMaterial({map: texture});
    const sphereMesh = new THREE.Mesh(geometry, sphereMaterial);

    return sphereMesh
}