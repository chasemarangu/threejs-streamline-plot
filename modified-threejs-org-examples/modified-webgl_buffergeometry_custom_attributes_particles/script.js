import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
/* TransformControls is for the red-green-blue arrows to move objects around the scene */
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
// import { ARButton } from ...;

let renderer, scene, camera, controls;

let particleSystem, uniforms, geometry;

const particles = 100e3;
// const particles = 100e1;
// const radius = 200;
const radius = 2000;

init();

function init() {
camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.z = 1000;
scene = new THREE.Scene();
uniforms = {
	pointTexture: { value: new THREE.TextureLoader().load( 'https://threejs.org/examples/textures/sprites/spark1.png' ) }
};

const shaderMaterial = new THREE.ShaderMaterial( {

	uniforms: uniforms,
	vertexShader: document.getElementById( 'vertexshader' ).textContent,
	fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

	blending: THREE.AdditiveBlending,
	depthTest: false,
	transparent: true,
	vertexColors: true

} );



geometry = new THREE.BufferGeometry();

const positions = [];
const colors = [];
const sizes = [];

const color = new THREE.Color();

for ( let i = 0; i < particles; i ++ ) {

	positions.push( ( Math.random() * 2 - 1 ) * radius );
	positions.push( ( Math.random() * 2 - 1 ) * radius );
	positions.push( ( Math.random() * 2 - 1 ) * radius );

	color.setHSL( i / particles, 1.0, 0.5 );

	colors.push( color.r, color.g, color.b );

	sizes.push( 20 );

}

geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( sizes, 1 ).setUsage( THREE.DynamicDrawUsage ) );

particleSystem = new THREE.Points( geometry, shaderMaterial );

scene.add( particleSystem );

renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );

const container = document.getElementById( 'container' );
document.body.append( renderer.domElement );

controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.minDistance = 10;
controls.maxDistance = 1000;

renderer.xr.enabled = true;
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

const { sin, cos, tan, PI } = Math;
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
	const time = Date.now() * 0.005;
	// particleSystem.rotation.z = 0.01 * time;
	const sizes = geometry.attributes.size.array;
	const pos = geometry.attributes.position.array;
	let vel;
	for ( let i = 0; i < particles; i ++ ) {
		// sizes[ i ] = 10 * ( 1 + Math.sin( 0.1 * i + time ) )
		// sizes[ i ] = 10 * ( 1 )
		sizes[ i ] = 10 * ( 10 )
		vel = v(pos[i*3], pos[i*3+1], pos[i*3+2])
		pos[i*3] += vel[0];
		pos[i*3 +1] += vel[1];
		pos[i*3 +2] += vel[2];
		pos[i*3]    = modClamp(pos[i*3+0], -radius, radius)
		pos[i*3 +1] = modClamp(pos[i*3+1], -radius, radius)
		pos[i*3 +2] = modClamp(pos[i*3+2], -radius, radius)
	}
	geometry.attributes.size.needsUpdate = true;
	geometry.attributes.position.needsUpdate = true;
	renderer.render( scene, camera );
	controls.update();
}

document.querySelector('#pause-button').addEventListener('click', ()=>{
	renderer.setAnimationLoop( null );
})

document.querySelector('#play-button').addEventListener('click', ()=>{
	renderer.setAnimationLoop( animate );
})