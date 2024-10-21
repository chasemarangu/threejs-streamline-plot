import * as THREE from 'three'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
/* TransformControls is for the red-green-blue arrows to move objects around the scene */
import { TransformControls } from 'three/addons/controls/TransformControls.js';

import { VRButton } from 'three/addons/webxr/VRButton.js';
// import { ARButton } from 'three/addons/webxr/ARButton.js';

const canvasWrapperEl = document.querySelector('#canvas-wrapper');
let renderer, scene, camera, controls;

let chargedParticles = []; const initChargedParticlesLen = 10;
let fieldLines = []; const numFieldLines = 20;
// for function vecField below
let vecFieldReturnValue = new THREE.Vector3();

// The width of the cube that all the scene fits in.
// Twice the max distance from the origin along any axis
// const sceneW = 5 * 2;
// const sceneW = 10 * 2;
const sceneW = 40 * 2;

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
	// ground
	scene.add( new THREE.GridHelper(sceneW, sceneW) )
	scene.add( new THREE.BoxHelper(new THREE.Mesh(
			new THREE.BoxGeometry(sceneW, sceneW, sceneW)
		))
	)
	//
	//
	// add some charged particles
	for (let i=0; i<10; ++i) {
		chargedParticles.push({
			charge: Math.round(Math.random(1, 5))*(
				Math.round(Math.random(0,1))*2-1
			), // Charge in Coulombs. Can't be zero, but can be ±(1...5)
			// radius can be 1 or 2
			// radius: Math.round( Math.random()*(2-1) +1 ),
			// just set radius to 1
			radius: 1,
			x: (Math.random()*1-.5)*sceneW,
			y: (Math.random()*1-.5)*sceneW,
			z: (Math.random()*1-.5)*sceneW
		})
	}
	//
	for (let p of chargedParticles) {
		let geometry = new THREE.SphereGeometry( p.radius, 10, 10 );
		let material = new THREE.MeshPhongMaterial( { color: p.charge < 0 ? 0x156289 : 0xCCCC00, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true })
		p.mesh = new THREE.Mesh(geometry, material);
		// position.set help from https://discourse.threejs.org/t/discourage-usage-of-translatex-y-z-and-rotatex-y-z-methods/50796
		p.mesh.position.set(p.x, p.y, p.z)
		scene.add( p.mesh );
		//
	}
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
	// TransformControls code help from
	// https://github.com/mrdoob/three.js/blob/master/examples/webgpu_tsl_compute_attractors_particles.html
	for (let p of chargedParticles) {
		// add the controls to it
		p.tcontrols = new TransformControls( camera, renderer.domElement );
		// p.tcontrols.mode = 'translate'; // translate, rotate, scale
		p.tcontrols.size = 0.5;
		p.tcontrols.attach( p.mesh );
		p.tcontrols.enabled = true;
		console.log(p.tcontrols)
		scene.add( p.tcontrols );
		p.tcontrols.addEventListener( 'dragging-changed', ( event ) => {
			controls.enabled = ! event.value;
		});
		p.tcontrols.addEventListener( 'change', () => {
			// attractor.position.copy( attractor.reference.position );
			// attractor.orientation.copy( new THREE.Vector3( 0, 1, 0 ).applyQuaternion( attractor.reference.quaternion ) );
		});
		// MUSTDO - make it so that only one TransformCtrl can be
		//          selected and dragged at a time
		// MUSTDO - clamp object positions to sceneW so you can't accidentally
		//          TransformCtrl your object past the vanishing point to infinity
	}
	//
	/*for (let i=0; i<numFieldLines; ++i) {
		let l = {
			x: (Math.random()*.5 - 1)*sceneW,
			y: (Math.random()*.5 - 1)*sceneW,
			z: (Math.random()*.5 - 1)*sceneW
		}
		// MUSTDO - use batched mesh
		l.geom = new THREE.TubeGeometry()
		fieldLines.push(l)
	}*/
	//
	// for (let l of fieldLines) {}
	//
	//
	controls = new OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.minDistance = 10;
	controls.maxDistance = sceneW*4;
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
	//
	// we use vecFieldReturnValue variable
	// so we do not create a memory leak of
	// new THREE.Vector3() a million times per second
	vecFieldReturnValue.set(
		1, 1, 1
	)
	return vecFieldReturnValue;
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