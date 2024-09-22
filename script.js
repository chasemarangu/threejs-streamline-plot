import * as THREE from 'three';

import { VRButton } from 'three/addons/webxr/VRButton.js';


function myPrint(txt) {
	txt = "" + txt;
	// Chase Note: might later make it so that it adds a "pop up box" with CSS animations to the <body> element that hovers over before floating away, like the canvas (instructure) error messages
	let divEl = document.createElement("div")
	// txt = txt.split("\t").join("<tab>")
	// txt = txt.split("\t").join(" ")
	txt = txt.split("\t").join("----")
	let theLines = txt.split("\n")
	for (let theLine of theLines) {
		let childEl = document.createElement("div")
		childEl.textContent = theLine;
		childEl.style = "border:unset;" // override CSS <style> tags and linked stylesheet
		// Element.append() (or Node.appendChild()) it as the last element in the body. Could also use Node.insertBefore().
		divEl.append(childEl)
	}
	document.body.append(divEl)
}


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(); // updated in ResizeObserver()

const renderer = new THREE.WebGLRenderer();
const theWrap = document.querySelector("#canvas-wrapper")
// renderer.setSize( window.innerWidth/2, window.innerHeight/2);
// Element.append() vs Node.appendChild().
// renderer.domElement is the canvas.
theWrap.append(renderer.domElement)


document.body.appendChild( VRButton.createButton( renderer ) );
renderer.xr.enabled = true;


let geometry = new THREE.BoxGeometry( 1, 1, 1 );
let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
let cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;


//create a blue LineBasicMaterial
let material2 = new THREE.LineBasicMaterial( { color: 0x0000ff } );
let points2 = [];
points2.push( new THREE.Vector3( - 1, 0, 0 ) );
points2.push( new THREE.Vector3( 0, 1, 0 ) );
points2.push( new THREE.Vector3( 1, 0, 0 ) );
let geometry2 = new THREE.BufferGeometry().setFromPoints( points2 );
let line2 = new THREE.Line( geometry2, material2 );
scene.add(line2)






let frameCount = 0;
let playing = false;
let canImmersiveXR = false;
if ('xr' in navigator) {}
let par1 = 0.2;


function resetScene () {
	par1 = 0;
	cube.rotation.x = 0;
	cube.rotation.y = 0;
	// console.log(par1)
}
function drawScene () {
	renderer.render( scene, camera );
	++frameCount;
}


function animScene () {
	cube.rotation.x = par1 / 30 * Math.PI/2;
	cube.rotation.y = par1 / 30 * Math.PI/2;
	++par1;
}

resetScene();
drawScene();

function updateUI () {
	document.querySelector('#framecount-stat').textContent = 'frames: ' + frameCount;
}
let updateUIid = setInterval( updateUI, 100 )


function animLoopFunc() {
	drawScene();
	animScene();
}

function play () {
	renderer.setAnimationLoop(animLoopFunc);
}
document.querySelector('#play-button').addEventListener('click', play)

function pause () {
	renderer.setAnimationLoop( null )
}
document.querySelector('#pause-button').addEventListener('click', pause)

function restart () {
	pause()
	frameCount = 0;
	resetScene()
	drawScene()
}
document.querySelector('#restart-button').addEventListener('click', restart)

new ResizeObserver(function(){
	// based on ThreeJS examples
	camera.aspect = theWrap.clientWidth / theWrap.clientHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(theWrap.clientWidth, theWrap.clientHeight)
	// took me a while, but I figured out we
	// need to drawScene() after doing this other
	// stuff in the ResizeObserver to prevent
	// the canvas from blinking white.
	drawScene()
}).observe(document.querySelector('#canvas-wrapper'))