
const passages = [
  "Typing speed improves when you focus on accuracy first and rhythm second. Keep your eyes forward, relax your hands, and let each word flow into the next.",
  "A fast typist is not just someone who moves quickly. A fast typist stays calm, reads ahead, avoids panic, and keeps a steady pace through every sentence.",
  "Practice builds confidence. Start with clean accuracy, then slowly increase your speed until your fingers learn the path across the keyboard naturally.",
  "The best typing scores come from smooth movement, careful attention, and steady breathing. Do not chase every letter. Let the words become a rhythm.",
  "Every great score begins with a simple test. Type the passage, watch your accuracy, and try again until your speed begins to climb."
];
let duration = 60, timeLeft = 60, timer = null, started = false, currentPassage = passages[0];
const $ = (id)=>document.getElementById(id);
function choosePassage(){ currentPassage = passages[Math.floor(Math.random()*passages.length)]; }
function renderText(input=''){
 const box=$('testText'); if(!box) return;
 box.innerHTML='';
 for(let i=0;i<currentPassage.length;i++){
  const s=document.createElement('span'); s.textContent=currentPassage[i];
  if(i<input.length){ s.className=input[i]===currentPassage[i]?'correct':'incorrect'; }
  else if(i===input.length){ s.className='current'; }
  box.appendChild(s);
 }
}
function calc(){
 const input=$('typingInput').value;
 let correct=0; for(let i=0;i<input.length;i++){ if(input[i]===currentPassage[i]) correct++; }
 const elapsed=Math.max(1,duration-timeLeft);
 const wpm=Math.round((correct/5)/(elapsed/60));
 const acc=input.length?Math.round((correct/input.length)*100):100;
 $('wpm').textContent=wpm; $('accuracy').textContent=acc+'%'; $('chars').textContent=input.length; $('errors').textContent=Math.max(0,input.length-correct);
}
function startTimer(){
 if(started) return; started=true;
 timer=setInterval(()=>{ timeLeft--; $('timeLeft').textContent=timeLeft; calc(); if(timeLeft<=0) endTest(); },1000);
}
function endTest(){ clearInterval(timer); timer=null; $('typingInput').disabled=true; $('resultNote').textContent='Test complete. Hit Restart to try for a better score.'; calc(); }
function resetTest(){ clearInterval(timer); timer=null; started=false; timeLeft=duration; choosePassage(); if($('typingInput')){ $('typingInput').value=''; $('typingInput').disabled=false; $('typingInput').focus(); } ['wpm','chars','errors'].forEach(id=>$(id).textContent='0'); $('accuracy').textContent='100%'; $('timeLeft').textContent=timeLeft; $('resultNote').textContent='Start typing when ready.'; renderText(''); }
function setDuration(sec){ duration=sec; document.querySelectorAll('.timer-btn').forEach(b=>b.classList.toggle('active',Number(b.dataset.seconds)===sec)); resetTest(); }
window.addEventListener('DOMContentLoaded',()=>{
 if(!$('typingInput')) return; choosePassage(); renderText(''); $('timeLeft').textContent=duration;
 document.querySelectorAll('.timer-btn').forEach(b=>b.addEventListener('click',()=>setDuration(Number(b.dataset.seconds))));
 $('typingInput').addEventListener('input',()=>{ startTimer(); renderText($('typingInput').value); calc(); if($('typingInput').value.length>=currentPassage.length) endTest(); });
 $('restartBtn').addEventListener('click',resetTest);
});
