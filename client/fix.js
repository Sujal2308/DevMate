const fs = require('fs');

let css = `
/* Loader-3 3D Box Loader Fixed */
.loader {
  --duration: 3s;
  position: relative;
  width: 120px;
  height: 120px;
  perspective: 600px;
  transform-style: preserve-3d;
  margin: auto;
}

.box {
  position: absolute;
  width: 32px;
  height: 32px;
  top: 50%;
  left: 50%;
  margin-top: -16px;
  margin-left: -16px;
  transform-style: preserve-3d;
}

.box > div {
  width: 100%;
  height: 100%;
  background-color: var(--clr, #3b82f6);
  position: absolute;
  transform-style: preserve-3d;
  transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0);
  animation: var(--duration) linear infinite;
}

.box > div::before, .box > div::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: var(--clr, #3b82f6);
}

.box > div::before {
  transform-origin: left;
  transform: rotateY(90deg);
  filter: brightness(0.8);
}

.box > div::after {
  transform-origin: top;
  transform: rotateX(90deg);
  filter: brightness(0.6);
}

.box0 { --x: -32px; --y: -32px; animation: box-move0 var(--duration) linear infinite; }
.box1 { --x: 0px;   --y: -32px; animation: box-move1 var(--duration) linear infinite; }
.box2 { --x: 32px;  --y: -32px; animation: box-move2 var(--duration) linear infinite; }
.box3 { --x: -32px; --y: 0px;   animation: box-move3 var(--duration) linear infinite; }
.box4 { --x: 32px;  --y: 0px;   animation: box-move4 var(--duration) linear infinite; }
.box5 { --x: -32px; --y: 32px;  animation: box-move5 var(--duration) linear infinite; }
.box6 { --x: 0px;   --y: 32px;  animation: box-move6 var(--duration) linear infinite; }
.box7 { --x: 32px;  --y: 32px;  animation: box-move7 var(--duration) linear infinite; }

.box0 > div { animation-name: box-scale0; }
.box1 > div { animation-name: box-scale1; }
.box2 > div { animation-name: box-scale2; }
.box3 > div { animation-name: box-scale3; }
.box4 > div { animation-name: box-scale4; }
.box5 > div { animation-name: box-scale5; }
.box6 > div { animation-name: box-scale6; }
.box7 > div { animation-name: box-scale7; }

.ground {
  position: absolute;
  width: 120px;
  height: 120px;
  bottom: -40px;
  left: 0px;
  background: rgba(255, 255, 255, 0.05);
  transform: rotateX(90deg) rotateY(0deg) translateZ(-40px);
  animation: ground var(--duration) linear infinite;
}
.ground > div {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(59,130,246,0) 60%);
  animation: ground-shine var(--duration) linear infinite;
}

`;

for(let i=0; i<8; i++) {
  css += `@keyframes box-move${i} {\n  0%, ${12 + i*4}% { transform: translate(var(--x), var(--y)); }\n  ${25 + i*4}%, 52% { transform: translate(0, 0); }\n  80% { transform: translate(0, -32px); }\n  90%, 100% { transform: translate(0, 188px); }\n}\n`;
  css += `@keyframes box-scale${i} {\n  0%, ${6 + i*4}% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); }\n  ${14 + i*4}%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); }\n}\n`;
}

css += `@keyframes ground {\n  0%, 65% { transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(0); }\n  75%, 90% { transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(1); }\n  100% { transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(0); }\n}\n`;
css += `@keyframes ground-shine {\n  0%, 70% { opacity: 0; }\n  75%, 87% { opacity: 0.2; }\n  100% { opacity: 0; }\n}\n`;

const indexCss = fs.readFileSync('src/index.css', 'utf8');
const splitIndex = indexCss.indexOf('.loader {');
if (splitIndex > -1) {
    fs.writeFileSync('src/index.css', indexCss.substring(0, splitIndex) + css);
} else {
    fs.appendFileSync('src/index.css', css);
}
console.log('Fixed loader CSS applied');
