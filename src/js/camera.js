import * as THREE from 'three'

export function createCamera(canvas) {
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 30;
    camera.position.y = 10;
    
    return camera
}

export function makeCameraFollowObject(camera, obj, controls, canvas) {
        const worldPos = new THREE.Vector3();
        obj.getWorldPosition(worldPos);
        camera.lookAt(worldPos);

        controls.target.copy(worldPos);
        controls.update();
}