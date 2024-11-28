// scripts/threejs.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// 씬 생성
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// 카메라 설정
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-2, 2, 3);

// 렌더러 설정
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas'),
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// 조명
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// 컨트롤러
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 텍스처 생성
const textureLoader = new THREE.TextureLoader();

// 바닥 텍스처
const floorTexture = textureLoader.load('../public/snowplan.png');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(10, 10);

// 생성된 노멀 맵
const floorNormalMap = textureLoader.load('../public/snowplan_normal.png');
floorNormalMap.wrapS = floorNormalMap.wrapT = THREE.RepeatWrapping;
floorNormalMap.repeat.set(1, 1);

// 바닥 재질 생성 및 노멀 맵 적용
const floorMaterial = new THREE.MeshPhongMaterial({ 
  map: floorTexture, 
  normalMap: floorNormalMap,
  normalScale: new THREE.Vector2(1, 1),
  emissive: new THREE.Color(0xffffff),
  emissiveIntensity: 0.1,
  side: THREE.DoubleSide 
});

// 바닥 생성
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;
scene.add(floor);

// 씬에 안개 추가
const fogColor = new THREE.Color(0xffffff);
const fogNear = 1;
const fogFar = 20;
scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);

// 애니메이션
const mixers = [];
const animationsMap = {};
const clock = new THREE.Clock();

// 모델 로드 함수
function loadModel(url, name, position = { x: 0, y: 0, z: 0 }, scale = { x: 1, y: 1, z: 1 }, rotation = { x: 0, y: 0, z: 0 }) {
  const loader = new GLTFLoader();
  loader.load(
    new URL(url, import.meta.url).href,
    (gltf) => {
      const model = gltf.scene;
      scene.add(model);
      model.position.set(position.x, position.y, position.z);
      model.scale.set(scale.x, scale.y, scale.z);
      model.rotation.set(rotation.x, rotation.y, rotation.z);
      // 애니메이션 믹서 생성
      const mixer = new THREE.AnimationMixer(model);
      mixers.push(mixer);

      // 애니메이션 설정
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        if (!animationsMap[clip.name]) {
          animationsMap[clip.name] = [];
        }
        animationsMap[clip.name].push(action);
      });
    },
    undefined,
    (error) => {
      console.error(`모델 로드 오류 [${name}]:`, error);
    }
  );
}

// 모델 로드
// 캐릭터
loadModel('model01-01.glb', 'model01', { x: 0, y: 0, z: -1 }, { x: 0.4, y: 0.4, z: 0.4 }, { x: 0, y: 0, z: 0 });
// 캐릭터2
loadModel('model02.glb', 'model02', { x: -0.5, y: 0.01, z: 0.8 }, { x: 0.01, y: 0.01, z: 0.01 }, { x: 0, y: -0.5, z: 0 });
// 썰매
// loadModel('sleigh.glb', 'sleigh', { x: 2.5, y: 0.5, z: -1.5 }, { x: 0.003, y: 0.003, z: 0.003 }, { x: 0, y: -1, z: 0 });
// 나무
loadModel('tree.glb', 'tree', { x: 1, y: 0, z: 1 }, { x: 0.2, y: 0.2, z: 0.2 }, { x: 0, y: Math.PI / -1.2, z: 0 });
// 눈사람
loadModel('snow_man.glb', 'snow_man', { x: -0.5, y: 0.2, z: 0 }, { x: 0.2, y: 0.2, z: 0.2 }, { x: 0, y: -2, z: 0 });
// 선물
loadModel('gifts.glb', 'gifts', { x: 0.3, y: 0, z: 0.3 }, { x: 0.8, y: 0.8, z: 0.8 }, { x: 0, y: -2, z: 0 });

// 블룸 효과 (포스트 프로세서)
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.1, // 블룸 강도
  0.3, // 블룸 반경
  0.85 // 블룸 임계값
);
composer.addPass(bloomPass);


// 애니메이션
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  mixers.forEach((mixer) => mixer.update(delta));

  controls.update();  
  composer.render();
}
animate();

// 창 크기 변경 시 대응
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// 단일 애니메이션 재생 함수
function playAnimation(name) {
  if (!animationsMap[name]) {
    console.warn(`Animation "${name}" is not available.`);
    return;
  }

  // 모든 애니메이션을 일시 정지
  Object.values(animationsMap).forEach((actions) => {
    actions.forEach((action) => action.stop());
  });

  // 선택한 애니메이션 재생
  animationsMap[name].forEach((action) => {
    action.reset().play();
  });
}

// 다중 애니메이션 재생 함수
function playAnimations(names) {
  if (!names || !Array.isArray(names)) {
    console.warn('playAnimations expects an array of animation names.');
    return;
  }

  names.forEach((name) => {
    if (animationsMap[name]) {
      animationsMap[name].forEach((action) => {
        action.reset().play();
      });
    } else {
      console.warn(`Animation "${name}" not found.`);
    }
  });
}

// 애니메이션을 외부에서 제어할 수 있도록 함수 내보내기
export { playAnimation, playAnimations };
export { scene, camera, renderer };
