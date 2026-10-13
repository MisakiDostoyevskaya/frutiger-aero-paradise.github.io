"use strict";

const songs = [
  {
    title: "D45K13 - fruit",
    file: "D45K13 - fruit  #FrutigerAero.mp4"
  },
  {
    title: "Endless Ocean 2007 - Character Select",
    file: "Endless Ocean 2007 - Character Select (Ayako Saso).mp4"
  },
  {
    title: "Suggest a question",
    file: "Everybody votes channel music - Suggest a question (one of the chillest wii song).mp4"
  },
  {
    title: "Nintendo eShop",
    file: "January 2015 - Nintendo eShop Music.mp4"
  },
  {
    title: "LEASE - Takeshi Abo",
    file: "LEASE by Takeshi Abo but slightly bitcrushed for nostalgia.mp4"
  },
  {
    title: "scizzie - aquatic ambience",
    file: "scizzie - aquatic ambience.mp4"
  },
  {
    title: "techno condominium flying event",
    file: "techno condominium flying event.mp4"
  }
];

// Lista actualizada con los nombres y extensiones exactas que tienes en la carpeta assets
const covers = [
  "assets/4.jpg.jpg",
  "assets/5.jpg.jpg",
  "assets/6.jpg.jpg",
  "assets/7.jpg.webp",
  "assets/8.jpg.webp",
  "assets/9.jpg.jfif",
  "assets/10.jpg.jfif"
];

const audioPlayer = document.getElementById("audio-player");
const musicCover = document.getElementById("music-cover");
const musicTitle = document.getElementById("music-title");
const musicStatus = document.getElementById("music-status");
const musicProgress = document.getElementById("music-progress");
const musicCurrentTime = document.getElementById("music-current-time");
const musicDuration = document.getElementById("music-duration");
const musicPlay = document.getElementById("music-play");
const musicPrev = document.getElementById("music-prev");
const musicNext = document.getElementById("music-next");
const musicVolume = document.getElementById("music-volume");
const musicList = document.getElementById("music-list");
const playlistCount = document.getElementById("playlist-count");
const musicContent = document.querySelector(".music-content");

