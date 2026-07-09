import * as THREE from 'three'
import Body from './body';
import getJulianDate from './utils/date-utils'

const SCALE = 50;
const G = 6.674e-11;
const M = 5.972e24;
const DEG2RAD = Math.PI / 180;


export default class NEO{
    constructor (scene, textureLoader, texturePath, data, earth, KER, radius = 1, widthSegments = 32, heightSegments = 16) {
        this.data = data;

        // Keplerian elements
        this.a = KER.a; // Semi-major axis
        this.e = KER.e // Eccentricity
        this.I = KER.I; // Inclination
        this.n = KER.n // Mean motion
        this.omega = KER.omega; // Argument of perihelion
        this.Omega = KER.Omega; // Longitude of the ascending node
        this.M0 = KER.M0; // Mean anomaly for current epoch
        this.tEpoch = KER.tEpoch; // Current epoch

        // Convert to radians
        this.M0 *= DEG2RAD;
        this.I *= DEG2RAD;
        this.omega *= DEG2RAD;
        this.Omega *= DEG2RAD;

        this.M = 0; // Mean anomaly to be calculated
        this.E = 0; // Eccentric anomaly to be calculated
        
        // Render NEO
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        const texture = textureLoader.load(texturePath);
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({ map: texture });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.scale.set(0.5, 0.5, 0.5);
        const [x, y, z] = this.computePosition();
        this.mesh.position.set(-x * SCALE, z * SCALE, y * SCALE);
        scene.add(this.mesh);

        // Attaching NEO name div to the mesh
        this.boxPosition = new THREE.Vector3();
        this.infoDiv = document.createElement("div");
        this.infoDiv.textContent = data.name;

        this.infoDiv.style.position = "absolute";
        this.infoDiv.style.color = "white";
        this.infoDiv.style.zIndex = "1000";
        document.body.appendChild(this.infoDiv);
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

            points.push(new THREE.Vector3(-x * SCALE,z * SCALE ,y * SCALE));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineDashedMaterial( {
                color: 0x505050,
                scale: 1,
                dashSize: 2,
                gapSize: 1,
            } );
        const orbit = new THREE.LineLoop(geometry, material);
        orbit.computeLineDistances();


        scene.add(orbit);
    }

    computePosition() {
        let M = this.M0 + this.n * DEG2RAD * (getJulianDate() - this.tEpoch);

        // M between 0 to 2pi rad
        M %= 2 * Math.PI;
        if (M < 0) M += 2 * Math.PI;

        this.M = M

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

    updateInfoDiv(canvas, camera) {
        this.boxPosition.setFromMatrixPosition(this.mesh.matrixWorld);
        this.boxPosition.project(camera);

        const widthHalf = canvas.width/2;
        const heightHalf = canvas.height/2;

        this.boxPosition.x = (this.boxPosition.x * widthHalf) + widthHalf;
        this.boxPosition.y = -(this.boxPosition.y * heightHalf)+ heightHalf;

        this.infoDiv.style.top = `${this.boxPosition.y}px`;
        this.infoDiv.style.left = `${this.boxPosition.x}px`;

        if(this.boxPosition.x < 0 ||
            this.boxPosition.y < 0 ||
            this.boxPosition.x > canvas.clientWidth ||
            this.boxPosition.y > canvas.clientHeight
        ) {
            this.infoDiv.style.display = 'none';
        } else {
            this.infoDiv.style.display = 'block';
        }
    }
}