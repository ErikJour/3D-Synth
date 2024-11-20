import * as Juce from './public/js/juce/javascript/index.js';
import * as THREE from 'three'
import { taliesenBackground, taliesenRed, taliesenCopper, darkerTaliesenCopper, taliesenMud, neutraColorPalette, lightGreen } from './colorPalette.js';
import { objectMaterial, planeMesh, planeMaterial } from './sceneObjects.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

//====================================================================================================================

//=======================================M==A==I==N====S==E==T==U==P==================================================

//SCROLL SENSITIVITY
const scrollSensitivity = 0.01;

//CANVAS
const canvas = document.querySelector('canvas.webgl')

const data = window.__JUCE__.initialisationData;

const nativeFunction = Juce.getNativeFunction("nativeFunction");

//SIZES
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

//GUI
// const gui = new GUI()

//SCENE
const scene = new THREE.Scene()

let lowPassFilterShade = 0;

scene.background = darkerTaliesenCopper.multiplyScalar(0.2);

//WORLD BOUNDS
const worldBounds = {
    xMin: -5,
    xMax: 5,
    yMin: -5,
    yMax: 5,
    zMin: 1,  // Updated to 1
    zMax: 10   // Back edge of the plane
};

//====================================================================================================================

//FILTER COLOR SETUP

const baseBackgroundColor = new THREE.Color(0xff8800); 

let backgroundDarkness = 0.25; 


scene.background = baseBackgroundColor.clone().multiplyScalar(backgroundDarkness);


function updateBackground() {
    backgroundDarkness = THREE.MathUtils.clamp(backgroundDarkness, 0.001, .5);

    scene.background = baseBackgroundColor.clone().multiplyScalar(backgroundDarkness);
}

window.addEventListener('keydown', (event) => {
    event.preventDefault();
    switch (event.key) {
        case 'ArrowUp': 
            backgroundDarkness += 0.03; 
            //Arrow Up Color
            updateBackground();
            break;
        case 'ArrowDown': 
            backgroundDarkness -= 0.03;
            //Arrow Down Color
            updateBackground();
            break;
        case 'ArrowLeft': 
            baseBackgroundColor.offsetHSL(-0.01, 0, 0); 
            //Arrow Left Color
            updateBackground();
            break;
        case 'ArrowRight': 
            baseBackgroundColor.offsetHSL(0.01, 0, 0); 
            //Arrow Right Color
            updateBackground();
            break;
    }
});





//====================================================================================================================

//LIGHTIING
const directionalLight = new THREE.DirectionalLight(taliesenRed, 1.0)
directionalLight.position.set(2, 2, -1)
directionalLight.castShadow = true
scene.add(directionalLight)

directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
directionalLight.shadow.camera.near = 0.5
directionalLight.shadow.camera.far = 10
directionalLight.shadow.camera.left = -5
directionalLight.shadow.camera.top = 5
directionalLight.shadow.camera.right = 5
directionalLight.shadow.camera.bottom = -5

directionalLight.intensity = 3

const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
directionalLightCameraHelper.visible = false
scene.add(directionalLightCameraHelper)

const ambientLight = new THREE.AmbientLight(taliesenBackground, 0.1);
scene.add(ambientLight);

ambientLight.intensity = 0.10
ambientLight.castShadow = true;

//====================================================================================================================

// MATERIALS

planeMesh.geometry.computeVertexNormals();
planeMaterial.flatShading = true;


const translucentMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff, // White color
    opacity: 0.5,    // Semi-transparent
    transparent: true,
    roughness: 0.5,  // Optional: Make it less shiny
    metalness: 0.1   // Optional: Slight metallic look
});


 //SINE

