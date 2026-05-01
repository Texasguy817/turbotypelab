
const passages = [
  "Typing speed improves when you focus on accuracy first and rhythm second. Keep your eyes forward, relax your hands, and let each word flow into the next.",
  "A fast typist is not just someone who moves quickly. A fast typist stays calm, reads ahead, avoids panic, and keeps a steady pace through every sentence.",
  "Practice builds confidence. Start with clean accuracy, then slowly increase your speed until your fingers learn the path across the keyboard naturally.",
  "The best typing scores come from smooth movement, careful attention, and steady breathing. Do not chase every letter. Let the words become a rhythm.",
  "Every great score begins with a simple test. Type the passage, watch your accuracy, and try again until your speed begins to climb.",
  "Good typing is quiet, steady, and focused. The goal is not frantic movement, but smooth control from the first word to the final period.",
  "A daily typing habit can improve speed faster than occasional long practice sessions. Short focused tests build rhythm, accuracy, and confidence."
];

const storageKeys = {
  bestWpm: 'ttl_best_wpm',
  bestAccuracy: 'ttl_best_accuracy',
  bestDate: 'ttl_best_date',
  lastWpm: 'ttl_last_wpm',
  lastAccuracy: 'ttl_last_accuracy',
  lastErrors: 'ttl_last_errors',
  lastChars: 'ttl_last_chars'
};

let duration = 60;
let timeLeft = 60;
let timer = null;
let started = false;
let currentPassage = passages[0];
let finalScore = null;

const $ = (id) => document.getElementById(id);

function choosePassage() {
  currentPassage = passages[Math.floor(Math.random() * passages.length)];
}

function renderText(input = '') {
  const box = $('testText');
  if (!box) return;
  box.innerHTML = '';
  for (let i = 0; i < currentPassage.length; i++) {
    const s = document.createElement('span');
    s.textContent = currentPassage[i];
    if (i < input.length) {
      s.className = input[i] === currentPassage[i] ? 'correct' : 'incorrect';
    } else if (i === input.length) {
      s.className = 'current';
    }
    box.appendChild(s);
  }
}

function calculateScore() {
  const input = $('typingInput') ? $('typingInput').value : '';
  let correct = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === currentPassage[i]) correct++;
  }
  const elapsed = Math.max(1, duration - timeLeft);
  const wpm = Math.round((correct / 5) / (elapsed / 60));
  const accuracy = input.length ? Math.round((correct / input.length) * 100) : 100;
  const chars = input.length;
  const errors = Math.max(0, input.length - correct);
  return { wpm, accuracy, chars, errors };
}

function updateStats() {
  const score = calculateScore();
  if ($('wpm')) $('wpm').textContent = score.wpm;
  if ($('accuracy')) $('accuracy').textContent = score.accuracy + '%';
  if ($('chars')) $('chars').textContent = score.chars;
  if ($('errors')) $('errors').textContent = score.errors;
  return score;
}

function renderSavedScores() {
  const best = Number(localStorage.getItem(storageKeys.bestWpm) || 0);
  const bestAcc = localStorage.getItem(storageKeys.bestAccuracy) || '—';
  const bestDate = localStorage.getItem(storageKeys.bestDate) || 'No score yet';
  const last = localStorage.getItem(storageKeys.lastWpm) || '—';
  const lastAcc = localStorage.getItem(storageKeys.lastAccuracy) || '—';
  const lastErrors = localStorage.getItem(storageKeys.lastErrors) || '—';
  const lastChars = localStorage.getItem(storageKeys.lastChars) || '—';

  if ($('bestWpm')) $('bestWpm').textContent = best || '—';
  if ($('bestAccuracy')) $('bestAccuracy').textContent = best ? `${bestAcc}% accuracy` : 'No best yet';
  if ($('bestDate')) $('bestDate').textContent = bestDate;
  if ($('lastScore')) $('lastScore').textContent = last === '—' ? 'No recent score yet.' : `${last} WPM • ${lastAcc}% accuracy • ${lastErrors} errors • ${lastChars} chars`;
}

