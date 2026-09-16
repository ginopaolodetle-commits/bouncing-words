const defaultRounds = [
  { type: 'AFFIRMATIVE', w: ['She', 'plays', 'tennis'], a: 'She plays tennis.' },
  { type: 'AFFIRMATIVE', w: ['They', 'live', 'in', 'Argentina'], a: 'They live in Argentina.' },
  { type: 'AFFIRMATIVE', w: ['Tom', 'likes', 'pizza'], a: 'Tom likes pizza.' },
  { type: 'NEGATIVE', w: ['I', 'do', 'not', 'like', 'coffee'], a: 'I do not like coffee.' },
  { type: 'NEGATIVE', w: ['She', 'does', 'not', 'play', 'football'], a: 'She does not play football.' },
  { type: 'YES / NO QUESTION', w: ['Do', 'you', 'like', 'music'], a: 'Do you like music?' },
  { type: 'YES / NO QUESTION', w: ['Does', 'he', 'play', 'tennis'], a: 'Does he play tennis?' },
  { type: 'WH QUESTION', w: ['Where', 'do', 'they', 'live'], a: 'Where do they live?' },
  { type: 'WH QUESTION', w: ['What', 'does', 'she', 'eat'], a: 'What does she eat?' },
  { type: 'WH QUESTION', w: ['When', 'do', 'you', 'study', 'English'], a: 'When do you study English?' }
];

const speedMultipliers = {
  slow: 0.1,
  normal: 0.25,
  fast: 0.5
};

let currentRounds = [];
let speedSetting = 'normal';
let n = 0;
let running = false;
let raf = 0;
let last = 0;
let objs = [];

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');

const inputWords = document.getElementById('input-words');
const inputAnswer = document.getElementById('input-answer');
const selectSpeed = document.getElementById('select-speed');
const btnStartGame = document.getElementById('btn-start-game');
const btnLoadDefault = document.getElementById('btn-load-default');

const arena = document.getElementById('arena');
const center = document.getElementById('center');
const centerTitle = document.getElementById('center-title');
const centerSub = document.getElementById('center-sub');
const ans = document.getElementById('answer');
const label = document.getElementById('round');

const btnStart = document.getElementById('btn-start');
const btnAnswer = document.getElementById('btn-answer');
const btnNext = document.getElementById('btn-next');
const btnSetup = document.getElementById('btn-setup');

function showScreen(screen) {
  setupScreen.classList.remove('active');
  gameScreen.classList.remove('active');
  screen.classList.add('active');
}

function startGame() {
  const wordsText = inputWords.value.trim();
  const answerText = inputAnswer.value.trim();
  speedSetting = selectSpeed.value;

  if (wordsText) {
    const wordsArray = wordsText.split(' ').filter(w => w !== '');
    currentRounds = [{
      type: 'CUSTOM ROUND',
      w: wordsArray,
      a: answerText || wordsText
    }];
  } else {
    currentRounds = [...defaultRounds];
  }

  n = 0;
  showScreen(gameScreen);
  build();
}

function loadDefaultRounds() {
  currentRounds = [...defaultRounds];
  speedSetting = selectSpeed.value;
  n = 0;
  showScreen(gameScreen);
  build();
}

function build() {
  running = false;
  cancelAnimationFrame(raf);
  
  objs.forEach(o => o.el.remove());
  objs = [];
  
  ans.style.display = 'none';
  center.style.display = 'block';
  centerTitle.textContent = 'MAKE A SENTENCE!';
  centerSub.textContent = 'Watch the words. Stop them and make the sentence.';

  const r = currentRounds[n];
  label.textContent = `Round ${n + 1}/${currentRounds.length} · ${r.type}`;

  const speedMult = speedMultipliers[speedSetting] || 0.25;

  r.w.forEach(word => {
    const el = document.createElement('div');
    el.className = 'word';
    el.textContent = word;
    arena.appendChild(el);

    const maxX = Math.max(10, arena.clientWidth - el.offsetWidth - 20);
    const maxY = Math.max(10, arena.clientHeight - el.offsetHeight - 20);

    const x = 10 + Math.random() * maxX;
    const y = 10 + Math.random() * maxY;

    objs.push({
      el,
      x,
      y,
      vx: (Math.random() > 0.5 ? 1 : -1) * (speedMult + Math.random() * speedMult),
      vy: (Math.random() > 0.5 ? 1 : -1) * (speedMult + Math.random() * speedMult)
    });
  });

  objs.forEach(o => {
    o.el.style.left = o.x + 'px';
    o.el.style.top = o.y + 'px';
  });
}

function tick(t) {
  if (!running) return;

  const dt = Math.min(32, t - last || 16);
  last = t;

  const W = arena.clientWidth;
  const H = arena.clientHeight;

  objs.forEach(o => {
    o.x += o.vx * dt;
    o.y += o.vy * dt;

    const w = o.el.offsetWidth;
    const h = o.el.offsetHeight;

    if (o.x <= 0 || o.x + w >= W) {
      o.vx *= -1;
      o.x = Math.max(0, Math.min(W - w, o.x));
    }
    if (o.y <= 0 || o.y + h >= H) {
      o.vy *= -1;
      o.y = Math.max(0, Math.min(H - h, o.y));
    }

    o.el.style.left = o.x + 'px';
    o.el.style.top = o.y + 'px';
  });

  raf = requestAnimationFrame(tick);
}

function startStop() {
  if (running) {
    running = false;
    cancelAnimationFrame(raf);
    center.style.display = 'block';
    centerTitle.textContent = 'STOP!';
    centerSub.textContent = 'Now build the sentence!';
  } else {
    running = true;
    center.style.display = 'none';
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }
}

function answerShow() {
  running = false;
  cancelAnimationFrame(raf);
  center.style.display = 'none';
  ans.textContent = currentRounds[n].a;
  ans.style.display = 'block';
}

function next() {
  n = (n + 1) % currentRounds.length;
  build();
}

function goToSetup() {
  running = false;
  cancelAnimationFrame(raf);
  showScreen(setupScreen);
}

btnStartGame.addEventListener('click', startGame);
btnLoadDefault.addEventListener('click', loadDefaultRounds);

btnStart.addEventListener('click', startStop);
btnAnswer.addEventListener('click', answerShow);
btnNext.addEventListener('click', next);
btnSetup.addEventListener('click', goToSetup);

window.addEventListener('resize', () => {
  if (!running && gameScreen.classList.contains('active')) build();
});