let currentSongIndex = -1;
let lastCover = "";
let toastTimeout;

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("visible");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("visible");
  }, 2600);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function chooseCover() {
  if (!musicCover) return;
  
  if (covers.length === 0) {
    musicCover.removeAttribute("src");
    return;
  }

  let selectedCover = covers[Math.floor(Math.random() * covers.length)];

  if (covers.length > 1 && selectedCover === lastCover) {
    const alternatives = covers.filter(cover => cover !== lastCover);
    selectedCover = alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  lastCover = selectedCover;
  musicCover.src = selectedCover;
  // Asegurarnos de que se muestre si antes se ocultó por error
  musicCover.style.display = "block";
}

// Inicializar carátula al cargar
chooseCover();

function renderPlaylist() {
  musicList.replaceChildren();
  playlistCount.textContent = `${songs.length} TRACKS`;

  if (songs.length === 0) {
    const message = document.createElement("p");
    message.className = "empty-message";
    message.textContent = "Add songs to your playlist in script.js.";
    musicList.appendChild(message);
    return;
  }

  songs.forEach((song, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "track-item";
    button.dataset.songIndex = index;

    const number = document.createElement("span");
    number.className = "track-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const label = document.createElement("span");
    label.className = "track-item-label";
    label.textContent = song.title;

    const state = document.createElement("span");
    state.className = "track-item-state";
    state.textContent = "♫";

    button.append(number, label, state);

    button.addEventListener("click", () => {
      loadSong(index, true);
    });

    musicList.appendChild(button);
  });

  updatePlaylistSelection();
}

function updatePlaylistSelection() {
  document.querySelectorAll(".track-item").forEach((item, index) => {
    const isCurrent = index === currentSongIndex;

    item.classList.toggle("current-track", isCurrent);

    const state = item.querySelector(".track-item-state");

    if (state) {
      state.textContent = isCurrent ? "♫" : "›";
    }
  });
}

function loadSong(index, autoplay = false) {
  if (songs.length === 0) {
    showToast("Your playlist is empty.");
    return;
  }

  if (index < 0 || index >= songs.length) {
    return;
  }

  const song = songs[index];
  currentSongIndex = index;

  audioPlayer.src = `music/${encodeURIComponent(song.file)}`;
  audioPlayer.load();

  musicTitle.textContent = song.title;
  musicStatus.textContent = "Ready to play";
  musicProgress.value = 0;
  musicCurrentTime.textContent = "0:00";
  musicDuration.textContent = "0:00";
  musicPlay.textContent = "▶";

  chooseCover();
  updatePlaylistSelection();

  if (autoplay) {
    playSong();
  }
}

async function playSong() {
  if (songs.length === 0) {
    showToast("Add songs to your playlist first.");
    return;
  }

  if (currentSongIndex === -1) {
    loadSong(0, false);
  }

  try {
    await audioPlayer.play();
    musicPlay.textContent = "Ⅱ";
    musicStatus.textContent = "Now playing";
    musicContent.classList.add("playing");
  } catch (error) {
    musicStatus.textContent = "Playback unavailable";
    musicContent.classList.remove("playing");

    showToast("Couldn't play this file. Check its name and audio format.");
  }
}

function pauseSong() {
  audioPlayer.pause();
  musicPlay.textContent = "▶";
  musicStatus.textContent = "Paused";
  musicContent.classList.remove("playing");
}

function togglePlayback() {
  if (audioPlayer.paused) {
    playSong();
  } else {
    pauseSong();
  }
}

function nextSong() {
  if (songs.length === 0) return;

  const nextIndex =
    currentSongIndex < 0
      ? 0
      : (currentSongIndex + 1) % songs.length;

  loadSong(nextIndex, true);
}

function previousSong() {
  if (songs.length === 0) return;

  if (audioPlayer.currentTime > 3) {
    audioPlayer.currentTime = 0;
    return;
  }

  const previousIndex =
    currentSongIndex < 0
      ? 0
      : (currentSongIndex - 1 + songs.length) % songs.length;

  loadSong(previousIndex, true);
}

musicPlay.addEventListener("click", togglePlayback);
musicNext.addEventListener("click", nextSong);
musicPrev.addEventListener("click", previousSong);

audioPlayer.addEventListener("timeupdate", () => {
  if (!Number.isFinite(audioPlayer.duration) || audioPlayer.duration <= 0) {
    musicProgress.value = 0;
    musicCurrentTime.textContent = formatTime(audioPlayer.currentTime);
    return;
  }

  musicProgress.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  musicCurrentTime.textContent = formatTime(audioPlayer.currentTime);
});

audioPlayer.addEventListener("loadedmetadata", () => {
  musicDuration.textContent = formatTime(audioPlayer.duration);
});

musicProgress.addEventListener("input", () => {
  if (Number.isFinite(audioPlayer.duration) && audioPlayer.duration > 0) {
    audioPlayer.currentTime =
      (Number(musicProgress.value) / 100) * audioPlayer.duration;
  }
});

musicVolume.addEventListener("input", () => {
  audioPlayer.volume = Number(musicVolume.value);
});

audioPlayer.volume = Number(musicVolume.value);

audioPlayer.addEventListener("play", () => {
  musicPlay.textContent = "Ⅱ";
  musicStatus.textContent = "Now playing";
  musicContent.classList.add("playing");
});

audioPlayer.addEventListener("pause", () => {
  musicPlay.textContent = "▶";
  musicContent.classList.remove("playing");
});

audioPlayer.addEventListener("ended", nextSong);

audioPlayer.addEventListener("error", () => {
  if (!audioPlayer.currentSrc || !audioPlayer.error) return;

  musicStatus.textContent = "File unavailable";
  musicContent.classList.remove("playing");

  showToast("Audio error. Check the filename in your music folder.");
});

const windows = [...document.querySelectorAll("[data-window]")];
const taskbarApps = document.getElementById("taskbar-apps");

let highestZIndex = 20;

function getWindowTitle(windowElement) {
  const title = windowElement.querySelector(".window-title");
  return title ? title.textContent.trim() : "Application";
}

function updateTaskbar() {
  taskbarApps.replaceChildren();

  windows.forEach(windowElement => {
    if (!windowElement.classList.contains("open")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "taskbar-app";
    button.textContent = getWindowTitle(windowElement);
    button.title = getWindowTitle(windowElement);

    if (windowElement.classList.contains("active-window")) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      if (windowElement.classList.contains("minimized")) {
        windowElement.classList.remove("minimized");
        windowElement.classList.add("open");
      }

      focusWindow(windowElement);
    });

    taskbarApps.appendChild(button);
  });
}

function focusWindow(windowElement) {
  windows.forEach(item => {
    item.classList.remove("active-window");
  });

  windowElement.classList.add("active-window");
  windowElement.style.zIndex = String(++highestZIndex);

  updateTaskbar();
}

function openWindow(id) {
  const windowElement = document.getElementById(id);

  if (!windowElement) return;

  windowElement.classList.remove("minimized");
  windowElement.classList.add("open");

  focusWindow(windowElement);
}

function closeWindow(windowElement) {
  windowElement.classList.remove("open", "minimized", "active-window");
  updateTaskbar();
}

function minimizeWindow(windowElement) {
  windowElement.classList.remove("open", "active-window");
  windowElement.classList.add("minimized");
  updateTaskbar();
}

document.querySelectorAll("[data-open]").forEach(button => {
  button.addEventListener("click", () => {
    openWindow(button.dataset.open);
  });
});

windows.forEach(windowElement => {
  windowElement.addEventListener("pointerdown", () => {
    if (windowElement.classList.contains("open")) {
      focusWindow(windowElement);
    }
  });

  windowElement.querySelector("[data-close]").addEventListener("click", event => {
    event.stopPropagation();
    closeWindow(windowElement);
  });

  windowElement.querySelector("[data-minimize]").addEventListener("click", event => {
    event.stopPropagation();
    minimizeWindow(windowElement);
  });
});