function saveScore(score) {
  finalScore = score;
  localStorage.setItem(storageKeys.lastWpm, score.wpm);
  localStorage.setItem(storageKeys.lastAccuracy, score.accuracy);
  localStorage.setItem(storageKeys.lastErrors, score.errors);
  localStorage.setItem(storageKeys.lastChars, score.chars);

  const best = Number(localStorage.getItem(storageKeys.bestWpm) || 0);
  if (score.wpm > best || (score.wpm === best && score.accuracy > Number(localStorage.getItem(storageKeys.bestAccuracy) || 0))) {
    localStorage.setItem(storageKeys.bestWpm, score.wpm);
    localStorage.setItem(storageKeys.bestAccuracy, score.accuracy);
    localStorage.setItem(storageKeys.bestDate, new Date().toLocaleDateString());
    if ($('resultNote')) $('resultNote').textContent = 'New personal best! Hit Restart and try to beat it again.';
  } else if ($('resultNote')) {
    $('resultNote').textContent = 'Test complete. Hit Restart to try for a better score.';
  }
  renderSavedScores();
}

function startTimer() {
  if (started) return;
  started = true;
  if ($('resultNote')) $('resultNote').textContent = 'Test running. Keep a steady rhythm.';
  timer = setInterval(() => {
    timeLeft--;
    if ($('timeLeft')) $('timeLeft').textContent = timeLeft;
    updateStats();
    if (timeLeft <= 0) endTest();
  }, 1000);
}

function endTest() {
  if (timer) clearInterval(timer);
  timer = null;
  if ($('typingInput')) $('typingInput').disabled = true;
  const score = updateStats();
  saveScore(score);
}

function resetTest() {
  if (timer) clearInterval(timer);
  timer = null;
  started = false;
  finalScore = null;
  timeLeft = duration;
  choosePassage();
  if ($('typingInput')) {
    $('typingInput').value = '';
    $('typingInput').disabled = false;
    $('typingInput').focus();
  }
  ['wpm', 'chars', 'errors'].forEach(id => { if ($(id)) $(id).textContent = '0'; });
  if ($('accuracy')) $('accuracy').textContent = '100%';
  if ($('timeLeft')) $('timeLeft').textContent = timeLeft;
  if ($('resultNote')) $('resultNote').textContent = 'Start typing when ready.';
  renderText('');
  renderSavedScores();
}

function setDuration(sec) {
  duration = sec;
  document.querySelectorAll('.timer-btn').forEach(b => b.classList.toggle('active', Number(b.dataset.seconds) === sec));
  resetTest();
}

async function shareScore() {
  const score = finalScore || calculateScore();
  const text = `I scored ${score.wpm} WPM with ${score.accuracy}% accuracy on TurboTypeLab. Try to beat me: https://turbotypelab.com`;
  try {
    if (navigator.share) {
      await navigator.share({ title: 'TurboTypeLab score', text, url: 'https://turbotypelab.com' });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      if ($('resultNote')) $('resultNote').textContent = 'Score copied. Paste it anywhere to share.';
    }
  } catch (e) {
    if ($('resultNote')) $('resultNote').textContent = 'Sharing was canceled.';
  }
}

function resetBest() {
  Object.values(storageKeys).forEach(key => localStorage.removeItem(key));
  renderSavedScores();
  if ($('resultNote')) $('resultNote').textContent = 'Saved scores cleared.';
}

window.addEventListener('DOMContentLoaded', () => {
  if (!$('typingInput')) return;
  choosePassage();
  renderText('');
  renderSavedScores();
  if ($('timeLeft')) $('timeLeft').textContent = duration;
  document.querySelectorAll('.timer-btn').forEach(b => b.addEventListener('click', () => setDuration(Number(b.dataset.seconds))));
  $('typingInput').addEventListener('input', () => {
    startTimer();
    renderText($('typingInput').value);
    updateStats();
    if ($('typingInput').value.length >= currentPassage.length) endTest();
  });
  if ($('restartBtn')) $('restartBtn').addEventListener('click', resetTest);
  if ($('shareBtn')) $('shareBtn').addEventListener('click', shareScore);
  if ($('clearBestBtn')) $('clearBestBtn').addEventListener('click', resetBest);
});
