import * as THREE from 'three'; // Import Three.js to use THREE.Color

// COLOR PALETTE
const taliesenBackground = new THREE.Color(0xD2B48C);   
const taliesenRed = new THREE.Color(0xC89640);  
const taliesenCopper = new THREE.Color(0x8B5A2B);
const darkerTaliesenCopper = taliesenCopper.clone().multiplyScalar(0.75);
const taliesenMud = new THREE.Color(0x8B5A2B);  // Outer ring color
const lightGreen = new THREE.Color(0x90EE90);   // Activated color

const neutraColorPalette = {
    neutraBeige: "#D9D4C5",       // Soft, warm beige
    sageGreen: "#A8B79A",         // Muted green reminiscent of foliage
    warmGray: "#A9A39B",          // Neutral gray
    terracotta: "#C67650",        // Earthy orange inspired by natural clay
    paleSkyBlue: "#9EB8C2",       // Dusty sky blue
    oliveBrown: "#5A5A44",        // Deep natural brown with olive undertones
    sunlitSand: "#E5C69F",        // Warm sandy beige
    mutedTeal: "#6E8D90",         // Subtle teal for depth
    charcoalGray: "#4A4A4A"       // Dark gray for contrast
  };

  export { taliesenBackground, taliesenRed, taliesenCopper, darkerTaliesenCopper, taliesenMud, neutraColorPalette, lightGreen };