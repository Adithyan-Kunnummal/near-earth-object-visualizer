import { initBuffers } from "./init-buffers.js";
import { drawScene } from "./draw-scene.js";

function main() {
    const canvas = document.querySelector("#gl-canvas");
    // Init GL context
    const gl = canvas.getContext("webgl");

    // Continue only if WebGL is available and working
    if(gl == null) {
        alert("Unable to Initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // Vertex shader program
    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying lowp vec4 vColor;

        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vColor = aVertexColor;
        }
    `;

    // Fragment shader program
    const fsSource = `
        varying lowp vec4 vColor;

        void main() {
        gl_FragColor = vColor;
        }
  `;

    // Initialize shader program
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    
    // Collect all information requried to use the shader program
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
        },
    };

    // Set background to black
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    // Clear color buffer
    gl.clear(gl.COLOR_BUFFER_BIT)

    const buffers = initBuffers(gl);

    let cubeRotation = 0.0;
    let deltaTime = 0;

    let then = 0;
    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001; // convert to seconds
        deltaTime = now - then;
        then = now;

        drawScene(gl, programInfo, buffers, cubeRotation);
        cubeRotation += deltaTime;

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

// Initialize shader program
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // alert if creating shader program fails
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`
            Unable to initialize shader program: ${gl.getProgramInfoLog(shaderProgram,)}
        `,)
    return null;
    };

    return shaderProgram;
}

// Create shader of a given type and compile it
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send source to shader object
    gl.shaderSource(shader, source);
    // Compile shader program
    gl.compileShader(shader);

    // Alert if compiling shader fails
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(`An error occured while compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
        );
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

main()

