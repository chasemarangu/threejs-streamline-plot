// https://threejs.org/examples/?q=particles#webgpu_tsl_compute_attractors_particles


import * as THREE from 'three';
import { float, If, PI, color, cos, instanceIndex, Loop, mix, mod, sin, storage, Fn, uint, uniform, uniformArray, hash, vec3, vec4 } from 'three/tsl';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

let camera, scene, renderer, controls, updateCompute;

init();

function init() {

camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 0.1, 100 );
camera.position.set( 0, 5, -10 );

scene = new THREE.Scene();

// const ambientLight = new THREE.AmbientLight( '#ffffff', 0.5 );
// scene.add( ambientLight );


// renderer
renderer = new THREE.WebGPURenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
// Note: can set a translucent clear color
renderer.setClearColor( '#000' );
// renderer.setClearColor( '#0000FF',0.2 );
// renderer.setClearColor( '#000',0 );
document.body.appendChild( renderer.domElement );

controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.minDistance = 0.1;
controls.maxDistance = 50;

window.addEventListener( 'resize', onWindowResize );

// attractors

const attractorsPositions = uniformArray( [
	new THREE.Vector3( - 1, 0, 0 ),
	new THREE.Vector3( 1, 0, 0 ),
	// new THREE.Vector3( 0, 0.5, 1 )
] );
const attractorsRotationAxes = uniformArray( [
	new THREE.Vector3( 0, 1, 0 ),
	new THREE.Vector3( 0, 1, 0 ),
	new THREE.Vector3( 1, 0, - 0.5 ).normalize()
] );
const attractorsLength = uniform( attractorsPositions.array.length );
const attractors = [];

for ( let i = 0; i < attractorsPositions.array.length; i ++ ) {
	const attractor = {};
	attractor.position = attractorsPositions.array[ i ];
	attractor.orientation = attractorsRotationAxes.array[ i ];
	attractor.reference = new THREE.Object3D();
	attractor.reference.position.copy( attractor.position );
	// attractor.reference.quaternion.setFromUnitVectors( new THREE.Vector3( 0, 1, 0 ), attractor.orientation );
	// Note: This below line with adding to scene is to click-drag the controls
	scene.add( attractor.reference );
	//
	//
	// const helpersRingGeometry = new THREE.RingGeometry( 1, 1.02, 32, 1, 0, Math.PI * 1.5 );
	// const helpersMaterial = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide } );
	// attractor.helper = new THREE.Group();
	// 	attractor.helper.scale.setScalar( 0.325 );
	// attractor.reference.add( attractor.helper );

	// 	attractor.ring = new THREE.Mesh( helpersRingGeometry, helpersMaterial );
	// 	attractor.ring.rotation.x = - Math.PI * 0.5;
	// attractor.helper.add( attractor.ring );


	attractor.controls = new TransformControls( camera, renderer.domElement );
	attractor.controls.mode = 'translate';
	attractor.controls.size = 0.5;
	attractor.controls.attach( attractor.reference );
	attractor.controls.visible = true;
	attractor.controls.enabled = attractor.controls.visible;
	scene.add( attractor.controls );

	attractor.controls.addEventListener( 'dragging-changed', ( event ) => {
		controls.enabled = ! event.value;
	} );

	attractor.controls.addEventListener( 'change', () => {
		attractor.position.copy( attractor.reference.position );
		attractor.orientation.copy( new THREE.Vector3( 0, 1, 0 ).applyQuaternion( attractor.reference.quaternion ) );
	} );
	attractors.push( attractor );
// end of for loop
}




// particles

const count = Math.pow( 2, 18 );
const material = new THREE.SpriteNodeMaterial( { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false } );

const attractorMass = uniform( Number( `1e${7}` ) );
const particleGlobalMass = uniform( Number( `1e${4}` ) );
const timeScale = uniform( 1 );
const spinningStrength = uniform( 2.75 );
const maxSpeed = uniform( 8 );
const gravityConstant = 6.67e-11;
const scale = uniform( 0.008 );
const boundHalfExtent = uniform( 8 );
const colorA = uniform( color( '#5900ff' ) );
const colorB = uniform( color( '#ffa575' ) );

const positionBuffer = storage( new THREE.StorageInstancedBufferAttribute( count, 3 ), 'vec3', count );
const velocityBuffer = storage( new THREE.StorageInstancedBufferAttribute( count, 3 ), 'vec3', count );

const sphericalToVec3 = Fn( ( [ phi, theta ] ) => {
	const sinPhiRadius = sin( phi );
	return vec3(
		sinPhiRadius.mul( sin( theta ) ),
		cos( phi ),
		sinPhiRadius.mul( cos( theta ) )
	);

} );

const vecField = Fn( ( [ x, y, z ] ) => {
// 	const sinPhiRadius = sin( x );
	
// 	return vec3(
// 		sinPhiRadius.mul( sin( y ) ),
// 		cos( x ),
// 		sinPhiRadius.mul( cos( y ) )
// 	);
	// return vec3(
	// 	x.sub(y),
	// 	y.sub(x),
	// 	z
	// )
	return vec3(
		cos(x.mul(2)).add(2),
		sin(y.mul(3)).add(2),
		0
	)
} );

// init compute

