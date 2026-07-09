import * as THREE from 'three'
import getJulianDate from './utils/date-utils'

const G = 6.674e-11;
const DT = 24 * 60 * 60;
const AU = 1.496e11;
const SCALE = 50;

export default class Body {
    constructor(scene, textureLoader, texturePath, KER, radius = 1, widthSegments = 32, heightSegments = 16) {
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        const texture = textureLoader.load(texturePath);
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({map: texture});

        this.mesh = new THREE.Mesh(geometry, material);

        // Keplerian Elements and Rates
        this.KER = KER;

        this.a = 0; // Semi-major axis
        this.e = 0; // Eccentricity
        this.I = 0; // Inclination
        this.L = 0; // Longitude
        this.varpi = 0; // Longitude of perihelion
        this.Omega = 0; // Longitude of the ascending node

        this.omega = 0; // Argument of perihelion
        this.M = 0 // Mean anomaly
        this.E = 0; // Eccentric anomaly
        
        const [x, y, z] = this.computePosition();
        this.mesh.position.set(x * SCALE, z * SCALE, y * SCALE);
    }

    drawOrbit(scene) {
        const points = [];

        for(let i = 0; i < 360; ++i) {
            const E = i * Math.PI/ 180; // to radians

            // Compute the planet's heliocentric coordinates
            const xHeliocentric = this.a * (Math.cos(E) - this.e);
            const yHeliocentric = this.a * Math.sqrt(1 - this.e**2) * Math.sin(E);
            const zHeliocentric = 0;

            // Coordinates in 3D space
            const x = (Math.cos(this.omega) * Math.cos(this.Omega) - Math.sin(this.omega) * Math.sin(this.Omega) * Math.cos(this.I)) * xHeliocentric + 
            (-Math.sin(this.omega) * Math.cos(this.Omega) - Math.cos(this.omega) * Math.sin(this.Omega) * Math.cos(this.I)) * yHeliocentric;
            const y = (Math.cos(this.omega) * Math.sin(this.Omega) + Math.sin(this.omega) * Math.cos(this.Omega) * Math.cos(this.I)) * xHeliocentric + 
            (-Math.sin(this.omega) * Math.sin(this.Omega) + Math.cos(this.omega) * Math.cos(this.Omega) * Math.cos(this.I)) * yHeliocentric;
            const z =(Math.sin(this.omega) * Math.sin(this.I)) * xHeliocentric + (Math.cos(this.omega) * Math.sin(this.I)) * yHeliocentric;

            points.push(new THREE.Vector3(x * SCALE,z * SCALE ,y * SCALE));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({color: 0x808080});
        const orbit = new THREE.LineLoop(geometry, material);

        scene.add(orbit);
    }

    computePosition() {
        if(this.mesh.userData.id == "sun") return

        // Compute the value of each of that planet's six elements
        const Teph = getJulianDate();
        const T = (Teph - 2451545.0)/ 36525;

        this.a = this.KER.a0 + this.KER.aRate * T;
        this.e = this.KER.e0 + this.KER.eRate * T;
        this.I = this.KER.I0 + this.KER.IRate * T;
        this.L = this.KER.L0 + this.KER.LRate * T;
        this.varpi = this.KER.varpi0 + this.KER.varpiRate * T;
        this.Omega = this.KER.Omega0 + this.KER.OmegaRate * T;

        // Convert to radians
        const DEG2RAD = Math.PI / 180;
        this.I *= DEG2RAD;
        this.L *= DEG2RAD;
        this.varpi *= DEG2RAD;
        this.Omega *= DEG2RAD;

        // Compute the argument of perihelion, and the mean anomaly
        this.omega = this.varpi - this.Omega;
        this.M = this.L - this.varpi;

        // Calculating Eccentric anomaly
        // M = E - e * sin(E)
        this.M = (this.M % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI); // normalization so M stays within 0 to 2pi

        this.E = this.M + this.e * Math.sin(this.M); // initial guess

        const tot = 1e-6;
        let deltaE;
        do {
            const deltaM = this.M - (this.E - this.e * Math.sin(this.E));
            deltaE = deltaM / (1 - this.e * Math.cos(this.E));
            this.E += deltaE;
        }
        while(Math.abs(deltaE) > tot)

        // Compute the planet's heliocentric coordinates
        const xHeliocentric = this.a * (Math.cos(this.E) - this.e);
        const yHeliocentric = this.a * Math.sqrt(1 - this.e**2) * Math.sin(this.E);
        const zHeliocentric = 0;

        // Coordinates in 3D space
        const x = (Math.cos(this.omega) * Math.cos(this.Omega) - Math.sin(this.omega) * Math.sin(this.Omega) * Math.cos(this.I)) * xHeliocentric + 
        (-Math.sin(this.omega) * Math.cos(this.Omega) - Math.cos(this.omega) * Math.sin(this.Omega) * Math.cos(this.I)) * yHeliocentric;
        const y = (Math.cos(this.omega) * Math.sin(this.Omega) + Math.sin(this.omega) * Math.cos(this.Omega) * Math.cos(this.I)) * xHeliocentric + 
        (-Math.sin(this.omega) * Math.sin(this.Omega) + Math.cos(this.omega) * Math.cos(this.Omega) * Math.cos(this.I)) * yHeliocentric;
        const z =(Math.sin(this.omega) * Math.sin(this.I)) * xHeliocentric + (Math.cos(this.omega) * Math.sin(this.I)) * yHeliocentric;

        return [x, y, z];
    }
}