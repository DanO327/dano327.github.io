const startScreen = document.getElementById('start-screen');
const levelScreen = document.getElementById('level-screen');
const gameArea = document.getElementById('game-area');
const target = document.getElementById('target');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const currentLevelEl = document.getElementById('current-level');
const resultNotification = document.getElementById('result-notification');
const unlockNotification = document.getElementById('unlock-notification');
const menuBtn = document.getElementById('menu-btn');
const levelPanel = document.getElementById('level-panel');
const levelStartBtn = document.getElementById('level-start-btn');
const clickSound = document.getElementById('click-sound');
const unlockSound = document.getElementById('unlock-sound');

const maxLevels = 5;
const unlockScores = [0,500,500,500,500];
let levelRecords = [0,0,0,0,0];
let levelUnlocked = [true,false,false,false,false];

let score=0, time=30, lastClickTime=null, level=1, speed=1000;
let gameInterval, countdownInterval;

function showScreen(screen){
  [startScreen, levelScreen].forEach(s=>s.classList.add('hidden'));
  screen.classList.remove('hidden');
}

function renderLevelPanel(){
  levelPanel.innerHTML='';
  for(let i=1;i<=maxLevels;i++){
    const div=document.createElement('div');
    if(!levelUnlocked[i-1]){
      div.textContent=`NIVEL ${i} (Bloqueado: consigue ${unlockScores[i-1]} pts en el nivel ${i-1})`;
    } else {
      div.textContent=`NIVEL ${i} - Record: ${levelRecords[i-1]}`;
      if(i===level) div.classList.add('selected');
      div.addEventListener('click',()=>{ 
        level=i; 
        currentLevelEl.textContent=level; 
        speed=Math.max(300,1000-(level-1)*100); 
        renderLevelPanel(); 
      });
    }
    levelPanel.appendChild(div);
  }
}

function randomColor(){ 
  const colors=['#4caf50','#f44336','#ff9800','#2196f3','#e91e63','#00bcd4','#ffc107']; 
  return colors[Math.floor(Math.random()*colors.length)]; 
}

function randomSize(){ 
  const min=Math.max(10,20-level*2); 
  const max=Math.max(15,50-level*3); 
  return Math.floor(Math.random()*(max-min))+min; 
}

function moveTarget(){
  const size=randomSize();
  const rect=gameArea.getBoundingClientRect();
  const x=Math.random()*(rect.width - size);
  const y=Math.random()*(rect.height - size);
  target.style.width=size+'px';
  target.style.height=size+'px';
  target.style.left=x+'px';
  target.style.top=y+'px';
  target.style.background=randomColor();
  target.style.display='block';
  target.classList.remove('target-show');
  void target.offsetWidth;
  target.classList.add('target-show');
}

function createParticles(x,y,color){
  for(let i=0;i<20;i++){
    const p=document.createElement('div');
    p.classList.add('particle');
    p.style.background=color;
    p.style.left=`${x}px`;
    p.style.top=`${y}px`;
    const angle=Math.random()*2*Math.PI;
    const distance=Math.random()*60+30;
    p.style.setProperty('--x',Math.cos(angle)*distance+'px');
    p.style.setProperty('--y',Math.sin(angle)*distance+'px');
    gameArea.appendChild(p);
    setTimeout(()=>p.remove(),800);
  }
}

function showFloatingScore(points,x,y){
  const f=document.createElement('div');
  f.classList.add('floating-score');
  f.textContent='+'+points;
  f.style.left=x+'px';
  f.style.top=y+'px';
  gameArea.appendChild(f);
  setTimeout(()=>f.remove(),800);
}

function calculatePoints(rt){
  if(rt<0.5) return 100;
  if(rt>=2) return 10;
  return Math.round(100-((rt-0.5)/1.5)*90);
}

function showUnlockNotification(lvl){
  unlockSound.currentTime=0; 
  unlockSound.play();
  unlockNotification.textContent='¡Nivel '+lvl+' desbloqueado!';
  unlockNotification.style.display='block';
  unlockNotification.style.animation='unlockFade 0.8s forwards';
}

function endGame(){
  clearInterval(gameInterval);
  clearInterval(countdownInterval);
  target.style.display='none';
  
  if(level<maxLevels && score>=unlockScores[level]){
    if(!levelUnlocked[level]) showUnlockNotification(level+1);
    levelUnlocked[level]=true;
  }
  
  if(score>levelRecords[level-1]) levelRecords[level-1]=score;
  renderLevelPanel();

  let msg='';
  if(score<300) msg='Muy lento!';
  else if(score<600) msg='No está mal...';
  else if(score<900) msg='Bien hecho!';
  else if(score<1200) msg='¡Excelente!';
  else msg='¡Increíble!';

  resultNotification.innerHTML=`<strong>Juego terminado!</strong><br>Puntuación: ${score}<br>${msg}<br><br><button id="back-btn">Volver al menú</button>`;
  resultNotification.style.display='block';
  document.getElementById('back-btn').addEventListener('click',()=>{
    resultNotification.style.display='none';
    showScreen(levelScreen);
  });
}

// Eventos
startScreen.addEventListener('click',()=>{
  renderLevelPanel();
  showScreen(levelScreen);
});

levelStartBtn.addEventListener('click',()=>{
  levelScreen.classList.add('hidden');
  document.querySelector('.screen-frame').classList.add('on'); // pantalla encendida
  startGame();
});

menuBtn.addEventListener('click',()=>{
  clearInterval(gameInterval);
  clearInterval(countdownInterval);
  target.style.display='none';
  resultNotification.style.display='none';
  showScreen(levelScreen);
});

target.addEventListener('click',()=>{
  clickSound.currentTime=0;
  clickSound.play();
  const now=Date.now();
  let points=50;
  if(lastClickTime!==null){
    const rt=(now-lastClickTime)/1000;
    points=calculatePoints(rt);
  }
  lastClickTime=now;
  score+=points;
  scoreEl.textContent=score;

  const centerX = target.offsetLeft + target.offsetWidth/2;
  const centerY = target.offsetTop + target.offsetHeight/2;

  createParticles(centerX, centerY, target.style.background);
  showFloatingScore(points, centerX-10, centerY-20);

  target.classList.add('break');
  setTimeout(()=>{
    target.classList.remove('break'); 
    moveTarget();
  },300);
});

function startGame(){
  score=0; time=30; lastClickTime=null;
  currentLevelEl.textContent=level;
  scoreEl.textContent=score;
  timeEl.textContent=time;
  resultNotification.style.display='none';

  speed=Math.max(300,1000-(level-1)*100);
  moveTarget();

  clearInterval(gameInterval);
  clearInterval(countdownInterval);

  gameInterval=setInterval(moveTarget,speed);

  countdownInterval=setInterval(()=>{
    time--;
    timeEl.textContent=time;
    if(time<=0) endGame();
  },1000);
}