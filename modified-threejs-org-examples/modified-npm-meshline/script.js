import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
/* TransformControls is for the red-green-blue arrows to move objects around the scene */
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
// import { ARButton } from ...;
import { MeshLineGeometry, MeshLineMaterial, raycast } from 'meshline'

let renderer, scene, camera, controls;

let particleSystem, uniforms, geometry, mlg, mlm;
const bounds = 10;
const { sin, cos, tan } = Math;


init();

function init() {
camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
// camera.position.z = 10;
camera.position.set(0, 0, 10); // for VR?
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



// geometry = new THREE.BufferGeometry();

// geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
// geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
// geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setUsage( THREE.DynamicDrawUsage ) );

// particleSystem = new THREE.Points( geometry, shaderMaterial );

// scene.add( particleSystem );
// material from https://threejs.org/docs/scenes/geometry-browser.html#RingGeometry
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


let vecField = function(x, y, z) {
	return {
		x: 1,
		y: sin(x),
		z: 0
	}
	// return {
	// 	x: x + y,
	// 	y: y - x,
	// 	z: 0
	// }
	// return {
	// 	x: x + y,
	// 	y: 0,
	// 	z: 0
	// }
}
const dt = .1;

// let lines = [];

const arr = []
for (let i=0; i<10; ++i) {
	// Initial Conditions (IC)
	let x = (Math.random() * 2 - 1) * bounds
	let y = (Math.random() * 2 - 1) * bounds
	let z = (Math.random() * 2 - 1) * bounds
	// code from https://github.com/pmndrs/meshline
	let mlg = new MeshLineGeometry()
	for (let j = 0; j < 20/dt; j += 1) {
		// .setPoints() can take
		// - Float32Array, THREE.BufferGeometry,
		// Array<THREE.Vector3 | THREE.Vector2 | [number, number, number] | [number, number] | number>
		// second parameter of .setPoints() is the width of line.
		// arr.push(Math.cos(j), Math.sin(j), 0)
		arr.push(x, y, z)
		let v = vecField(x, y, z)
		x += v.x * dt;
		y += v.y * dt;
		z += v.z * dt;
	}
	mlg.setPoints(arr, (p) => .1)
	let mlm = new MeshLineMaterial()
	scene.add( new THREE.Mesh(mlg, mlm) )
}
//




renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
// renderer.xr.setReferenceSpaceType('local');
renderer.setAnimationLoop( animate );

const container = document.getElementById( 'container' );
document.body.append( renderer.domElement );

controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.minDistance = 10;
controls.maxDistance = 50;
controls.target.set(0, 0, 0); // for VR?
controls.update()

renderer.xr.enabled = true;
// renderer.xr.setFramebufferScaleFactor(2.0); // increase resoluition
document.body.appendChild( VRButton.createButton( renderer ) );


window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
}
onWindowResize()

function modClamp(t, tmin, tmax) {
	return tmin + (( (tmax-tmin) * 100 + t - tmin)% (tmax - tmin) );
}


function v(x, y, z) {
	// return [
	// 	.01 * (x + y*0),
	// 	.000 * (x - y*0),
	// 	.01 * z * 0
	// ]
	// return [
	// 	1,
	// 	0.01 * x,
	// 	.01 * z * 0
	// ]
	return [
		1,
		sin(x / 100 * 2 * PI),
		.01 * z * 0
	]
}

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

document.querySelector('#pause-button').addEventListener('click', ()=>{
	renderer.setAnimationLoop( null );
})

document.querySelector('#play-button').addEventListener('click', ()=>{
	renderer.setAnimationLoop( animate );
})

renderer.xr.addEventListener('sessionstart', (e) => {
	// Copied from https://discourse.threejs.org/t/initial-webxr-position-same-as-camera-position/36682/13
	controls.update();
	const baseReferenceSpace = renderer.xr.getReferenceSpace();
	const offsetPosition = camera.position;
	//const offsetRotation = camera.rotation;
	const offsetRotation = camera.quaternion;
	const transform = new XRRigidTransform( offsetPosition, { x: offsetRotation.x, y: -(offsetRotation.y), z: offsetRotation.z, w: offsetRotation.w } ); 
	//const transform = new XRRigidTransform( offsetPosition, { x: offsetRotation.x, y: -(offsetRotation.y - 0.85), z: offsetRotation.z, w: offsetRotation.w } ); 
	const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace( transform );
	renderer.xr.setReferenceSpace( teleportSpaceOffset );
});