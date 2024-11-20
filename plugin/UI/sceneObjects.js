import * as THREE from 'three'; // Import Three.js to use THREE.Color
import { taliesenBackground, taliesenRed, taliesenCopper, darkerTaliesenCopper, taliesenMud, neutraColorPalette } from './colorPalette.js';


//MATERIALS
const objectMaterial = new THREE.MeshStandardMaterial({ color: neutraColorPalette.paleSkyBlue })
objectMaterial.roughness = 0.7

//==================================================================================================

//PLANE
const planeMaterial = new THREE.MeshStandardMaterial({ color: neutraColorPalette.terracotta })
planeMaterial.roughness = 0.3

const planeSize = 10;
const cornerRadius = planeSize / 2.1; // Define the corner radius
const platformHeight = 0.1; // Very slight platform height

const planeShape = new THREE.Shape();
planeShape.moveTo(-planeSize / 2 + cornerRadius, -planeSize / 2);
planeShape.lineTo(planeSize / 2 - cornerRadius, -planeSize / 2);
planeShape.quadraticCurveTo(planeSize / 2, -planeSize / 2, planeSize / 2, -planeSize / 2 + cornerRadius);
planeShape.lineTo(planeSize / 2, planeSize / 2 - cornerRadius);
planeShape.quadraticCurveTo(planeSize / 2, planeSize / 2, planeSize / 2 - cornerRadius, planeSize / 2);
planeShape.lineTo(-planeSize / 2 + cornerRadius, planeSize / 2);
planeShape.quadraticCurveTo(-planeSize / 2, planeSize / 2, -planeSize / 2, planeSize / 2 - cornerRadius);
planeShape.lineTo(-planeSize / 2, -planeSize / 2 + cornerRadius);
planeShape.quadraticCurveTo(-planeSize / 2, -planeSize / 2, -planeSize / 2 + cornerRadius, -planeSize / 2);

//PLANE GEOMETRY
const planeGeometry = new THREE.ExtrudeGeometry(planeShape, { depth: platformHeight, bevelEnabled: false }); // Use ExtrudeGeometry for height
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI * 0.5; 
planeMesh.position.set(0, -2.5, 0);  // Moved the plane down

//SPHERE

function createSineWaveGeometry(width, height, depth, radius, smoothness, segments) {
    const shape = new THREE.Shape();
    const eps = 0.00001;
    const segmentWidth = width / segments;
    
    // Start at the left edge
    shape.moveTo(-width/2, 0);
    
    // Create the bottom curve
    for (let i = 0; i <= segments; i++) {
        const x = -width/2 + i * segmentWidth;
        const y = Math.sin((i / segments) * Math.PI * 2) * height/2;
        if (i === 0) {
            shape.lineTo(x, y);
        } else {
            shape.quadraticCurveTo(x - segmentWidth/2, y, x, y);
        }
    }
    
    // Create the top curve (in reverse)
    for (let i = segments; i >= 0; i--) {
        const x = -width/2 + i * segmentWidth;
        const y = Math.sin((i / segments) * Math.PI * 2) * height/2;
        shape.lineTo(x, y + eps); // Add a tiny offset to avoid z-fighting
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

const sineWidth = 1.33; // Increased by 33%
const sineHeight = 0.665; // Increased by 33%
const sineDepth = 0.266; // Increased by 33%
const sineRadius = 0.0665; // Increased by 33%
const sineSmoothness = 16;
const sineSegments = 64;

const sphereGeometry = createSineWaveGeometry(sineWidth, sineHeight, sineDepth, sineRadius, sineSmoothness, sineSegments);
const sphereMesh = new THREE.Mesh(sphereGeometry, objectMaterial);

export {objectMaterial, planeMesh, planeMaterial, sphereGeometry, sphereMesh};