function createSineWaveGeometry(width, height, depth, radius, smoothness, segments) {
    const shape = new THREE.Shape();
    const eps = 0.00001;
    const segmentWidth = width / segments;
    

    shape.moveTo(-width/2, 0);
    
 
    for (let i = 0; i <= segments; i++) {
        const x = -width/2 + i * segmentWidth;
        const y = Math.sin((i / segments) * Math.PI * 2) * height/2;
        if (i === 0) {
            shape.lineTo(x, y);
        } else {
            shape.quadraticCurveTo(x - segmentWidth/2, y, x, y);
        }
    }
    
    for (let i = segments; i >= 0; i--) {
        const x = -width/2 + i * segmentWidth;
        const y = Math.sin((i / segments) * Math.PI * 2) * height/2;
        shape.lineTo(x, y + eps); 
    }

    const extrudeSettings = {
        steps: 1,
        depth: depth,
        bevelEnabled: true,
        bevelThickness: radius,
        bevelSize: radius,
        bevelSegments: smoothness
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    return geometry;
}

const sineWidth = 1.33; 
const sineHeight = 0.665; 
const sineDepth = 0.266; 
const sineRadius = 0.0665;
const sineSmoothness = 16;
const sineSegments = 64;

const sphereGeometry = createSineWaveGeometry(sineWidth, sineHeight, sineDepth, sineRadius, sineSmoothness, sineSegments);
const sphereMesh = new THREE.Mesh(sphereGeometry, objectMaterial);
scene.add(sphereMesh);

//PYRAMID
function createRoundedTriangleGeometry(width, height, depth, radius, smoothness) {
    const shape = new THREE.Shape();
    const eps = 0.00001;
    const radius0 = radius - eps;
    const halfWidth = width / 2;

    shape.moveTo(-halfWidth + radius0, -height/2);
    shape.lineTo(halfWidth - radius0, -height/2);
    shape.quadraticCurveTo(halfWidth, -height/2, halfWidth, -height/2 + radius0);
    shape.lineTo(radius0, height/2 - radius0);
    shape.quadraticCurveTo(0, height/2, -radius0, height/2 - radius0);
    shape.lineTo(-halfWidth, -height/2 + radius0);
    shape.quadraticCurveTo(-halfWidth, -height/2, -halfWidth + radius0, -height/2);

    const extrudeSettings = {
        steps: 1,
        depth: depth,
        bevelEnabled: true,
        bevelThickness: radius,
        bevelSize: radius,
        bevelSegments: smoothness
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    return geometry;
}

const pyramidWidth = 1;
const pyramidHeight = 0.866; 
const pyramidDepth = 0.2;
const pyramidRadius = 0.05;
const pyramidSmoothness = 4;

const pyramidGeometry = createRoundedTriangleGeometry(pyramidWidth, pyramidHeight, pyramidDepth, pyramidRadius, pyramidSmoothness);
const pyramidMesh = new THREE.Mesh(pyramidGeometry, objectMaterial);
scene.add(pyramidMesh);
pyramidMesh.visible = false;

//CUBE
const roundedCubeGeometry = createRoundedCubeGeometry(0.8, 0.8, 0.8, 0.05, 16);
const cubeMesh = new THREE.Mesh(roundedCubeGeometry, objectMaterial);
scene.add(cubeMesh);
cubeMesh.visible = false;

//ROUNDED CUBE
function createRoundedCubeGeometry(width, height, depth, radius, smoothness) {
    const shape = new THREE.Shape();
    const eps = 0.00001;
    const radius0 = radius - eps;
    shape.moveTo(0, radius0);
    shape.lineTo(0, height - radius0);
    shape.quadraticCurveTo(0, height, radius0, height);
    shape.lineTo(width - radius0, height);
    shape.quadraticCurveTo(width, height, width, height - radius0);
    shape.lineTo(width, radius0);
    shape.quadraticCurveTo(width, 0, width - radius0, 0);
    shape.lineTo(radius0, 0);
    shape.quadraticCurveTo(0, 0, 0, radius0);

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: depth - radius * 2,
        bevelEnabled: true,
        bevelSegments: smoothness * 2,
        steps: 1,
        bevelSize: radius,
        bevelThickness: radius,
        curveSegments: smoothness
    });

    geometry.center();

    return geometry;
}

//====================================================================================================================

//ARROWS

//LP FILTER CONTROL ...OR VOLUME

const arrowWidth = 1;
const arrowHeight = 0.866; 
const arrowDepth = 0.1;
const arrowRadius = 0.05;
const arrowSmoothness = 4;

const arrowGeometry = createRoundedTriangleGeometry(arrowWidth, arrowHeight, arrowDepth, arrowRadius, arrowSmoothness);
const arrowMesh = new THREE.Mesh(arrowGeometry, objectMaterial);

arrowMesh.visible = true;

const filterGroup = new THREE.Group();

function createArrow(color) {
    const arrow = new THREE.Group();



    const headGeometry = createRoundedTriangleGeometry(arrowWidth, arrowHeight, arrowDepth, arrowRadius, arrowSmoothness);
    const headMaterial = new THREE.MeshStandardMaterial({ color });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0; 
    arrow.add(head);

    return arrow;
}

const arrowUp = createArrow(neutraColorPalette.sageGreen);
arrowUp.scale.set(.2, .2, .2) 
const arrowDown = createArrow(neutraColorPalette.sageGreen);
arrowDown.scale.set(.2, .2, .2)

