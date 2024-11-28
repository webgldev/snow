export const generateSnowflakes = () => {
  const numberOfSnowflakes = 100;
  const body = document.body;

  for (let i = 0; i < numberOfSnowflakes; i++) {
    const snowDiv = document.createElement('div');
    snowDiv.className = 'snow';
    body.appendChild(snowDiv);
    setSnowflakeProperties(snowDiv, i);
  }
}

const setSnowflakeProperties = (snowDiv, index) => {
  // 위치
  const x = Math.random() * window.innerWidth;
  const y = -30;
  snowDiv.style.left = `${x}px`;
  snowDiv.style.top = `${y}px`;
  
  // 애니메이션
  const animationDuration = 5 + Math.random() * 10;
  const animationDelay = Math.random() * 5;
  const animationName = `fall-${index}`;
  
  // 키프레임
  const keyframes = `@keyframes ${animationName} {
    0% { transform: translate(${x}px, -10px); }
    100% { transform: translate(${x + Math.random() * 100 - 10}px, ${window.innerHeight + 10}px); }
    }`;

  snowDiv.style.animation = `${animationName} ${animationDuration}s ${animationDelay}s infinite linear`;
  document.styleSheets[0].insertRule(keyframes, document.styleSheets[0].cssRules.length);

  return { x, animationName, keyframes };
};