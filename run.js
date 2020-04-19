
import * as THREE from './node_modules/three/build/three.module.js'

import Stats from './node_modules/three/examples/jsm/libs/stats.module.js'
import { GUI } from './node_modules/three/examples/jsm/libs/dat.gui.module.js'

import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from './node_modules/three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from './node_modules/three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from './node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js'

var scene, camera, controls, pointLight, stats
var composer, renderer, mixer

var params = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0
}

var clock = new THREE.Clock()
var container = document.getElementById('container')

stats = new Stats()
container.appendChild(stats.dom)

renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.toneMapping = THREE.ReinhardToneMapping
container.appendChild(renderer.domElement)

scene = new THREE.Scene()

camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100)
camera.position.set(-5, 2.5, -3.5)
scene.add(camera)

controls = new OrbitControls(camera, renderer.domElement)
controls.maxPolarAngle = Math.PI * 0.5
controls.minDistance = 1
controls.maxDistance = 10

scene.add(new THREE.AmbientLight(0x404040))

pointLight = new THREE.PointLight(0xffffff, 1)
camera.add(pointLight)

var renderScene = new RenderPass(scene, camera)

var bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
bloomPass.threshold = params.bloomThreshold
bloomPass.strength = params.bloomStrength
bloomPass.radius = params.bloomRadius

composer = new EffectComposer(renderer)
composer.addPass(renderScene)
composer.addPass(bloomPass)

new GLTFLoader().load('assets/gearbox/scene.gltf', function (gltf) {
  console.log(gltf)
  var model = gltf.scene

  scene.add(model)

//   mixer = new THREE.AnimationMixer(model)
//   var clip = gltf.animations[0]
//   mixer.clipAction(clip.optimize()).play()

  animate()
})

var gui = new GUI()

gui.add(params, 'exposure', 0.1, 2).onChange(function (value) {
  renderer.toneMappingExposure = Math.pow(value, 4.0)
})

gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
  bloomPass.threshold = Number(value)
})

gui.add(params, 'bloomStrength', 0.0, 3.0).onChange(function (value) {
  bloomPass.strength = Number(value)
})

gui.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {
  bloomPass.radius = Number(value)
})

window.onresize = function () {
  var width = window.innerWidth
  var height = window.innerHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
  composer.setSize(width, height)
}

function animate () {
  requestAnimationFrame(animate)

  const delta = clock.getDelta()

  mixer.update(delta)

  stats.update()

  composer.render()
}