arrowDown.rotation.z = Math.PI;

const arrowOffsetX = -3.2; 
const arrowOffsetY = 1.9;
arrowUp.position.set(arrowOffsetX, arrowOffsetY + 0.1, -2); 
arrowDown.position.set(arrowOffsetX, arrowOffsetY - 0.5, -2);

filterGroup.add(arrowUp);
filterGroup.add(arrowDown);
scene.add(filterGroup);

//NOISE CONTROL ...OR FILTER

const noiseGroup = new THREE.Group();

const arrowLeft = createArrow(neutraColorPalette.sageGreen);
arrowLeft.scale.set(.2, .2, .2) 
const arrowRight = createArrow(neutraColorPalette.sageGreen);
arrowRight.scale.set(.2, .2, .2)

arrowLeft.rotation.z = Math.PI
;
arrowRight.rotation.z = Math.PI * .5;


const noiseX = 3; 
const noiseY = -1.5;
arrowLeft.position.set(noiseX, noiseY + 0.1, -2); 
arrowRight.position.set(noiseX, noiseY - 0.5, -2);

noiseGroup.add(arrowLeft);
noiseGroup.add(arrowRight);
scene.add(noiseGroup);
noiseGroup.visible = false

//----------------------------------------------------------------------------------------------------------


const sphereSelectorGeometry = createSineWaveGeometry(
    sineWidth / 3, sineHeight / 3, sineDepth / 3, sineRadius / 3, sineSmoothness, sineSegments
);
const sphereSelectorMesh = new THREE.Mesh(sphereSelectorGeometry, translucentMaterial);
sphereSelectorMesh.position.set(0, sineHeight / 2 + 0.65, 0); // Center position
scene.add(sphereSelectorMesh);

const pyramidSelectorGeometry = createRoundedTriangleGeometry(
    pyramidWidth / 3, pyramidHeight / 3, pyramidDepth / 3, pyramidRadius / 3, pyramidSmoothness
);
const pyramidSelectorMesh = new THREE.Mesh(pyramidSelectorGeometry, translucentMaterial);

const cubeSelectorGeometry = createRoundedCubeGeometry(
    0.8 / 3, 0.8 / 3, 0.8 / 3, 0.05 / 3, 16
);
const cubeSelectorMesh = new THREE.Mesh(cubeSelectorGeometry, translucentMaterial);


scene.add(pyramidSelectorMesh, cubeSelectorMesh);


const spacing = 0.7; 
pyramidSelectorMesh.position.set(-spacing, sineHeight / 2 + 0.5, 0);
cubeSelectorMesh.position.set(spacing, sineHeight / 2 + 0.5, 0); 


sphereSelectorMesh.visible = true;
pyramidSelectorMesh.visible = true;
cubeSelectorMesh.visible = true;

planeMesh.receiveShadow = true;

//PARTICLES

const particleGroup = new THREE.Group(); 
const particleCount = 25; 
const ringRadius = 1; 

for (let i = 0; i < particleCount; i++) {
 
    const radius = ringRadius + (Math.random() - 0.5) * 0.1;
    const angle = Math.random() * Math.PI * 2;

    let geometry;
    const randomShape = Math.random();
    if (randomShape < 0.33) {
        geometry = new THREE.SphereGeometry(0.05 * Math.random() + 0.03, 8, 8);
    } else if (randomShape < 0.66) {
        geometry = new THREE.BoxGeometry(0.05 * Math.random() + 0.03, 0.05 * Math.random() + 0.03, 0.05 * Math.random() + 0.03);
    } else {
        geometry = new THREE.IcosahedronGeometry(0.05 * Math.random() + 0.03, 0);
    }


    const material = new THREE.MeshBasicMaterial({ color: 0xffffff }); 
    const particle = new THREE.Mesh(geometry, material);


    particle.position.set(
        radius * Math.cos(angle),
        radius * Math.sin(angle),
        0
    );


    particle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

    particle.userData = { initialPosition: particle.position.clone(), scale: 1 };
    particleGroup.add(particle);
}

particleGroup.position.set(10, 6, 5.5); 
scene.add(particleGroup); 

//------------------------------------------------

const duplicatedParticleGroup = particleGroup.clone();

duplicatedParticleGroup.children.forEach((child) => {
    if (child.isMesh) {
        child.material = child.material.clone();

        child.material.color.set(neutraColorPalette.paleSkyBlue);
    }
});

