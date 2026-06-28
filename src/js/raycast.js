export default function raycast(raycaster, mouse, camera, scene) {
        raycaster.setFromCamera(mouse, camera);

        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
            // The first element in the array is the closest intersected object
            const objectHovered = intersects[0].object;
            console.log(objectHovered)
        }
}