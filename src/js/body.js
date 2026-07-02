import * as THREE from 'three'

const G = 6.674e-11;
const DT = 24 * 60 * 60;
const AU = 1.496e11;
const SCALE = 20/AU;

export default class Body {
    constructor(scene, textureLoader, texturePath, distance,  mass, velocity, radius = 1, widthSegments = 32, heightSegments = 16) {
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

        this.prevPositions = [];
        

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

        // Calculate velocity and update mesh position
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

    drawTrail(scene, sun) {
        let x = this.x;
        let z = this.z;

        const initialX = this.x * SCALE;
        const initialZ = this.z * SCALE;

        let vx = this.vx;
        let vz = this.vz;

        let totalAngle = 0;
        let previousAngle = Math.atan2(initialZ, initialX);

        while(totalAngle <= 2 * Math.PI + 1) {
            let totalFx = 0;
            let totalFz = 0;

            // Calculate force exterted on this body by sun
            const dx = sun.x - x;
            const dz = sun.z - z;
            const r = Math.sqrt(dx**2 + dz**2);

            const F = G * this.mass * sun.mass / r**2;

            // Getting x and y components of force
            const fx = dx / r * F;
            const fz = dz / r * F;

            totalFx += fx;
            totalFz += fz;
            

            // Calculate velocity and update mesh position
            const orbitDetail = 1;
            const dt = DT * orbitDetail;
            vx += totalFx / this.mass * dt;
            vz += totalFz / this.mass * dt;

            x += vx * dt;
            z += vz * dt;

            this.prevPositions.push(new THREE.Vector3(x * SCALE, 0, z * SCALE));

            // Angle calculation
            const angle = Math.atan2(z, x);
            let delta = angle - previousAngle;

            if(delta > Math.PI) { delta -= 2*Math.PI };
            if(delta < -Math.PI) { delta += 2*Math.PI };

            totalAngle += delta;
            previousAngle = angle;
        }

        const orbitTrailGeometry = new THREE.BufferGeometry().setFromPoints(this.prevPositions);
        const orbitTrailMaterial = new THREE.LineBasicMaterial({ color: 0x808080 });
        const orbitTrail = new THREE.Line(orbitTrailGeometry, orbitTrailMaterial);

        scene.add(orbitTrail);

    }
}