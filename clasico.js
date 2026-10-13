const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const toast = $('#toast');
let toastTimer;
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2400)}
const windows = $$('.window');
function openWindow(name){const win=$(`[data-window="${name}"]`);if(!win)return;win.classList.remove('closed','minimized');win.style.zIndex=++zIndex;$$('.dock-item').forEach(b=>b.classList.toggle('active',b.dataset.open===name));}
let zIndex=10;
$$('[data-open]').forEach(button=>button.addEventListener('click',()=>openWindow(button.dataset.open)));
$$('.win-close').forEach(b=>b.addEventListener('click',()=>b.closest('.window').classList.add('closed')));
$$('.win-min').forEach(b=>b.addEventListener('click',()=>b.closest('.window').classList.add('minimized')));
$('#minimize-all').addEventListener('click',()=>windows.forEach(w=>w.classList.add('minimized')));
$('#start-button').addEventListener('click',()=>{const hidden=windows.some(w=>w.classList.contains('minimized')||w.classList.contains('closed'));if(hidden){windows.forEach(w=>w.classList.remove('minimized','closed'));notify('Bienvenida de vuelta')}else{openWindow('welcome')}});
$('#toggle-fullscreen').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch{notify('El navegador no permitió pantalla completa.')}});
$$('.window').forEach(win=>{win.addEventListener('pointerdown',()=>win.style.zIndex=++zIndex);const bar=$('.titlebar',win);if(!bar)return;let sx,sy,ox,oy,drag=false;bar.addEventListener('pointerdown',e=>{if(e.target.closest('button')||matchMedia('(max-width:650px)').matches)return;drag=true;bar.setPointerCapture(e.pointerId);const r=win.getBoundingClientRect();sx=e.clientX;sy=e.clientY;ox=r.left;oy=r.top;win.style.left=`${r.left}px`;win.style.top=`${r.top}px`;win.style.right='auto';win.style.bottom='auto';win.classList.add('dragging')});bar.addEventListener('pointermove',e=>{if(!drag)return;win.style.left=`${Math.max(0,Math.min(innerWidth-win.offsetWidth,ox+e.clientX-sx))}px`;win.style.top=`${Math.max(0,Math.min(innerHeight-win.offsetHeight-60,oy+e.clientY-sy))}px`});const stop=()=>{drag=false;win.classList.remove('dragging')};bar.addEventListener('pointerup',stop);bar.addEventListener('pointercancel',stop)});
$$('[data-scene]').filter(el=>el.classList.contains('scene-card')).forEach(b=>b.addEventListener('click',()=>{document.body.dataset.scene=b.dataset.scene;$$('.scene-card').forEach(c=>c.classList.toggle('selected',c===b));notify(`Ambiente cambiado: ${b.textContent.trim()}`)}));
const bubbleLayer=$('#bubble-layer');let bubbleTimer;
function makeBubble(){if($('#toggle-bubbles')?.checked===false)return;const b=document.createElement('span');b.className='bubble';const size=12+Math.random()*38;b.style.width=`${size}px`;b.style.height=`${size}px`;b.style.left=`${Math.random()*100}vw`;b.style.animationDuration=`${8+Math.random()*13}s`;bubbleLayer.appendChild(b);setTimeout(()=>b.remove(),22000)}
function startBubbles(){clearInterval(bubbleTimer);bubbleTimer=setInterval(makeBubble,650)}startBubbles();
$('#toggle-bubbles').addEventListener('change',e=>{bubbleLayer.style.display=e.target.checked?'block':'none';if(e.target.checked)startBubbles();else clearInterval(bubbleTimer)});
const cursorGlow=$('#cursor-glow');document.addEventListener('pointermove',e=>{cursorGlow.style.left=e.clientX+'px';cursorGlow.style.top=e.clientY+'px'});
$('#toggle-cursor').addEventListener('change',e=>cursorGlow.style.display=e.target.checked?'block':'none');
$('#toggle-motion').addEventListener('change',e=>document.body.classList.toggle('reduce-motion',!e.target.checked));
function updateClock(){const now=new Date();$('#clock').textContent=now.toLocaleTimeString('es-AR',{hour12:false});$('#tray-clock').textContent=now.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});$('#date').textContent=now.toLocaleDateString('es-AR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});}
updateClock();setInterval(updateClock,1000);
const notes=$('#notes-text');try{notes.value=localStorage.getItem('frutiger-notes-v2')??''}catch{}
let notesTimer;notes.addEventListener('input',()=>{clearTimeout(notesTimer);$('#save-status').textContent='Guardando…';notesTimer=setTimeout(()=>{try{localStorage.setItem('frutiger-notes-v2',notes.value);$('#save-status').textContent='Guardado en este navegador'}catch{$('#save-status').textContent='No se pudo guardar localmente.'}},250)});
$('#clear-notes').addEventListener('click',()=>{notes.value='';notes.dispatchEvent(new Event('input'));notify('Nota limpiada.')});

// A small ambient synthesizer built with Web Audio API. No audio file or external music is required.
let audioCtx=null, master=null, drones=[], lfo=null, playing=false, toneIndex=0;
const chordSets=[[130.81,164.81,196,261.63],[110,146.83,174.61,220],[146.83,185,220,293.66],[123.47,155.56,185,246.94]];
function startAudio(){const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext){notify('Este navegador no admite Web Audio.');return}if(!audioCtx){audioCtx=new AudioContext();master=audioCtx.createGain();master.gain.value=Number($('#volume').value)/100*.18;master.connect(audioCtx.destination);const filter=audioCtx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=900;filter.connect(master);master.disconnect();master.connect(filter);filter.connect(audioCtx.destination);const frequencies=chordSets[toneIndex];frequencies.forEach((f,i)=>{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type=i===0?'sine':'triangle';osc.frequency.value=f;gain.gain.value=i===0?.23:.075;osc.connect(gain);gain.connect(master);osc.start();drones.push({osc,gain})});const lfoOsc=audioCtx.createOscillator(),lfoGain=audioCtx.createGain();lfoOsc.frequency.value=.12;lfoGain.gain.value=250;lfoOsc.connect(lfoGain);lfoGain.connect(filter.frequency);lfoOsc.start();lfo={osc:lfoOsc,gain:lfoGain,filter}}audioCtx.resume();playing=true;$('#play-music').textContent='Ⅱ';$('#equalizer').classList.add('playing');$('#music-status').textContent='Reproduciendo sonido ambiental generado';$('#toggle-audio').checked=true}
function stopAudio(){playing=false;if(audioCtx)audioCtx.suspend();$('#play-music').textContent='▶';$('#equalizer').classList.remove('playing');$('#music-status').textContent='Pausado. El océano puede esperar.';$('#toggle-audio').checked=false}
function changeChord(){toneIndex=(toneIndex+1)%chordSets.length;if(audioCtx){chordSets[toneIndex].forEach((f,i)=>{if(drones[i])drones[i].osc.frequency.setTargetAtTime(f,audioCtx.currentTime,.7)})}$('#track-name').textContent=['Ocean of Glass','Blue Horizon','Digital Garden','Clouds in the Sea'][toneIndex];if(playing)notify('Nuevo paisaje sonoro')}
$('#play-music').addEventListener('click',()=>playing?stopAudio():startAudio());
$('#toggle-audio').addEventListener('change',e=>e.target.checked?startAudio():stopAudio());
$('#volume').addEventListener('input',e=>{if(master&&audioCtx)master.gain.setTargetAtTime(Number(e.target.value)/100*.18,audioCtx.currentTime,.05)});
$('#next-track').addEventListener('click',changeChord);$('#prev-track').addEventListener('click',changeChord);
$('#aquarium').addEventListener('pointermove',e=>{if(!$('#toggle-motion').checked)return;const rect=e.currentTarget.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width;$$('.fish').forEach((fish,i)=>fish.style.transform=`translateX(${(x-.5)*45*(i%2?1:-1)}px)`);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.fullscreenElement)document.exitFullscreen()});