duplicatedParticleGroup.position.set(-10, -6, 5.5); 

scene.add(duplicatedParticleGroup);

function animateParticles() {
    const time = Date.now() * 0.001; 
    particleGroup.children.forEach(particle => {
        const { initialPosition, scale } = particle.userData;
        particle.position.x = initialPosition.x + Math.sin(time + particle.id) * 0.1;
        particle.position.y = initialPosition.y + Math.cos(time + particle.id) * 0.1;
        particle.scale.set(scale, scale, scale);
    });
    duplicatedParticleGroup.children.forEach(particle => {
        const { initialPosition, scale } = particle.userData;
        particle.position.x = initialPosition.x + Math.sin(time + particle.id) * 0.1;
        particle.position.y = initialPosition.y + Math.cos(time + particle.id) * 0.1;
        particle.scale.set(scale, scale, scale);
      
    });
}




//====================================================================================================================


let activeShape = 'sine';
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();


const selectors = [
    { mesh: sphereSelectorMesh, shape: 'sine' },
    { mesh: pyramidSelectorMesh, shape: 'pyramid' },
    { mesh: cubeSelectorMesh, shape: 'cube' }
];

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(selectors.map(s => s.mesh));
    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        const selectedShape = selectors.find(s => s.mesh === selectedObject).shape;
        switchMainShape(selectedShape);
    }
});

function switchMainShape(shape) {
    if (shape === activeShape) return;

    sphereMesh.visible = (shape === 'sine');
    pyramidMesh.visible = (shape === 'pyramid');
    cubeMesh.visible = (shape === 'cube');

    activeShape = shape;
    const shapeIndex = shape === 'sine' ? 0 : shape === 'pyramid' ? 1 : 2;


    if (shape === 'sine') sphereMesh.visible = true;
    else if (shape === 'pyramid') pyramidMesh.visible = true;
    else if (shape === 'cube') cubeMesh.visible = true;

    sendWaveShapeToCpp(shapeIndex);

}

//====================================================================================================================

// CLICK OUTER RING - Larger Cylinder
const outerRingGeometry = new THREE.CylinderGeometry(2, 2, 0.1, 32);
const outerRingMaterial = new THREE.MeshStandardMaterial({ opacity: 0.0, transparent: true });
const outerRing = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
outerRing.rotation.x = Math.PI / 2;  
outerRing.position.z = 10;

let isDragging = false;


function sendParameterToCpp(lfoClick)
{
    nativeFunction(['lfoOn', lfoClick])
};



const ringThickness = 0.1; 
const extraThickness = ringThickness * 0.1; 

const clickCircleRadius = ringRadius; 


const clickCircleGeometry = new THREE.RingGeometry(
    clickCircleRadius - (ringThickness + extraThickness),
    clickCircleRadius + (ringThickness + extraThickness), 
    32
);
const clickCircleMaterial = new THREE.MeshStandardMaterial({ opacity: 0.0, transparent: true });
const clickCircle = new THREE.Mesh(clickCircleGeometry, clickCircleMaterial);
clickCircle.position.set(10, 6, 5.5); 


clickCircle.rotation.y = Math.PI;


scene.add(clickCircle);

const vibratoGeometry = new THREE.RingGeometry(
    clickCircleRadius - (ringThickness + extraThickness), 
    clickCircleRadius + (ringThickness + extraThickness), 
    32
);
const vibratoMaterial = new THREE.MeshStandardMaterial({ opacity: 0.0, transparent: true });
const vibratoCircle = new THREE.Mesh(vibratoGeometry, vibratoMaterial);
vibratoCircle.position.set(-10, -6, 5.5); 

vibratoCircle.rotation.y = Math.PI;

scene.add(vibratoCircle);


let isGroupGreen = false; 
let isGroupBlue = false;

