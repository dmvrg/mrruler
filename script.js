import * as THREE from 'three'
import { XRButton } from 'three/addons/webxr/XRButton.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';

let renderer, text, font;

// Scene

const scene = new THREE.Scene()
scene.background = new THREE.Color( 0x505050 );

// Font

var textGeometry
var textMaterial
var loadedFont

const fontLoader = new FontLoader()
fontLoader.load(

    './static/fonts/helvetiker_regular.typeface.json',
    (font) => 
    {
        
        loadedFont = font
        textGeometry = new TextGeometry(
            'Dist',
            {
                font: font,
                size: 0.015,
                height: 0,

            }
        )
        textMaterial = new THREE.MeshBasicMaterial()
        text = new THREE.Mesh(textGeometry, textMaterial)
        scene.add(text)

        // Calculate the center of the text geometry
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        text.position.x = -textWidth / 2;
        
    }

)

// Canvas

const canvas = document.querySelector('canvas.webgl')

// Camera

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 3
scene.add(camera)

// Renderer

renderer = new THREE.WebGLRenderer( { alpha: true, background: '#000000' } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.xr.enabled = true;
document.body.appendChild( renderer.domElement );
document.body.appendChild( XRButton.createButton( renderer ) );

// Lights

const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

// Joint References

const sphere = new THREE.SphereGeometry(0.005, 32, 32)
const defaultMat = new THREE.MeshBasicMaterial({ 
    color: 0xff0000, 
    opacity:0,
    transparent: true })

const rThumbObj = new THREE.Mesh(sphere, defaultMat)
const rIndexObj = new THREE.Mesh(sphere, defaultMat)
const lThumbObj = new THREE.Mesh(sphere, defaultMat)
const lIndexObj = new THREE.Mesh(sphere, defaultMat)

scene.add(rThumbObj)
scene.add(rIndexObj)
scene.add(lThumbObj)
scene.add(lIndexObj)

//  Pinch References

const sphere2 = new THREE.SphereGeometry(0.006, 32, 32)
const defaultMat2 = new THREE.MeshBasicMaterial({ 
    color: 0xffffff,
 })

const rPinchSphere = new THREE.Mesh(sphere2, defaultMat2)
scene.add(rPinchSphere)

const lPinchSphere = new THREE.Mesh(sphere2, defaultMat2)
scene.add(lPinchSphere)


// Line Object

const cube = new THREE.BoxGeometry(.05, .05, .05)
const cubeMat = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    opacity: 0.65,
    transparent: true
})
const tempCube = new THREE.Mesh(cube, cubeMat)
scene.add(tempCube)

// Hands

const handModelFactory = new XRHandModelFactory();

var hand1, hand2;

hand1 = renderer.xr.getHand( 0 );
hand1.add( handModelFactory.createHandModel( hand1 ) );
scene.add( hand1 );

hand2 = renderer.xr.getHand( 1 );
hand2.add( handModelFactory.createHandModel( hand2 ) );
scene.add( hand2 );

var handsGroup = new THREE.Group();
scene.add(handsGroup);

handsGroup.add(hand1, hand2);
handsGroup.visible = false;


renderer.setAnimationLoop( function () {

    renderer.render( scene, camera );

    // Joint References
    
    rThumbObj.position.x = hand1.joints['thumb-tip'].position.x;
    rThumbObj.position.y = hand1.joints['thumb-tip'].position.y;
    rThumbObj.position.z = hand1.joints['thumb-tip'].position.z;

    rThumbObj.rotation.x = hand1.joints['thumb-tip'].rotation.x;
    rThumbObj.rotation.y = hand1.joints['thumb-tip'].rotation.y;
    rThumbObj.rotation.z = hand1.joints['thumb-tip'].rotation.z;

    rIndexObj.position.x = hand1.joints['index-finger-tip'].position.x;
    rIndexObj.position.y = hand1.joints['index-finger-tip'].position.y;
    rIndexObj.position.z = hand1.joints['index-finger-tip'].position.z;

    rIndexObj.rotation.x = hand1.joints['index-finger-tip'].rotation.x;
    rIndexObj.rotation.y = hand1.joints['index-finger-tip'].rotation.y;
    rIndexObj.rotation.z = hand1.joints['index-finger-tip'].rotation.z;

    lThumbObj.position.x = hand2.joints['thumb-tip'].position.x;
    lThumbObj.position.y = hand2.joints['thumb-tip'].position.y;
    lThumbObj.position.z = hand2.joints['thumb-tip'].position.z;

    lThumbObj.rotation.x = hand2.joints['thumb-tip'].rotation.x;
    lThumbObj.rotation.y = hand2.joints['thumb-tip'].rotation.y;
    lThumbObj.rotation.z = hand2.joints['thumb-tip'].rotation.z;

    lIndexObj.position.x = hand2.joints['index-finger-tip'].position.x;
    lIndexObj.position.y = hand2.joints['index-finger-tip'].position.y;
    lIndexObj.position.z = hand2.joints['index-finger-tip'].position.z;

    lIndexObj.rotation.x = hand2.joints['index-finger-tip'].rotation.x;
    lIndexObj.rotation.y = hand2.joints['index-finger-tip'].rotation.y;
    lIndexObj.rotation.z = hand2.joints['index-finger-tip'].rotation.z;

    // Pinch Detection

    const rIndexThumbDist = rIndexObj.position.distanceTo(rThumbObj.position);
    const lIndexThumbDist = lIndexObj.position.distanceTo(lThumbObj.position);


    if (rIndexThumbDist < 0.02) {

        rPinchSphere.position.x = rThumbObj.position.x;
        rPinchSphere.position.y = rThumbObj.position.y;
        rPinchSphere.position.z = rThumbObj.position.z;


    
    }

    if (lIndexThumbDist < 0.02) {

        lPinchSphere.position.x = lThumbObj.position.x;
        lPinchSphere.position.y = lThumbObj.position.y;
        lPinchSphere.position.z = lThumbObj.position.z;
    
    }

    var midPoint = new THREE.Vector3().addVectors(rPinchSphere.position, lPinchSphere.position).divideScalar(2);
    var targetDir = new THREE.Vector3().subVectors(rPinchSphere.position, lPinchSphere.position).normalize();

    // Line

    tempCube.position.copy(midPoint)
    tempCube.lookAt(new THREE.Vector3().addVectors(tempCube.position, targetDir));

    const pointDist = rPinchSphere.position.distanceTo(lPinchSphere.position);

    var normal = THREE.MathUtils.mapLinear(pointDist, 0, 0.1, 0, 1);
    var scaleValue = THREE.MathUtils.lerp(0, 2, normal);

    tempCube.scale.set(0.075, 0.075, scaleValue);
    
    // Text

    var distCm = (pointDist * 100).toFixed(2)
    var distStr = distCm.toString() + " cm"
    
    if (textGeometry) {

     textGeometry.dispose();
    
    }

    textGeometry = new TextGeometry(distStr, {
            
                font: loadedFont,
                size: 0.015,
                height: 0,

    });

    text.geometry = textGeometry;

    textGeometry.computeBoundingBox();
    var textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    textGeometry.translate(-textWidth / 2, 0, 0);

    text.position.copy(midPoint)

    text.lookAt(camera.position)

} );