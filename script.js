import * as THREE from 'three'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
/* TransformControls is for the red-green-blue arrows to move objects around the scene */
import { TransformControls } from 'three/addons/controls/TransformControls.js';

import { VRButton } from 'three/addons/webxr/VRButton.js';
// import { ARButton } from 'three/addons/webxr/ARButton.js';

const canvasWrapperEl = document.querySelector('#canvas-wrapper');
let renderer, scene, camera, controls;

let chargedParticles = [];

init();

function init () {
	// === scene initialization === //
	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
	// z-position of non-zero is needed for OrbitControls to work - MUSTDO
	camera.position.set(0, 0, -10)
	camera.position.y = 10;
	scene = new THREE.Scene();
	// uniforms = {
	// 	pointTexture: { value: new THREE.TextureLoader().load( 'https://threejs.org/examples/textures/sprites/spark1.png' ) }
	// };
	// const shaderMaterial = new THREE.ShaderMaterial( {
	// 	uniforms: uniforms,
	// 	vertexShader: document.getElementById( 'vertexshader' ).textContent,
	// 	fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
	// 	blending: THREE.AdditiveBlending,
	// 	depthTest: false,
	// 	transparent: true,
	// 	vertexColors: true
	// } );
	// MUSTDO: ^
	// mustdo - fix material below and add wireframe
	scene.add( new THREE.Mesh(new THREE.BoxGeometry( 1, 1, 1 ), new THREE.MeshPhongMaterial( { color: 0x156289, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true })) );
	const lights = [];
		lights[ 0 ] = new THREE.DirectionalLight( 0xffffff, 3 );
		lights[ 1 ] = new THREE.DirectionalLight( 0xffffff, 3 );
		lights[ 2 ] = new THREE.DirectionalLight( 0xffffff, 3 );
		lights[ 0 ].position.set( 0, 200, 0 );
		lights[ 1 ].position.set( 100, 200, 100 );
		lights[ 2 ].position.set( - 100, - 200, - 100 );
	scene.add( lights[ 0 ] ); scene.add( lights[ 1 ] ); scene.add( lights[ 2 ] );
	scene.add( new THREE.GridHelper(10, 10) )
	//
	//
	//
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	canvasWrapperEl.append(renderer.domElement)
	renderer.xr.enabled = true;
	// renderer.xr.setFramebufferScaleFactor(2.0); // increase resoluition - MUSTDO
	document.body.appendChild( VRButton.createButton( renderer ) );
	// renderer.xr.setReferenceSpaceType('local');
	//
	//
	controls = new OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.minDistance = 10;
	controls.maxDistance = 50;
	controls.target.set(0, 0, 0); // for VR?
	controls.update()
	//
	// === function calls that get called once at the start === //
	// ResizeObserver calls the function once automatically
	// onWindowResize()
	renderer.setAnimationLoop( animate )
}

function vecField (x, y, z) {
	// sum up charged spheeres k*q/r
	// varying radius and charge
}

// renderer.setAnimationLoop( animate );

// function render () { renderer.render( scene, camera ); }

function animate() {
	// const sizes = geometry.attributes.size.array;
	// const pos = geometry.attributes.position.array;
	// let vel;
	// for ( let i = 0; i < particles; i ++ ) {
	// 	// sizes[ i ] = 10 * ( 1 + Math.sin( 0.1 * i + time ) )
	// 	sizes[ i ] = 10 * ( 1 )
	// 	// sizes[ i ] = 10 * ( 10 )
	// 	vel = v(pos[i*3], pos[i*3+1], pos[i*3+2])
	// 	pos[i*3] += vel[0];
	// 	pos[i*3 +1] += vel[1];
	// 	pos[i*3 +2] += vel[2];
	// 	pos[i*3]    = modClamp(pos[i*3+0], -radius, radius)
	// 	pos[i*3 +1] = modClamp(pos[i*3+1], -radius, radius)
	// 	pos[i*3 +2] = modClamp(pos[i*3+2], -radius, radius)
	// }
	// geometry.attributes.size.needsUpdate = true;
	// geometry.attributes.position.needsUpdate = true;
	renderer.render( scene, camera );
	controls.update();
}


// === Below I have put event listeners and stuff ==== //

// window.addEventListener('resize',()=>{...})
new ResizeObserver(function(){
	camera.aspect = canvasWrapperEl.clientWidth / canvasWrapperEl.clientHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(canvasWrapperEl.clientWidth, canvasWrapperEl.clientHeight)
	renderer.render( scene, camera );
}).observe(document.querySelector('#canvas-wrapper'))

document.querySelector('#pause-button').addEventListener('click', ()=>{
	renderer.setAnimationLoop( null );
})

document.querySelector('#play-button').addEventListener('click', ()=>{
	renderer.setAnimationLoop( animate );
})

renderer.xr.addEventListener('sessionstart', (e) => {
	// MUSTDO - clean up
	// Copied from https://discourse.threejs.org/t/initial-webxr-position-same-as-camera-position/36682/13
	// controls.update();
	// const baseReferenceSpace = renderer.xr.getReferenceSpace();
	// const offsetPosition = camera.position;
	//const offsetRotation = camera.rotation;
	// const offsetRotation = camera.quaternion;
	// const transform = new XRRigidTransform( offsetPosition, { x: offsetRotation.x, y: -(offsetRotation.y), z: offsetRotation.z, w: offsetRotation.w } ); 
	//const transform = new XRRigidTransform( offsetPosition, { x: offsetRotation.x, y: -(offsetRotation.y - 0.85), z: offsetRotation.z, w: offsetRotation.w } ); 
	// const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace( transform );
	// renderer.xr.setReferenceSpace( teleportSpaceOffset );
});