window.addEventListener('click', (event) => {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // Check if the click intersects the click circle
    const intersects = raycaster.intersectObject(clickCircle);
    if (intersects.length > 0) {
        // Toggle particle group state
        isGroupGreen = !isGroupGreen;

        // Update particle colors and send parameter to native function
        particleGroup.children.forEach(particle => {
            if (isGroupGreen) {
                // LFO on: Set particles to green and increase scale
                sendParameterToCpp(true);
                particle.material.color.set(neutraColorPalette.sunlitSand);
                particle.userData.scale = 1.5;
            } else {
                // LFO off: Set particles to white and reset scale
                sendParameterToCpp(false);
                particle.material.color.set(0xffffff); // White color
                particle.userData.scale = 1;
            }

            // Apply the scale immediately
            particle.scale.set(particle.userData.scale, particle.userData.scale, particle.userData.scale);
        });
    }

    const vibratoIntersects = raycaster.intersectObject(vibratoCircle);
    if (vibratoIntersects.length > 0) {
        // Toggle particle group state
        isGroupBlue = !isGroupBlue;

        // Update particle colors and send parameter to native function
        duplicatedParticleGroup.children.forEach(particle => {
            if (isGroupBlue) {
                particle.material.color.set(neutraColorPalette.sunlitSand);
            } else {
             
                particle.material.color.set(neutraColorPalette.paleSkyBlue); // White color
            }

            // Apply the scale immediately
            particle.scale.set(particle.userData.scale, particle.userData.scale, particle.userData.scale);
        });
    }
});

// Mousedown event to start dragging the knob only if it's clicked
window.addEventListener('mousedown', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(smallKnob);
    if (intersects.length > 0) {
        isDragging = true;
        controls.enabled = false;
    }
});

// Stop dragging on mouse up
window.addEventListener('mouseup', () => {
    isDragging = false;
    controls.enabled = true;
});

let hoveredShape = null; // Track the currently hovered shape


let hoverTimeout;
window.addEventListener('mousemove', (event) => {
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(selectors.map(s => s.mesh));

        if (intersects.length > 0) {
            const hoveredObject = intersects[0].object;

            if (hoveredShape !== hoveredObject) {
                resetSelectorColors();
                hoveredObject.material.color.set(0xffffff); // Bright white
                hoveredShape = hoveredObject;
            }
        } else {
            if (hoveredShape) {
                resetSelectorColors();
                hoveredShape = null;
            }
        }
    }, 50); 
});

function resetSelectorColors() {
    selectors.forEach(({ mesh }) => {
        mesh.material.color.set(0xffffff); 
        mesh.material.opacity = 0.5; 
    });
}


//====================================================================================================================

//CAMERA
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.set(0, 0, -5)  // Default position remains the same
scene.add(camera)

//CONTROLS
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = false
controls.maxDistance = 5
controls.enableRotate = false;
controls.enablePan = false;
controls.minDistance = 5;
 

//RENDERER
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true  // Enable antialiasing
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) 

renderer.render(scene, camera)

//OSCILLATION PARAMETERS
let oscillationAmplitude = 0.36; 
let oscillationFrequency = .5;  
let phaseShift = 0;

//====================================================================================================================

//Note Controls

let isNoteOn = false;

window.__JUCE__.backend.addEventListener(
    "noteOn",
    () => {
        isNoteOn = true;  
    }
);

window.__JUCE__.backend.addEventListener(
    "noteOff",
    () => {
        isNoteOn = false;  
    }
);


//MIDI CONTROLS FROM JUCE
window.__JUCE__.backend.addEventListener(
    "updateFrequency", 
    (freqValue) => {
       
        oscillationFrequency = (freqValue / 500) * 0.1;
     
    
    }
)

window.__JUCE__.backend.addEventListener(
    "updateAmplitude", 
    (ampValue) => {
        directionalLight.intensity = (ampValue / 500) * 0.5;

    }
)


const waveShapeControl = {shapeIndex: 0 }

    function sendWaveShapeToCpp(newWaveShape) {
        newWaveShape == 0;
        nativeFunction(["waveShape", newWaveShape]);
    }


//====================================================================================================================

//ANIMATE

const animate = () => {
    requestAnimationFrame(animate);

    // Base time calculation for sine wave
    const time = performance.now() * 0.010;
    const newY = Math.sin(time + phaseShift) * oscillationAmplitude * .35;

    animateParticles();

    if (isNoteOn) {
        sphereMesh.rotation.y += oscillationFrequency;
        pyramidMesh.rotation.y += oscillationFrequency;
        cubeMesh.rotation.y += oscillationFrequency;

    }

    if (isGroupGreen) {
        sphereMesh.position.y = newY; 
        pyramidMesh.position.y = newY;
        cubeMesh.position.y = newY;
    } else {
       
        sphereMesh.position.y = 0; 
        pyramidMesh.position.y = 0;
        cubeMesh.position.y = 0;
    }

    if (isGroupBlue)
    {
        sphereMesh.position.z = newY; 
        pyramidMesh.position.z = newY;
        cubeMesh.position.z = newY;
    }

   

    renderer.render(scene, camera);


};


animate();

//====================================================================================================================

//RESIZE
window.addEventListener('resize', () => {

    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;


    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

   
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});