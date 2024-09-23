// JS Code credit to https://threejs.org/examples/?q=webgpu%20particles#webgpu_particles
import * as THREE from 'three';
import { range, texture, mix, uv, color, rotateUV, positionLocal, timerLocal } from 'three/tsl';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let camera, scene, renderer;
let controls;

init();

function init() {

	const { innerWidth, innerHeight } = window;

	camera = new THREE.PerspectiveCamera();
	camera.position.set( 0, 0, 200 );

	scene = new THREE.Scene();
	//scene.fogNode = rangeFog( color( 0x0000ff ), 1500, 2100 );

	// textures

	const textureLoader = new THREE.TextureLoader();
	const map = textureLoader.load( 'https://threejs.org/examples/textures/opengameart/smoke1.png' );

	// create nodes

	const lifeRange = range( .1, 1 );
	const offsetRange = range( new THREE.Vector3( - 2, 3, - 2 ), new THREE.Vector3( 2, 5, 2 ) );

	const timer = timerLocal( .2, 1/*100000*/ );

	const lifeTime = timer.mul( lifeRange ).mod( 1 );
	const scaleRange = range( .3, 2 );
	const rotateRange = range( .1, 4 );

	const life = lifeTime.div( lifeRange );

	const fakeLightEffect = positionLocal.y.oneMinus().max( 0.2 );

	const textureNode = texture( map, rotateUV( uv(), timer.mul( rotateRange ) ) );

	const opacityNode = textureNode.a.mul( life.oneMinus() );

	const smokeColor = mix( color( 0x2c1501 ), color( 0x222222 ), positionLocal.y.mul( 3 ).clamp() );

	// create particles

	const smokeNodeMaterial = new THREE.SpriteNodeMaterial();
	smokeNodeMaterial.colorNode = mix( color( 0xf27d0c ), smokeColor, life.mul( 2.5 ).min( 1 ) ).mul( fakeLightEffect );
	smokeNodeMaterial.opacityNode = opacityNode;
	smokeNodeMaterial.positionNode = offsetRange.mul( lifeTime );
	smokeNodeMaterial.scaleNode = scaleRange.mul( lifeTime.max( 0.3 ) );
	smokeNodeMaterial.depthWrite = false;
	smokeNodeMaterial.transparent = true;

	const smokeInstancedSprite = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), smokeNodeMaterial );
	smokeInstancedSprite.scale.setScalar( 400 );
	smokeInstancedSprite.count = 2000;
	scene.add( smokeInstancedSprite );
	//

	const helper = new THREE.GridHelper( 3000, 40, 0x303030, 0x303030 );
	helper.position.y = - 75;
	scene.add( helper );

	//

	renderer = new THREE.WebGPURenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setAnimationLoop( render );
	document.body.appendChild( renderer.domElement );

	//

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.minDistance = 5;
	controls.maxDistance = 200;
	controls.target.set( 0, 0, 0 );
	controls.update();
	controls.saveState();

	//

	window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

	const { innerWidth, innerHeight } = window;

	camera.aspect = innerWidth / innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( innerWidth/2, innerHeight/2 );
	render()
}

function render() { renderer.render( scene, camera ); }


setTimeout( ()=>{
	renderer.setAnimationLoop(null)
},1000)
document.querySelector('#play-button').addEventListener('click',()=>{
	renderer.setAnimationLoop( render );
})
document.querySelector('#pause-button').addEventListener('click',()=>{
	renderer.setAnimationLoop( null );
})