windows.forEach(windowElement => {
  const handle = windowElement.querySelector("[data-drag-handle]");

  let dragging = false;
  let pointerOffsetX = 0;
  let pointerOffsetY = 0;

  handle.addEventListener("pointerdown", event => {
    if (event.target.closest("button")) return;
    if (event.button !== 0 && event.pointerType === "mouse") return;

    dragging = true;
    focusWindow(windowElement);

    const rect = windowElement.getBoundingClientRect();

    pointerOffsetX = event.clientX - rect.left;
    pointerOffsetY = event.clientY - rect.top;

    windowElement.style.transform = "none";
    windowElement.style.left = `${rect.left}px`;
    windowElement.style.top = `${rect.top}px`;

    windowElement.classList.add("dragging");

    handle.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  handle.addEventListener("pointermove", event => {
    if (!dragging) return;

    const maxLeft = Math.max(0, window.innerWidth - windowElement.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - windowElement.offsetHeight);

    const nextLeft = Math.min(maxLeft, Math.max(0, event.clientX - pointerOffsetX));
    const nextTop = Math.min(maxTop, Math.max(0, event.clientY - pointerOffsetY));

    windowElement.style.left = `${nextLeft}px`;
    windowElement.style.top = `${nextTop}px`;
  });

  function stopDragging() {
    dragging = false;
    windowElement.classList.remove("dragging");
  }

  handle.addEventListener("pointerup", stopDragging);
  handle.addEventListener("pointercancel", stopDragging);
});

const notesArea = document.getElementById("notes-area");

document.getElementById("clear-notes").addEventListener("click", () => {
  notesArea.value = "";
  showToast("Notes cleared.");
});

function updateClock() {
  const now = new Date();

  const time = now.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const shortTime = now.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const date = now.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  document.getElementById("large-clock").textContent = time;
  document.getElementById("top-clock").textContent = shortTime;
  document.getElementById("taskbar-clock").textContent = shortTime;
  document.getElementById("clock-date").textContent =
    date.charAt(0).toUpperCase() + date.slice(1);
}

let audioContext = null;
let noiseSource = null;
let noiseFilter = null;
let noiseGain = null;
let currentSound = null;

const ambienceVolume = document.getElementById("ambience-volume");
const soundButtons = [...document.querySelectorAll("[data-sound]")];

function stopAmbience() {
  if (noiseGain && audioContext) {
    const gain = noiseGain;
    noiseGain = null;

    try {
      gain.gain.setTargetAtTime(0, audioContext.currentTime, 0.08);
      noiseSource.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      noiseSource = null;
    }
  }

  noiseSource = null;
  noiseFilter = null;
  currentSound = null;

  soundButtons.forEach(button => {
    button.classList.remove("is-playing");
    button.querySelector(".sound-state").textContent = "PLAY";
  });
}

async function startAmbience(type) {
  if (currentSound === type) {
    stopAmbience();
    return;
  }

  stopAmbience();

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      showToast("Your browser does not support ambient audio.");
      return;
    }

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    await audioContext.resume();

    const bufferSize = audioContext.sampleRate * 3;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      channel[i] = Math.random() * 2 - 1;
    }

    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();

    source.buffer = buffer;
    source.loop = true;

    filter.type = "lowpass";

    if (type === "rain") {
      filter.frequency.value = 1100;
      filter.Q.value = 0.5;
    } else {
      filter.frequency.value = 400;
      filter.Q.value = 0.7;
    }

    gain.gain.value = 0;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    source.start();

    gain.gain.setTargetAtTime(
      Number(ambienceVolume.value),
      audioContext.currentTime,
      0.15
    );

    noiseSource = source;
    noiseFilter = filter;
    noiseGain = gain;
    currentSound = type;

    soundButtons.forEach(button => {
      const isPlaying = button.dataset.sound === type;

      button.classList.toggle("is-playing", isPlaying);
      button.querySelector(".sound-state").textContent = isPlaying ? "PLAYING" : "PLAY";
    });

    showToast(type === "rain" ? "Gentle rain activated." : "Ocean ambience activated.");
  } catch (error) {
    showToast("Couldn't start ambient audio in this browser.");
  }
}

soundButtons.forEach(button => {
  button.addEventListener("click", () => {
    startAmbience(button.dataset.sound);
  });
});

ambienceVolume.addEventListener("input", () => {
  if (noiseGain && audioContext) {
    noiseGain.gain.setTargetAtTime(
      Number(ambienceVolume.value),
      audioContext.currentTime,
      0.08
    );
  }
});

document.getElementById("start-button").addEventListener("click", () => {
  const musicWindow = document.getElementById("music-window");

  if (musicWindow.classList.contains("open")) {
    openWindow("clock-window");
  } else {
    openWindow("music-window");
  }

  showToast("Welcome back to Paradise.");
});

renderPlaylist();
updateClock();
setInterval(updateClock, 1000);