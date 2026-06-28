import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class Camera {
    constructor(canvas, fov = 75, aspect = window.innerWidth / window.innerHeight, near = 0.1, far = 1000) {
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.controls = new OrbitControls(this.camera, canvas);
        this.camera.position.z = 30;
        this.camera.position.y = 10;
    }

    makeCameraFollowObject(obj) {
        const targetPos = new THREE.Vector3();
        obj.getWorldPosition(targetPos);

        this.controls.target.lerp(targetPos, 0.1);
        this.controls.update();
}
}