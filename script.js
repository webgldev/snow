import './scripts/threejs.js';
import { generateSnowflakes } from './scripts/snow.js';
import { playAnimation, playAnimations } from './scripts/threejs.js';

// 눈송이 생성
generateSnowflakes();

// 버튼 이벤트 핸들러
const buttonContainer = document.getElementById('animation-buttons');

buttonContainer.addEventListener('click', (event) => {
  const button = event.target.closest('.animation-button');
  const animationName = button.getAttribute('data-animation');

  if (button) {
    if (animationName.includes(',')) {
      const names = animationName.split(',').map(name => name.trim());
      playAnimations(names);
    } else {
      playAnimation(animationName);
    }
  }
});