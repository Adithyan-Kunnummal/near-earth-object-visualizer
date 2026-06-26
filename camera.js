import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'


export default function createCamera(canvas) {
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 30;

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0,2,0);
    controls.update();
    
    return camera
}