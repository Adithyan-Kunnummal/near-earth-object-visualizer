import * as THREE from 'three'

const G = 6.674e-11;
const DT = 24 * 60 * 60;
const AU = 1.496e11;
const SCALE = 15/AU;

export default class Body {
    constructor(textureLoader, texturePath, distance,  mass, velocity, radius = 1, widthSegments = 32, heightSegments = 16) {
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        const texture = textureLoader.load(texturePath);
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({map: texture});

        this.mesh = new THREE.Mesh(geometry, material);
        this.x = distance;
        this.z = 0
        this.updatePosition();

        this.mass = mass;

        this.vx = 0;
        this.vz = velocity;
    }

    calcAttraction(other) {
        // Calculate distance between bodies
        const dx = other.x - this.x;
        const dz = other.z - this.z;
        const r = Math.sqrt(dx**2 + dz**2);

        const F = G * this.mass * other.mass / r**2;

        // Getting x and y components of force
        const fx = dx / r * F;
        const fz = dz / r * F;

        return [fx, fz];
    }

    calcPosition(bodies, dt) {
        let totalFx = 0;
        let totalFz = 0;

        // Calculate force exterted on this body by all other bodies
        bodies.forEach((body) => {
            if(body.mesh == this.mesh) { return; }

            const [fx, fz] = this.calcAttraction(body);
            totalFx += fx;
            totalFz += fz;
            }
        );

        this.vx += totalFx / this.mass * dt;
        this.vz += totalFz / this.mass * dt;

        this.x += this.vx * dt;
        this.z += this.vz * dt;

        this.updatePosition()
    }

    updatePosition() {
        // Setting distance of body based on scale
        this.mesh.position.set(this.x * SCALE, 0, this.z * SCALE);
    }
}