const init = Fn( () => {
	const position = positionBuffer.element( instanceIndex );
	const velocity = velocityBuffer.element( instanceIndex );
	
	const basePosition = vec3(
		hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ),
		hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ),
		hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) )
	).sub( 0.5 ).mul( vec3( 8, 8, 8 ) );
	position.assign( basePosition );
	const phi = hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ).mul( PI ).mul( 2 );
	const theta = hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ).mul( PI );
	const baseVelocity = sphericalToVec3( phi, theta ).mul( 0.05 );
	velocity.assign( baseVelocity );
} );

const initCompute = init().compute( count );

const reset = () => {
	renderer.compute( initCompute );
};

reset();

// update compute

const particleMassMultiplier = hash( instanceIndex.add( uint( Math.random() * 0xffffff ) ) ).remap( 0.25, 1 ).toVar();
const particleMass = particleMassMultiplier.mul( particleGlobalMass ).toVar();

const update = Fn( () => {
	// const delta = timerDelta().mul( timeScale ).min( 1 / 30 ).toVar();
	const delta = float( 1 / 60 ).mul( timeScale ).toVar(); // uses fixed delta to consistant result
	const position = positionBuffer.element( instanceIndex );
	const velocity = velocityBuffer.element( instanceIndex );

	// force

	const force = vec3( 0 ).toVar();

	/*Loop( attractorsLength, ( { i } ) => {
		const attractorPosition = attractorsPositions.element( i );
		const attractorRotationAxis = attractorsRotationAxes.element( i );
		const toAttractor = attractorPosition.sub( position );
		const distance = toAttractor.length();
		const direction = toAttractor.normalize();
		// gravity
		const gravityStrength = attractorMass.mul( particleMass ).mul( gravityConstant ).div( distance.pow( 2 ) ).toVar();
		const gravityForce = direction.mul( gravityStrength );
		force.addAssign( gravityForce );
		// spinning
		const spinningForce = attractorRotationAxis.mul( gravityStrength ).mul( spinningStrength );
		const spinningVelocity = spinningForce.cross( toAttractor );
		force.addAssign( spinningVelocity );
	} );*/

	// velocity
	velocity.addAssign( force.mul( delta ) );
	const speed = velocity.length();
	If( speed.greaterThan( maxSpeed ), () => {
		// velocity.assign( velocity.normalize().mul( maxSpeed ) );
		velocity.assign(0);
	} );
	velocity.assign(0)
	// velocity.addAssign(position.yxz)
	velocity.addAssign(vecField(position.x, position.y, position.z))
	// velocity.addAssign(sphericalToVec3(position.x, 0))
	// position

	position.addAssign( velocity.mul( delta ) );
	
	// box loop
	const halfHalfExtent = boundHalfExtent.div( 2 ).toVar();
	position.assign( mod( position.add( halfHalfExtent ), boundHalfExtent ).sub( halfHalfExtent ) );

} );
updateCompute = update().compute( count );

// nodes

material.positionNode = positionBuffer.toAttribute();

material.colorNode = Fn( () => {

	const velocity = velocityBuffer.toAttribute();
	const speed = velocity.length();
	const colorMix = speed.div( maxSpeed ).smoothstep( 0, 0.5 );
	const finalColor = mix( colorA, colorB, colorMix );

	return vec4( finalColor, 1 );

} )();

material.scaleNode = particleMassMultiplier.mul( scale );

// mesh
const geometry = new THREE.PlaneGeometry( 1, 1 );
const mesh = new THREE.InstancedMesh( geometry, material, count );
scene.add( mesh );

// gui
if (true) {
	const gui = new GUI();
	gui.add( { attractorMassExponent: attractorMass.value.toString().length - 1 }, 'attractorMassExponent', 1, 10, 1 ).onChange( value => attractorMass.value = Number( `1e${value}` ) );
	gui.add( { particleGlobalMassExponent: particleGlobalMass.value.toString().length - 1 }, 'particleGlobalMassExponent', 1, 10, 1 ).onChange( value => particleGlobalMass.value = Number( `1e${value}` ) );
	gui.add( maxSpeed, 'value', 0, 10, 0.01 ).name( 'maxSpeed' );
	gui.add( spinningStrength, 'value', 0, 10, 0.01 ).name( 'spinningStrength' );
	gui.add( scale, 'value', 0, 0.1, 0.001 ).name( 'scale' );
	gui.addColor( { color: colorA.value.getHexString( THREE.SRGBColorSpace ) }, 'color' ).name( 'colorA' ).onChange( value => colorA.value.set( value ) );
	gui.addColor( { color: colorB.value.getHexString( THREE.SRGBColorSpace ) }, 'color' ).name( 'colorB' ).onChange( value => colorB.value.set( value ) );
	gui.add( { reset }, 'reset' );
}

// end of init(); function
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

async function animate() {
	controls.update();
	renderer.compute( updateCompute );
	renderer.render( scene, camera );
}



setTimeout( ()=>{
	renderer.setAnimationLoop(null)
},1000)
document.querySelector('#play-button').addEventListener('click',()=>{
	renderer.setAnimationLoop( animate );
})
document.querySelector('#pause-button').addEventListener('click',()=>{
	renderer.setAnimationLoop( null );
})