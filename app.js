const story = {
  herName: "宝贝",
  fromName: "我",
  heroKicker: "Happy Birthday",
  heroTitle: "生日快乐，我最想见的人",
  heroText: "我把想你放进照片里，把没能当面说的话放进这封信里。你打开的时候，就像我在认真陪你过这个生日。",
  musicPath: "assets/song.mp3",
  photoCount: 24,
  stageInitials: "WXY",
  stagePoems: [
    ["纵使东风把繁花吹散", "终会将我们吹回同一个温润原点"],
    ["命运交错日里遇见你", "从此每一次想念都有了方向"],
    ["所有的偶然", "都是命中注定的必然"],
    ["直到你降临", "我才明白生日也可以这样被认真期待"]
  ],
  envelopeText: "这封信，等你亲手拆开。",
  letterTitle: "写给你的生日信",
  letter: [
    "亲爱的，生日快乐。",
    "今年没能陪在你身边，我其实有一点遗憾。因为我很想亲眼看见你收到祝福时的表情，也很想在零点的时候第一个对你说生日快乐。",
    "可我又觉得，距离也许刚好让我把这些话写得更认真一点。不是随口的一句想你，也不是匆忙的一句祝福，而是一封可以被你反复打开的信。",
    "我喜欢你身上那些很具体的地方：你认真说话的样子，你偶尔的小脾气，你开心时藏不住的语气，还有你让我觉得生活变柔软的那些瞬间。",
    "新的一岁，我希望你被很多很多爱包围。希望你少一点委屈，多一点确定；少一点疲惫，多一点被照顾；也希望我可以更好地出现在你的生活里。",
    "等我们见面的时候，我会把今天没能给你的拥抱补上。生日快乐，我的女孩。"
  ],
  photos: [
    {
      image: "assets/photos/photo-1.jpg",
      title: "第一张想放在这里的照片",
      caption: "这里写这张照片背后的那一天，越具体越好，比如当时在哪里、你为什么一直记得。"
    },
    {
      image: "assets/photos/photo-2.jpg",
      title: "一起走过的某一天",
      caption: "可以放合照、风景、聊天截图、车票，重点是让她知道你真的记得这些小事。"
    },
    {
      image: "assets/photos/photo-3.jpg",
      title: "我很想你的时候",
      caption: "这张适合放她最好看的照片，或者你最想她的时候反复看的那一张。"
    },
    {
      image: "assets/photos/photo-4.jpg",
      title: "下次见面之前",
      caption: "可以放你所在城市的夜晚、准备的礼物，或者你想带她去的地方。"
    },
    {
      image: "assets/photos/photo-5.jpg",
      title: "我喜欢你的一个瞬间",
      caption: "把一句夸她的话写得具体一点，比模板化的情话更容易打动她。"
    },
    {
      image: "assets/photos/photo-6.jpg",
      title: "我们还会有很多以后",
      caption: "这里可以写一个你们约好但还没有完成的计划。"
    },
    {
      image: "assets/photos/photo-7.jpg",
      title: "今天想把祝福给你",
      caption: "生日当天最重要的一句话，可以放在这张照片里。"
    },
    {
      image: "assets/photos/photo-8.jpg",
      title: "最后一张留给拥抱",
      caption: "等见面的时候，把这段时间缺席的拥抱都补回来。"
    }
  ]
};

const $ = (selector) => document.querySelector(selector);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let currentPhoto = 0;
let shuffledPhotos = [...story.photos];
let letterStarted = false;
let layoutIndex = 0;
let audio;
let audioContext;
let synthTimer;
let musicOn = false;
let orbitOffset = 0;
let orbitVelocity = 0.0024;
let queueOffset = 0;
let queueVelocity = 0.009;
let albumDragging = false;
let dragLastX = 0;
let dragLastAt = 0;
let dragDistance = 0;
let suppressPhotoClick = false;
let lastManualLayoutAt = 0;
let poemTimer;
let hoverMotionUntil = 0;
let hoverFlowActive = false;
let lastHoverLockAt = 0;
let cinematicTime = 0;
let morphTimer;
let stageMotion = 0;
let stagePointerX = 0;
let stagePointerY = 0;
let albumIntroStart = 0;
let albumIntroProgress = 1;
let albumIntroPlayed = false;
let smoothedQueueVelocity = 0;
let photoRevealTimer;
let lastInteractionAt = 0;
let lastAutoMorphAt = 0;
let lastAlbumTickAt = 0;
let lastLayoutApplyAt = 0;
let lastPointerPhotoOpenAt = 0;
let lastPointerPhotoOpenTile = null;
let cachedPhotoTiles = [];
let hoveredPhotoTile = null;
let albumSceneBlend = 0;
let albumSceneMode = 0;
let albumSweepX = 50;
let albumSweepY = 50;
let albumSweepIntensity = 0;
let photoSpotlightIndex = -1;
let photoSpotlightStrength = 0;
let photoSpotlightPhase = 0;

const layouts = [
  { name: "Valley Arrival", label: "队形：命运交错" },
  { name: "Orbit Bloom", label: "队形：圆环循环" },
  { name: "Flower Cluster", label: "队形：花束聚合" },
  { name: "Starlit Scatter", label: "队形：星夜散落" }
];

function init() {
  story.photos = buildPhotoList();
  shuffledPhotos = [...story.photos];
  $("#heroKicker").textContent = story.heroKicker;
  $("#heroTitle").textContent = story.heroTitle;
  $("#heroText").textContent = story.heroText;
  $("#stageInitials").textContent = story.stageInitials;
  $("#envelopeText").textContent = story.envelopeText;
  $("#letterTitle").textContent = story.letterTitle;
  renderPhotos();
  setupPhotoStageInteraction();
  setupActions();
  setupEffects();
  setupAlbumLoop();
  if (!routeFromHash(false)) showView("home", { updateHash: false });
  revealStagePoem();
}

function routeFromHash(updateHash = true) {
  const viewId = window.location.hash.slice(1) || "home";
  if (!["home", "photoWall", "letter"].includes(viewId)) return false;
  showView(viewId, { resetLetter: viewId === "letter", updateHash });
  return true;
}

function setupActions() {
  document.querySelectorAll("[data-view]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      showView(trigger.dataset.view, { resetLetter: trigger.dataset.view === "letter" });
    });
  });

  $("#cycleLayout").addEventListener("click", advanceLayout);

  $("#openFirstPhoto").addEventListener("click", () => openPhoto(0));
  $("#closeLightbox").addEventListener("click", closePhoto);
  $("#prevPhoto").addEventListener("click", () => movePhoto(-1));
  $("#nextPhoto").addEventListener("click", () => movePhoto(1));
  $("#viewFullPhoto").addEventListener("click", showFullPhoto);
  $(".lightbox-image-wrap").setAttribute("tabindex", "0");
  $(".lightbox-image-wrap").setAttribute("role", "button");
  $(".lightbox-image-wrap").setAttribute("aria-label", "打开完整照片");
  $(".lightbox-image-wrap").addEventListener("click", showFullPhoto);
  $(".lightbox-image-wrap").addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showFullPhoto();
    }
  });
  $("#lightboxImage").addEventListener("click", showFullPhoto);
  $("#photoLightbox").addEventListener("click", (event) => {
    if (event.target.id === "photoLightbox") closePhoto();
  });

  $("#openLetter").addEventListener("click", openLetter);
  $("#jumpLetter").addEventListener("click", () => {
    showView("letter", { resetLetter: true });
  });
  $("#replayLetter").addEventListener("click", () => {
    letterStarted = false;
    $("#letterBody").innerHTML = "";
    openLetter();
  });

  $("#musicToggle").addEventListener("click", async () => {
    if (musicOn) stopMusic();
    else await startMusic();
  });

  window.addEventListener("hashchange", () => {
    if (!routeFromHash(false)) showView("home", { updateHash: false });
  });

  document.addEventListener("keydown", (event) => {
    if ($("#photoLightbox").hidden) return;
    if (event.key === "Escape") closePhoto();
    if (event.key === "ArrowLeft") movePhoto(-1);
    if (event.key === "ArrowRight") movePhoto(1);
  });
}

function showView(viewId, options = {}) {
  const target = document.getElementById(viewId);
  if (!target) return;
  if (!$("#photoLightbox").hidden) closePhoto();

  document.querySelectorAll("main > section").forEach((section) => {
    section.classList.toggle("is-active", section === target);
  });
  document.body.dataset.view = viewId;
  if (options.updateHash !== false && window.location.hash !== `#${viewId}`) {
    history.replaceState(null, "", `#${viewId}`);
  }

  if (viewId === "letter" && options.resetLetter) {
    resetLetterView();
  }
  if (viewId === "photoWall") {
    startAlbumIntro();
    applyLayout();
  }
}

function startAlbumIntro(force = false) {
  if (prefersReducedMotion) return;
  if (albumIntroPlayed && !force) return;
  const wall = $("#photoGrid");
  if (!wall) return;
  albumIntroPlayed = true;
  albumIntroProgress = 0;
  albumIntroStart = performance.now();
  albumSceneBlend = 0;
  albumSceneMode = 0;
  photoSpotlightIndex = -1;
  photoSpotlightStrength = 0;
  photoSpotlightPhase = 0;
  stageMotion = Math.max(stageMotion, 0.86);
  queueVelocity = queueVelocity >= 0 ? 0.022 : -0.022;
  wall.classList.add("is-intro");
  wall.style.setProperty("--intro-progress", "0");
  wall.style.setProperty("--intro-reveal", "1");
  wall.style.setProperty("--drag-motion", stageMotion.toFixed(3));
  revealStagePoem();
}

function resetLetterView() {
  letterStarted = false;
  $("#letter").classList.remove("is-letter-opening", "is-letter-pulling", "is-letter-open");
  $("#envelopeWrap").classList.remove("is-open");
  $("#letterBody").innerHTML = "";
}

function markInteraction() {
  lastInteractionAt = performance.now();
}

function openPhotoFromTile(index, tile) {
  markInteraction();
  openPhoto(index, "detail", tile);
}

function renderPhotos() {
  const grid = $("#photoCards");
  grid.innerHTML = "";
  hoveredPhotoTile = null;
  $("#photoGrid").style.setProperty("--photo-count", story.photos.length);
  $("#photoGrid").classList.toggle("is-dense", story.photos.length > 14);
  $("#photoGrid").classList.toggle("is-wide-set", story.photos.length > 20);

  shuffledPhotos.forEach((photo, index) => {
    const button = document.createElement("button");
    button.className = "photo-tile";
    button.type = "button";
    const displayNumber = String(index + 1).padStart(2, "0");
    button.dataset.number = displayNumber;
    button.setAttribute("aria-label", photo.title);
    button.style.setProperty("--rotate", `${[-1.8, 1.1, -0.7, 1.6, -1.1, 0.8, -1.5, 1.4][index % 8]}deg`);
    button.style.setProperty("--delay", `${-(index * 0.32).toFixed(2)}s`);
    button.style.setProperty("--hue", `${330 + (index % 9) * 12}deg`);
    button.style.setProperty("--photo-url", `url(${JSON.stringify(photo.image)})`);
    button.innerHTML = `
      <span class="tile-ghost ghost-a" aria-hidden="true"></span>
      <span class="tile-ghost ghost-b" aria-hidden="true"></span>
      <span class="tile-ghost ghost-c" aria-hidden="true"></span>
      <span class="photo-media">
        <img src="${photo.image}" alt="${escapeHtml(photo.title)}" />
      </span>
      <span class="tile-caption">
        <strong>MEMORY ${displayNumber}</strong>
        <span>${escapeHtml(photo.title)}</span>
      </span>
    `;

    const img = button.querySelector("img");
    img.addEventListener("error", () => {
      img.replaceWith(createFallback(index));
    });

    let tilePressX = 0;
    let tilePressY = 0;
    let tilePressActive = false;

    button.addEventListener("pointerdown", (event) => {
      tilePressActive = true;
      tilePressX = event.clientX;
      tilePressY = event.clientY;
      hoverMotionUntil = performance.now() + 520;
      button.setPointerCapture(event.pointerId);
    });

    button.addEventListener("pointerup", (event) => {
      if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
      if (!tilePressActive) return;
      tilePressActive = false;
      const moved = Math.hypot(event.clientX - tilePressX, event.clientY - tilePressY);
      const clickThreshold = event.pointerType === "touch" ? 18 : 9;
      if (moved > clickThreshold || suppressPhotoClick || albumDragging) return;
      lastPointerPhotoOpenAt = performance.now();
      lastPointerPhotoOpenTile = button;
      openPhotoFromTile(index, button);
    });

    button.addEventListener("pointercancel", () => {
      tilePressActive = false;
    });

    button.addEventListener("click", (event) => {
      if (suppressPhotoClick) {
        event.preventDefault();
        return;
      }
      if (lastPointerPhotoOpenTile === button && performance.now() - lastPointerPhotoOpenAt < 420) {
        event.preventDefault();
        return;
      }
      openPhotoFromTile(index, button);
    });

    button.addEventListener("pointerenter", () => {
      if (albumDragging || !$("#photoLightbox").hidden) return;
      const now = performance.now();
      if (hoveredPhotoTile && hoveredPhotoTile !== button) {
        hoveredPhotoTile.classList.remove("is-hovered");
      }
      hoveredPhotoTile = button;
      hoverFlowActive = true;
      button.classList.add("is-hovered");
      if (now - lastHoverLockAt > 900) {
        hoverMotionUntil = Math.max(hoverMotionUntil, now + 180);
        lastHoverLockAt = now;
      }
      stageMotion = Math.max(stageMotion, 0.18);
      const wall = $("#photoGrid");
      wall.classList.add("is-hover-flow");
      wall.style.setProperty("--drag-motion", stageMotion.toFixed(3));
    });

    button.addEventListener("pointerleave", () => {
      if (hoveredPhotoTile === button) {
        hoveredPhotoTile = null;
        hoverFlowActive = false;
      }
      button.classList.remove("is-hovered");
      hoverMotionUntil = Math.max(hoverMotionUntil, performance.now() + 100);
      window.setTimeout(() => {
        if (!hoveredPhotoTile && !hoverFlowActive && performance.now() > hoverMotionUntil) {
          $("#photoGrid").classList.remove("is-hover-flow");
        }
      }, 180);
    });

    grid.appendChild(button);
  });

  cachedPhotoTiles = Array.from(grid.querySelectorAll(".photo-tile"));
  applyLayout();
}

function buildPhotoList() {
  const total = Math.max(story.photoCount || story.photos.length, story.photos.length);
  return Array.from({ length: total }, (_, index) => {
    const existing = story.photos[index] || {};
    const number = index + 1;
    return {
      image: existing.image || `assets/photos/photo-${number}.jpg`,
      title: existing.title || `照片 ${number}`,
      caption: existing.caption || "这里可以先空着，后面换成这张照片背后的真实回忆。"
    };
  });
}

function createFallback(index) {
  const fallback = document.createElement("span");
  fallback.className = "photo-fallback";
  fallback.dataset.number = String(index + 1).padStart(2, "0");
  fallback.setAttribute("aria-hidden", "true");
  return fallback;
}

function openPhoto(index, mode = "detail", sourceTile = null) {
  markInteraction();
  currentPhoto = index;
  const photo = shuffledPhotos[currentPhoto];
  const lightbox = $("#photoLightbox");
  const image = $("#lightboxImage");
  clearTimeout(photoRevealTimer);
  lightbox.classList.remove("is-missing-image");
  lightbox.classList.toggle("is-full-image", mode === "full");
  lightbox.classList.toggle("is-revealing", mode !== "full");
  $(".lightbox-image-wrap").dataset.number = String(currentPhoto + 1).padStart(2, "0");
  image.src = photo.image;
  image.alt = photo.title;
  image.onerror = () => {
    lightbox.classList.add("is-missing-image");
    image.removeAttribute("src");
  };
  $("#photoCounter").textContent = `${String(currentPhoto + 1).padStart(2, "0")} / ${String(shuffledPhotos.length).padStart(2, "0")}`;
  $("#lightboxTitle").textContent = photo.title;
  $("#lightboxCaption").textContent = photo.caption;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  if (mode === "full") {
    lightbox.classList.remove("is-revealing");
    burst(12);
    return;
  }

  if (sourceTile && !prefersReducedMotion) {
    runPhotoReveal(sourceTile, photo.image);
    photoRevealTimer = window.setTimeout(() => {
      lightbox.classList.remove("is-revealing");
      burst(18);
    }, 620);
  } else {
    lightbox.classList.remove("is-revealing");
    burst(24);
  }
}

function runPhotoReveal(sourceTile, imagePath) {
  const wall = $("#photoGrid");
  const lightbox = $("#photoLightbox");
  const imageWrap = $(".lightbox-image-wrap");
  if (!sourceTile || !imageWrap) return;

  const from = sourceTile.getBoundingClientRect();
  const to = imageWrap.getBoundingClientRect();
  if (!from.width || !to.width) return;

  const clone = document.createElement("div");
  clone.className = "photo-flight";
  clone.style.left = `${from.left}px`;
  clone.style.top = `${from.top}px`;
  clone.style.width = `${from.width}px`;
  clone.style.height = `${from.height}px`;
  clone.style.backgroundImage = `url(${imagePath})`;
  clone.style.setProperty("--flight-x", `${to.left - from.left}px`);
  clone.style.setProperty("--flight-y", `${to.top - from.top}px`);
  clone.style.setProperty("--flight-scale-x", `${to.width / from.width}`);
  clone.style.setProperty("--flight-scale-y", `${to.height / from.height}`);

  wall?.classList.add("is-photo-revealing");
  lightbox.classList.add("has-flight");
  document.body.appendChild(clone);
  requestAnimationFrame(() => clone.classList.add("is-flying"));

  window.setTimeout(() => {
    clone.remove();
    wall?.classList.remove("is-photo-revealing");
    lightbox.classList.remove("has-flight");
  }, 720);
}

function showFullPhoto() {
  const lightbox = $("#photoLightbox");
  if (lightbox.hidden) return;
  if (lightbox.classList.contains("is-full-image")) return;
  lightbox.classList.add("is-full-image");
  burst(12);
}

function closePhoto() {
  clearTimeout(photoRevealTimer);
  document.querySelectorAll(".photo-flight").forEach((flight) => flight.remove());
  $("#photoGrid").classList.remove("is-photo-revealing");
  $("#photoLightbox").hidden = true;
  $("#photoLightbox").classList.remove("is-full-image", "is-revealing", "has-flight", "is-missing-image");
  document.body.style.overflow = "";
}

function movePhoto(step) {
  const mode = $("#photoLightbox").classList.contains("is-full-image") ? "full" : "detail";
  currentPhoto = (currentPhoto + step + shuffledPhotos.length) % shuffledPhotos.length;
  openPhoto(currentPhoto, mode);
}

function applyLayout(updateCopy = true) {
  const tiles = cachedPhotoTiles.length ? cachedPhotoTiles : Array.from(document.querySelectorAll(".photo-tile"));
  const layout = layouts[layoutIndex];
  const wall = $("#photoGrid");
  const stageWidth = wall.clientWidth || window.innerWidth || 1;
  const stageHeight = wall.clientHeight || window.innerHeight || 1;
  if (updateCopy) {
    wall.classList.remove("layout-0", "layout-1", "layout-2", "layout-3");
    wall.classList.add(`layout-${layoutIndex}`);
    $("#wallStatus").textContent = `${layout.label}。点击任意照片可以放大查看介绍。`;
    $("#stageMode").textContent = `${layout.name} / ${String(Math.round(((layoutIndex + 1) / layouts.length) * 100)).padStart(2, "0")}%`;

    const poem = story.stagePoems[layoutIndex % story.stagePoems.length];
    $("#stagePoemLine1").textContent = poem[0];
    $("#stagePoemLine2").textContent = poem[1];
    revealStagePoem();
  }

  tiles.forEach((tile, index) => {
    let point = getLayoutPoint(layoutIndex, index, tiles.length);
    point = applySpotlightPoint(point, index, tiles.length);
    tile.classList.toggle("is-hero-card", point.focus >= 0.9);
    tile.classList.toggle("is-spotlight-card", point.spotlight >= 0.52);
    tile.style.setProperty("--x", `${point.x}%`);
    tile.style.setProperty("--y", `${point.y}%`);
    tile.style.setProperty("--x-px", `${((point.x / 100) * stageWidth).toFixed(2)}px`);
    tile.style.setProperty("--y-px", `${((point.y / 100) * stageHeight).toFixed(2)}px`);
    tile.style.setProperty("--rotate", `${point.rotate}deg`);
    tile.style.setProperty("--yaw", `${point.yaw || 0}deg`);
    tile.style.setProperty("--pitch", `${point.pitch || 0}deg`);
    tile.style.setProperty("--scale", point.scale.toFixed(3));
    tile.style.setProperty("--depth", `${point.depth}px`);
    tile.style.setProperty("--layer", String(point.layer));
    tile.style.setProperty("--opacity", String(point.opacity || 1));
    tile.style.setProperty("--focus", (point.focus || 0).toFixed(3));
    tile.style.setProperty("--spotlight", (point.spotlight || 0).toFixed(3));
    tile.style.setProperty("--blur", `${(point.blur || 0).toFixed(2)}px`);
    tile.style.setProperty("--drift", `${point.drift || 0}px`);
    tile.style.setProperty("--phase", (point.phase || 0).toFixed(3));
    const sweepDistance = Math.hypot((point.x || 50) - albumSweepX, ((point.y || 50) - albumSweepY) * 0.86);
    const sweepProximity = Math.max(0, 1 - sweepDistance / 17) * (0.28 + (point.focus || 0) * 0.72) * albumSweepIntensity;
    tile.style.setProperty("--sweep", sweepProximity.toFixed(3));
    const flow = Math.sign(queueVelocity || 1);
    const motion = stageMotion || 0;
    const ghostX = point.ghostX || 0;
    const ghostY = point.ghostY || 0;
    const ghostRotate = point.ghostRotate || 0;
    tile.style.setProperty("--ghost-a-x", `${(-flow * motion * ghostX).toFixed(2)}px`);
    tile.style.setProperty("--ghost-a-y", `${(motion * ghostY).toFixed(2)}px`);
    tile.style.setProperty("--ghost-a-rotate", `${(-flow * motion * ghostRotate).toFixed(2)}deg`);
    tile.style.setProperty("--ghost-b-x", `${(-flow * motion * ghostX * 0.56).toFixed(2)}px`);
    tile.style.setProperty("--ghost-b-y", `${(-motion * ghostY * 0.6).toFixed(2)}px`);
    tile.style.setProperty("--ghost-b-rotate", `${(-flow * motion * ghostRotate * 0.58).toFixed(2)}deg`);
    tile.style.setProperty("--ghost-c-x", `${(flow * motion * ghostX * 0.34).toFixed(2)}px`);
    tile.style.setProperty("--ghost-c-y", `${(motion * ghostY * 0.42).toFixed(2)}px`);
    tile.style.setProperty("--ghost-c-rotate", `${(flow * motion * ghostRotate * 0.36).toFixed(2)}deg`);
  });
}

function setupPhotoStageInteraction() {
  const wall = $("#photoGrid");
  const tiles = () => cachedPhotoTiles.length ? cachedPhotoTiles : Array.from(document.querySelectorAll(".photo-tile"));
  let pendingDrag = false;
  let dragPointerId = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let lastPointerStyleAt = 0;
  let lastPointerStyleX = Number.NaN;
  let lastPointerStyleY = Number.NaN;

  const beginDrag = (event) => {
    if (albumDragging) return;
    markInteraction();
    albumDragging = true;
    hoverFlowActive = false;
    hoveredPhotoTile = null;
    hoverMotionUntil = 0;
    photoSpotlightStrength = 0;
    photoSpotlightIndex = -1;
    wall.classList.remove("is-spotlight");
    dragDistance = 0;
    orbitVelocity = 0;
    queueVelocity = 0;
    smoothedQueueVelocity = 0;
    tiles().forEach((tile) => tile.classList.remove("is-hovered"));
    wall.classList.remove("is-hover-flow");
    wall.classList.add("is-dragging");
    if (!wall.hasPointerCapture(event.pointerId)) wall.setPointerCapture(event.pointerId);
  };

  const update = (event) => {
    const rect = wall.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const now = performance.now();
    const pointerDelta = Number.isNaN(lastPointerStyleX)
      ? 1
      : Math.hypot(x - lastPointerStyleX, y - lastPointerStyleY);
    const shouldUpdatePointerStyles = albumDragging
      || pointerDelta > 0.018 && now - lastPointerStyleAt > 48;
    if (shouldUpdatePointerStyles) {
      lastPointerStyleAt = now;
      lastPointerStyleX = x;
      lastPointerStyleY = y;
      wall.classList.add("is-interacting");
      wall.style.setProperty("--stage-shift-x", `${(x * 22).toFixed(2)}px`);
      wall.style.setProperty("--stage-shift-y", `${(y * 12).toFixed(2)}px`);
      wall.style.setProperty("--stage-tilt-x", `${(-y * 3.8).toFixed(2)}deg`);
      wall.style.setProperty("--stage-tilt-y", `${(x * 6).toFixed(2)}deg`);
      stagePointerX = x;
      stagePointerY = y;
      wall.style.setProperty("--pointer-x", `${(50 + x * 42).toFixed(2)}%`);
      wall.style.setProperty("--pointer-y", `${(50 + y * 28).toFixed(2)}%`);

      tiles().forEach((tile, index) => {
        const strength = 10 + (index % 5) * 4;
        tile.style.setProperty("--px", `${(-x * strength).toFixed(2)}px`);
        tile.style.setProperty("--py", `${(-y * strength).toFixed(2)}px`);
        tile.style.setProperty("--tilt-x", `${(x * 7).toFixed(2)}deg`);
        tile.style.setProperty("--tilt-y", `${(-y * 6).toFixed(2)}deg`);
      });
    }

    if (pendingDrag && !albumDragging) {
      const pendingDx = event.clientX - dragStartX;
      const pendingDy = event.clientY - dragStartY;
      const startThreshold = event.pointerType === "touch" ? 12 : 7;
      if (Math.hypot(pendingDx, pendingDy) >= startThreshold) {
        beginDrag(event);
      }
    }

    if (albumDragging) {
      markInteraction();
      const dx = event.clientX - dragLastX;
      const dt = Math.max(now - dragLastAt, 16);
      queueOffset += dx * 0.018;
      const targetVelocity = (dx / dt) * 0.13;
      smoothedQueueVelocity = smoothedQueueVelocity * 0.58 + targetVelocity * 0.42;
      queueVelocity = smoothedQueueVelocity;
      orbitOffset += dx * 0.0048;
      orbitVelocity = (dx / dt) * 0.035;
      stageMotion = Math.min(1, Math.abs(queueVelocity) * 26 + Math.abs(dx) * 0.012);
      wall.style.setProperty("--drag-motion", stageMotion.toFixed(3));
      wall.style.setProperty("--flow-direction", String(Math.sign(queueVelocity || dx || 1)));
      dragDistance += Math.abs(dx);
      dragLastX = event.clientX;
      dragLastAt = now;
      applyLayout(false);
    }
  };

  const reset = () => {
    wall.classList.remove("is-interacting");
    wall.style.setProperty("--stage-shift-x", "0px");
    wall.style.setProperty("--stage-shift-y", "0px");
    wall.style.setProperty("--stage-tilt-x", "0deg");
    wall.style.setProperty("--stage-tilt-y", "0deg");
    stagePointerX = 0;
    stagePointerY = 0;
    wall.style.setProperty("--pointer-x", "50%");
    wall.style.setProperty("--pointer-y", "50%");
    tiles().forEach((tile) => {
      tile.style.setProperty("--px", "0px");
      tile.style.setProperty("--py", "0px");
      tile.style.setProperty("--tilt-x", "0deg");
      tile.style.setProperty("--tilt-y", "0deg");
    });
  };

  wall.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    markInteraction();
    pendingDrag = true;
    dragPointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragLastX = event.clientX;
    dragLastAt = performance.now();
    dragDistance = 0;
  });

  const finishDrag = (event) => {
    if (!pendingDrag && !albumDragging) return;
    pendingDrag = false;
    dragPointerId = null;
    if (!albumDragging) return;
    albumDragging = false;
    wall.classList.remove("is-dragging");
    if (wall.hasPointerCapture(event.pointerId)) wall.releasePointerCapture(event.pointerId);
    const dragThreshold = event.pointerType === "touch" ? 24 : 14;
    if (dragDistance > dragThreshold) {
      suppressPhotoClick = true;
      window.setTimeout(() => {
        suppressPhotoClick = false;
      }, 180);
    }
    queueVelocity = smoothedQueueVelocity || queueVelocity;
    if (Math.abs(queueVelocity) < 0.003) queueVelocity = queueVelocity < 0 ? -0.004 : 0.004;
    if (Math.abs(orbitVelocity) < 0.0018) orbitVelocity = orbitVelocity < 0 ? -0.0022 : 0.0022;
    stageMotion = Math.max(stageMotion, Math.min(1, Math.abs(queueVelocity) * 18));
    wall.style.setProperty("--drag-motion", stageMotion.toFixed(3));
    wall.style.setProperty("--flow-direction", String(Math.sign(queueVelocity || 1)));
    revealStagePoem();
  };

  wall.addEventListener("pointermove", update);
  wall.addEventListener("pointerup", finishDrag);
  wall.addEventListener("pointerleave", () => {
    if (!albumDragging) {
      pendingDrag = false;
      dragPointerId = null;
      reset();
    }
  });
  wall.addEventListener("pointercancel", (event) => {
    finishDrag(event);
    reset();
  });
  wall.addEventListener("dblclick", (event) => {
    if (event.target.closest(".photo-tile")) return;
    markInteraction();
    advanceLayout();
  });
}

function setupAlbumLoop() {
  if (prefersReducedMotion) return;

  const tick = (now) => {
    if (!lastAlbumTickAt) lastAlbumTickAt = now;
    const delta = Math.min(Math.max(now - lastAlbumTickAt, 8), 48);
    const frameScale = delta / 16.67;
    lastAlbumTickAt = now;
    cinematicTime += delta / 1000;
    const wall = $("#photoGrid");
    if (albumIntroProgress < 1 && albumIntroStart) {
      albumIntroProgress = Math.min((now - albumIntroStart) / 3300, 1);
      wall.style.setProperty("--intro-progress", albumIntroProgress.toFixed(3));
      wall.style.setProperty("--intro-reveal", (1 - albumIntroProgress).toFixed(3));
      if (albumIntroProgress >= 1) {
        wall.classList.remove("is-intro");
        wall.style.setProperty("--intro-progress", "1");
        wall.style.setProperty("--intro-reveal", "0");
      }
    }
    const hoverLockActive = now < hoverMotionUntil;
    const hoverVisualActive = hoverFlowActive || hoverLockActive;
    updateAlbumScene(wall, now, frameScale, hoverLockActive);
    updateAlbumSpotlight(wall, now, frameScale, hoverVisualActive);
    updateAlbumSweep(wall);
    updateAlbumCamera(wall, hoverVisualActive);
    stageMotion *= Math.pow(0.94, frameScale);
    wall.style.setProperty("--drag-motion", stageMotion.toFixed(3));
    wall.style.setProperty("--flow-direction", String(Math.sign(queueVelocity || 1)));
    wall.style.setProperty("--cinematic-phase", String((cinematicTime % 1000).toFixed(3)));
    if (!albumDragging && $("#photoLightbox").hidden) {
      if (!hoverLockActive) queueOffset += queueVelocity * frameScale;
      queueVelocity *= Math.pow(albumIntroProgress < 1 ? 0.992 : 0.986, frameScale);
      if (hoverLockActive) {
        queueVelocity *= Math.pow(0.72, frameScale);
        if (Math.abs(queueVelocity) < 0.001) queueVelocity = 0;
      } else {
        const minVelocity = albumIntroProgress < 1 ? 0.0042 : 0.0031;
        if (Math.abs(queueVelocity) < minVelocity) queueVelocity = queueVelocity < 0 ? -minVelocity : minVelocity;
      }
      const introBoost = albumIntroProgress < 1 ? 0.54 * (1 - albumIntroProgress) : 0;
      stageMotion = Math.max(stageMotion, hoverVisualActive ? 0.16 : 0, introBoost, Math.min(0.82, Math.abs(queueVelocity) * 14));
      orbitOffset += orbitVelocity * frameScale;
      orbitVelocity *= Math.pow(0.992, frameScale);
      if (!hoverLockActive && Math.abs(orbitVelocity) < 0.0018) orbitVelocity = orbitVelocity < 0 ? -0.0018 : 0.0018;
      const layoutInterval = 16;
      if (now - lastLayoutApplyAt >= layoutInterval) {
        applyLayout(false);
        lastLayoutApplyAt = now;
      }
    } else if (albumIntroProgress < 1) {
      if (now - lastLayoutApplyAt >= 16) {
        applyLayout(false);
        lastLayoutApplyAt = now;
      }
    }
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function updateAlbumSweep(wall) {
  const cycle = (cinematicTime * 0.074 + queueOffset * 0.005) % 1;
  const phase = cycle < 0 ? cycle + 1 : cycle;
  albumSweepX = -12 + phase * 124;
  albumSweepY = 50 + Math.sin(cinematicTime * 0.62 + queueOffset * 0.018) * 7.2;
  const motion = Math.min(1, Math.abs(queueVelocity) * 28 + stageMotion * 0.44);
  albumSweepIntensity = Math.min(1, 0.34 + motion * 0.34 + albumSceneBlend * 0.26 + (albumIntroProgress < 1 ? (1 - albumIntroProgress) * 0.24 : 0));
  wall.style.setProperty("--sweep-x", `${albumSweepX.toFixed(2)}%`);
  wall.style.setProperty("--sweep-y", `${albumSweepY.toFixed(2)}%`);
  wall.style.setProperty("--sweep-intensity", albumSweepIntensity.toFixed(3));
  wall.style.setProperty("--sweep-angle", `${(-13 + Math.sin(cinematicTime * 0.4) * 5).toFixed(2)}deg`);
}

function updateAlbumCamera(wall, hoverVisualActive) {
  const lightboxOpen = !$("#photoLightbox").hidden;
  const sceneWeight = albumIntroProgress < 1 ? 1 - albumIntroProgress : albumSceneBlend;
  const motion = Math.min(1, Math.abs(queueVelocity) * 32 + stageMotion * 0.52 + sceneWeight * 0.36);
  const direction = Math.sign(queueVelocity || orbitVelocity || 1);
  const driftX = Math.sin(cinematicTime * 0.22 + queueOffset * 0.025) * (10 + sceneWeight * 12);
  const driftY = Math.cos(cinematicTime * 0.18 + queueOffset * 0.012) * (3.5 + sceneWeight * 4);
  const dragPush = albumDragging ? direction * Math.min(20, Math.abs(queueVelocity) * 310) : 0;
  const hoverEase = hoverVisualActive ? 0.72 : 1;
  const settle = lightboxOpen ? 0.35 : hoverEase;
  const dolly = lightboxOpen
    ? -70
    : -18 + sceneWeight * 34 + motion * 22 + Math.sin(cinematicTime * 0.32) * (6 + sceneWeight * 6);
  const scale = lightboxOpen
    ? 0.962
    : 0.986 + sceneWeight * 0.014 + motion * 0.012 + Math.sin(cinematicTime * 0.26) * 0.004;

  wall.style.setProperty("--camera-x", `${((driftX + dragPush) * settle).toFixed(2)}px`);
  wall.style.setProperty("--camera-y", `${(driftY * settle).toFixed(2)}px`);
  wall.style.setProperty("--camera-z", `${(dolly * settle).toFixed(2)}px`);
  wall.style.setProperty("--camera-roll", `${(direction * motion * 0.34 + Math.sin(cinematicTime * 0.2) * 0.18).toFixed(3)}deg`);
  wall.style.setProperty("--camera-tilt-x", `${(sceneWeight * -0.72 + Math.sin(cinematicTime * 0.31) * 0.32).toFixed(3)}deg`);
  wall.style.setProperty("--camera-tilt-y", `${(direction * motion * 0.62 + Math.cos(cinematicTime * 0.23) * 0.38).toFixed(3)}deg`);
  wall.style.setProperty("--camera-scale", scale.toFixed(4));
}

function updateAlbumScene(wall, now, frameScale, hoverLockActive) {
  if (albumDragging || !$("#photoLightbox").hidden) {
    wall.style.setProperty("--scene-blend", albumSceneBlend.toFixed(3));
    wall.style.setProperty("--scene-mode", String(albumSceneMode));
    return;
  }
  const canEvolve = albumIntroProgress >= 1
    && now - lastInteractionAt > 1800;
  const nextMode = canEvolve ? getAutoSceneMode(cinematicTime) : 0;
  const ambientMode = (Math.floor(cinematicTime / 6) % 4) + 1;
  const targetMode = nextMode || albumSceneMode || ambientMode;
  const targetBlend = canEvolve ? (nextMode === 0 ? 0.62 : 0.92) : 0;
  const blendSpeed = targetBlend > albumSceneBlend ? (targetBlend > 0.5 ? 0.016 : 0.009) : 0.03;
  albumSceneBlend += (targetBlend - albumSceneBlend) * Math.min(1, blendSpeed * frameScale);
  if (canEvolve && targetBlend > 0.01) albumSceneMode = targetMode;
  if (!canEvolve && albumSceneBlend < 0.02) albumSceneMode = 0;
  wall.dataset.scene = String(albumSceneMode);
  wall.style.setProperty("--scene-blend", albumSceneBlend.toFixed(3));
  wall.style.setProperty("--scene-mode", String(albumSceneMode));
}

function getAutoSceneMode(time) {
  const cycle = ((time - 3.6) % 30 + 30) % 30;
  if (cycle < 4.2) return 0;
  if (cycle < 9.4) return 1;
  if (cycle < 14.6) return 3;
  if (cycle < 20.6) return 2;
  if (cycle < 25.4) return 4;
  return 0;
}

function updateAlbumSpotlight(wall, now, frameScale, hoverVisualActive) {
  const idle = albumIntroProgress >= 1
    && now - lastInteractionAt > 2600
    && !albumDragging
    && !hoverVisualActive
    && $("#photoLightbox").hidden;
  const total = cachedPhotoTiles.length || story.photos.length || 1;
  const cycleLength = 12.4;
  const cycle = ((cinematicTime - 8.4) % cycleLength + cycleLength) % cycleLength;
  const pull = smoothstep(0.8, 2.1, cycle);
  const hold = 1 - smoothstep(7.0, 9.0, cycle);
  const targetStrength = idle ? Math.min(pull, hold) : 0;

  photoSpotlightStrength += (targetStrength - photoSpotlightStrength) * Math.min(1, (targetStrength > photoSpotlightStrength ? 0.065 : 0.075) * frameScale);
  if (targetStrength > 0.04 || photoSpotlightStrength > 0.04) {
    const cycleNumber = Math.floor((cinematicTime - 8.4) / cycleLength);
    photoSpotlightIndex = ((cycleNumber * 5 + 3) % total + total) % total;
  } else {
    photoSpotlightIndex = -1;
  }
  photoSpotlightPhase = cycle / cycleLength;
  wall.classList.toggle("is-spotlight", photoSpotlightStrength > 0.06);
  wall.style.setProperty("--spotlight-strength", photoSpotlightStrength.toFixed(3));
  wall.style.setProperty("--spotlight-phase", photoSpotlightPhase.toFixed(3));
  wall.style.setProperty("--spotlight-index", String(photoSpotlightIndex));
}

function advanceLayout() {
  triggerLayoutMorph(true);
}

function maybeAutoMorph(wall) {
  const now = performance.now();
  if (albumIntroProgress < 1) return;
  if (albumDragging || hoverFlowActive || now < hoverMotionUntil) return;
  if (!$("#photoLightbox").hidden) return;
  if (wall.classList.contains("is-morphing")) return;
  if (now - lastInteractionAt < 5200) return;
  if (now - lastManualLayoutAt < 8500) return;
  if (now - lastAutoMorphAt < 7600) return;
  triggerLayoutMorph(false);
}

function triggerLayoutMorph(manual = false) {
  const now = performance.now();
  if (manual) {
    lastManualLayoutAt = now;
    markInteraction();
  } else {
    lastAutoMorphAt = now;
  }
  layoutIndex = (layoutIndex + 1) % layouts.length;
  photoSpotlightStrength = 0;
  photoSpotlightIndex = -1;
  photoSpotlightPhase = 0;
  queueVelocity = queueVelocity >= 0 ? (manual ? 0.028 : 0.018) : (manual ? -0.028 : -0.018);
  orbitVelocity = orbitVelocity >= 0 ? (manual ? 0.006 : 0.0044) : (manual ? -0.006 : -0.0044);
  stageMotion = 1;
  const wall = $("#photoGrid");
  wall.classList.remove("is-spotlight");
  wall.style.setProperty("--spotlight-strength", "0");
  wall.style.setProperty("--spotlight-index", "-1");
  wall.style.setProperty("--drag-motion", "1");
  wall.style.setProperty("--flow-direction", String(Math.sign(queueVelocity || 1)));
  wall.classList.add("is-morphing");
  clearTimeout(morphTimer);
  morphTimer = window.setTimeout(() => wall.classList.remove("is-morphing"), manual ? 1100 : 1500);
  applyLayout();
  burst(manual ? 58 : 34);
}

function revealStagePoem() {
  const wall = $("#photoGrid");
  if (!wall) return;
  wall.classList.add("is-poem-visible");
  clearTimeout(poemTimer);
  poemTimer = window.setTimeout(() => {
    wall.classList.remove("is-poem-visible");
  }, 4200);
}

function getLayoutPoint(type, index, total) {
  const t = total <= 1 ? 0 : index / (total - 1);
  const phase = wrapPhase(index, total, queueOffset);
  const absPhase = Math.abs(phase);
  const angle = (Math.PI * 2 * (index + queueOffset * 0.08)) / total - Math.PI / 2;
  const breath = Math.sin(cinematicTime * 1.25 + index * 0.35);

  if (type === 0) {
    const ribbonSpan = 12.2;
    const isRibbon = absPhase <= ribbonSpan;
    const center = Math.max(0, 1 - absPhase / ribbonSpan);
    const side = Math.min(absPhase / ribbonSpan, 1);
    const direction = phase < 0 ? -1 : 1;
    const wave = Math.sin(phase * 0.64 + cinematicTime * 0.8);
    if (isRibbon) {
      const lanePattern = [0, -1.3, 1.04, -0.5, 1.42, -0.86, 0.58, -1.5, 1.18, -0.26, 0.86, -1.08];
      const laneRaw = lanePattern[index % lanePattern.length];
      const laneInfluence = smoothstep(0.1, 0.72, side);
      const lane = laneRaw * laneInfluence;
      const laneDepth = laneInfluence * (124 - Math.abs(laneRaw) * 84);
      const laneFocus = Math.max(0, 0.18 - Math.abs(lane) * 0.04 + laneInfluence * 0.07);
      const crest = Math.sin(cinematicTime * 0.72 + index * 0.84);
      const focus = Math.min(1, center + laneFocus);
      const ribbonPoint = {
        x: 50 + phase * 3.52 + lane * (1.2 + side * 2.22) + wave * (0.34 + side * 1.02),
        y: 54.8 - center * 5.1 + lane * (8.8 + side * 6.6) + Math.sin(phase * 0.72) * (1.05 + side * 1.25) + crest * laneInfluence * 1.42 + breath * center * 0.6,
        rotate: phase * 1.02 + lane * 5.5 + wave * 1.32 + breath * center * 0.62,
        yaw: -phase * (8.3 + side * 3.1) + lane * 9.4,
        pitch: center * 5.4 - 3.4 - side * 2.15 - lane * 2.5,
        scale: 0.64 + center * 0.82 + laneInfluence * (0.13 - Math.abs(laneRaw) * 0.022) + center * breath * 0.018,
        depth: -470 + center * 860 + laneDepth + center * breath * 42,
        layer: 18 + Math.round(focus * 94) + Math.round(18 - absPhase) + Math.round((lane + 1.6) * 3),
        opacity: Math.min(1, 0.68 + center * 0.3 + laneInfluence * 0.08 - Math.abs(lane) * 0.015),
        focus,
        blur: (1 - focus) * 1.35 + Math.abs(lane) * 0.08,
        drift: breath * (2.8 + center * 6.1 + laneInfluence * 3.2),
        phase,
        ghostX: direction * (18 + side * 76) + lane * 22,
        ghostY: wave * (5 + side * 14) + lane * 14,
        ghostRotate: direction * (3.4 + side * 10.5) + lane * 6.2
      };
      const introPoint = getIntroPoint(index, total, ribbonPoint);
      if (introPoint) return introPoint;
      return {
        ...blendAlbumScenePoint(ribbonPoint, index, total)
      };
    }

    const tail = Math.min(absPhase - ribbonSpan, 4.2);
    const spine = Math.max(0, 1 - tail / 4.2);
    const stackSlot = index % 4;
    const stackX = stackSlot === 0 ? -7.8 : stackSlot === 1 ? 7.8 : stackSlot === 2 ? -2.8 : 2.8;
    const tailPoint = {
      x: 50 + stackX + Math.sin(tail * 1.52 + queueOffset * 0.12) * 2.8,
      y: 54 + direction * (8.6 + tail * 8.4),
      rotate: direction * (82 + tail * 5.8) + stackX * 0.35,
      yaw: direction * (18 + tail * 8.5),
      pitch: -direction * (28 - spine * 8),
      scale: 0.4 + spine * 0.28,
      depth: -520 + spine * 230,
      layer: 6 + Math.round(spine * 16),
      opacity: 0.22 + spine * 0.46,
      focus: spine * 0.24,
      blur: 2.4 + (1 - spine) * 1.4,
      drift: breath * 2,
      phase,
      ghostX: direction * 60,
      ghostY: direction * 8,
      ghostRotate: direction * 10
    };
    const introPoint = getIntroPoint(index, total, tailPoint);
    return introPoint || blendAlbumScenePoint(tailPoint, index, total);
  }

  if (type === 1) {
    const ringAngle = (Math.PI * 2 * index) / total + orbitOffset + queueOffset * 0.08;
    const horizontal = Math.cos(ringAngle);
    const vertical = Math.sin(ringAngle);
    const front = (vertical + 1) / 2;
    const back = 1 - front;
    return {
      x: 50 + horizontal * (30 + back * 5),
      y: 53 + vertical * 17,
      rotate: horizontal * 10,
      yaw: -horizontal * (44 + front * 22),
      pitch: -vertical * 7,
      scale: 0.45 + front * 0.55,
      depth: -280 + front * 500,
      layer: 8 + Math.round(front * 36),
      opacity: 0.34 + front * 0.66,
      focus: front,
      blur: (1 - front) * 1.8,
      drift: breath * (2 + front * 4)
    };
  }

  if (type === 2) {
    const spiralAngle = index * 2.399 + queueOffset * 0.1 + orbitOffset * 0.5;
    const radius = Math.min(6 + absPhase * 1.85 + (index % 3) * 2.2, 27);
    const front = 1 - Math.min(absPhase / (total / 2), 1);
    return {
      x: 50 + Math.cos(spiralAngle) * radius,
      y: 52 + Math.sin(spiralAngle) * radius * 0.62,
      rotate: (spiralAngle * 180) / Math.PI + 92,
      yaw: Math.cos(spiralAngle) * -34,
      pitch: Math.sin(spiralAngle) * 8,
      scale: 0.56 + front * 0.44 + (index % 5 === 0 ? 0.08 : 0),
      depth: -80 + front * 270,
      layer: 8 + Math.round(front * 26) + (index % 5),
      opacity: 0.44 + front * 0.56,
      focus: front,
      blur: (1 - front) * 1.5,
      drift: breath * (1.5 + front * 3)
    };
  }

  const pseudoX = fract(Math.sin((index + 1) * 12.9898) * 43758.5453);
  const pseudoY = fract(Math.sin((index + 1) * 78.233) * 24634.6345);
  const drift = Math.sin(queueOffset * 0.08 + index * 0.7);
  return {
    x: 12 + pseudoX * 76 + drift * 3.4,
    y: 20 + pseudoY * 60 + Math.cos(queueOffset * 0.07 + index) * 2.4,
    rotate: -18 + fract(Math.sin(index * 4.91) * 1000) * 36 + drift * 4,
    yaw: -18 + fract(Math.sin(index * 8.21) * 1000) * 36 + drift * 8,
    pitch: -8 + fract(Math.sin(index * 3.67) * 1000) * 16,
    scale: 0.58 + fract(Math.sin(index * 9.17) * 1000) * 0.34,
    depth: 12 + fract(Math.sin(index * 2.71) * 1000) * 92,
    layer: 8 + (index % 18),
    focus: 0.25,
    blur: 1.8,
    drift: drift * 2
  };
}

function blendAlbumScenePoint(basePoint, index, total) {
  if (albumSceneMode === 0 || albumSceneBlend <= 0.012 || albumIntroProgress < 1) return basePoint;
  const scenePoint = getAlbumScenePoint(albumSceneMode, index, total, basePoint);
  const amount = smoothstep(0.02, 0.96, albumSceneBlend);
  return mixLayoutPoint(basePoint, scenePoint, amount);
}

function applySpotlightPoint(basePoint, index, total) {
  if (photoSpotlightStrength <= 0.012 || photoSpotlightIndex < 0 || albumIntroProgress < 1) {
    return {
      ...basePoint,
      spotlight: 0
    };
  }

  const strength = smoothstep(0.02, 0.98, photoSpotlightStrength);
  const selected = index === photoSpotlightIndex;
  if (selected) {
    const lift = Math.sin(photoSpotlightPhase * Math.PI * 2) * 2.8;
    const target = {
      x: 39.5 + lift * 0.24,
      y: 53.2 - Math.abs(lift) * 0.08,
      rotate: -3.2 + lift * 0.35,
      yaw: 4 + lift * 0.18,
      pitch: -2.2,
      scale: 1.62 + strength * 0.1,
      depth: 760,
      layer: 220,
      opacity: 1,
      focus: 1,
      blur: 0,
      drift: lift,
      phase: basePoint.phase || 0,
      ghostX: -18,
      ghostY: 3,
      ghostRotate: -3.5,
      spotlight: 1
    };
    const mixed = mixLayoutPoint(basePoint, target, strength);
    mixed.layer = Math.max(mixed.layer, Math.round(120 + strength * 100));
    mixed.opacity = Math.max(mixed.opacity, 0.92 + strength * 0.08);
    mixed.focus = Math.max(mixed.focus, 0.86 + strength * 0.14);
    mixed.blur = Math.min(mixed.blur || 0, (1 - strength) * 0.35);
    mixed.spotlight = strength;
    return mixed;
  }

  const rank = ((index - photoSpotlightIndex + total) % total + total) % total;
  const angle = (rank / total) * Math.PI * 2 + photoSpotlightPhase * Math.PI * 1.12;
  const front = (Math.sin(angle) + 1) / 2;
  const arcSide = Math.cos(angle);
  const focusBias = rank % 5 === 0 ? 0.14 : 0;
  const target = {
    x: 55 + arcSide * (30 + front * 4),
    y: 57.5 + Math.sin(angle) * 10.5 + Math.cos(angle * 2.1) * 1.6,
    rotate: arcSide * 12 + Math.sin(angle * 1.4) * 6,
    yaw: -arcSide * (34 + front * 10),
    pitch: -5 + front * 8,
    scale: 0.44 + front * 0.22 + focusBias,
    depth: -620 + front * 280 + focusBias * 120,
    layer: 10 + Math.round(front * 42) + (rank % 4),
    opacity: 0.34 + front * 0.28 + focusBias,
    focus: 0.22 + front * 0.26 + focusBias,
    blur: 0.9 + (1 - front) * 1.2,
    drift: Math.sin(angle + cinematicTime) * 2.2,
    phase: basePoint.phase || 0,
    ghostX: arcSide * 42,
    ghostY: Math.sin(angle) * 16,
    ghostRotate: arcSide * 10,
    spotlight: 0
  };
  return mixLayoutPoint(basePoint, target, strength * 0.82);
}

function getAlbumScenePoint(mode, index, total, basePoint) {
  const ordered = ((index + Math.round(queueOffset)) % total + total) % total;
  const pseudo = fract(Math.sin((index + 1) * 91.741) * 41758.5453);
  const phase = wrapPhase(index, total, queueOffset);
  const breath = Math.sin(cinematicTime * 0.82 + index * 0.47);

  if (mode === 1) {
    const cols = total > 20 ? 8 : 6;
    const rows = Math.ceil(total / cols);
    const col = ordered % cols;
    const row = Math.floor(ordered / cols);
    const cx = (col - (cols - 1) / 2) / ((cols - 1) / 2 || 1);
    const cy = (row - (rows - 1) / 2) / ((rows - 1) / 2 || 1);
    const jitterX = (pseudo - 0.5) * 5.2 + Math.sin(cinematicTime * 0.42 + ordered * 1.27) * 0.86;
    const jitterY = (fract(Math.sin((index + 3) * 57.13) * 24718.63) - 0.5) * 4.1
      + Math.cos(cinematicTime * 0.38 + ordered * 0.91) * 0.72;
    const pilePop = ordered % 7 === 0 || ordered % 11 === 0 ? 1 : ordered % 5 === 0 ? 0.58 : 0;
    const distance = Math.min(Math.hypot(cx * 0.74, cy * 0.92), 1);
    const focus = Math.min(1, 1 - distance * 0.64 + pilePop * 0.16);
    const rowShear = row % 2 === 0 ? -2.2 : 2.2;
    const cardTilt = Math.sin(ordered * 1.73 + cinematicTime * 0.28);
    return {
      x: 50 + cx * 28.8 + cy * rowShear + jitterX,
      y: 47.6 + cy * 13.4 + jitterY + Math.sin(col * 0.8 + cinematicTime * 0.5) * 0.8,
      rotate: cx * 5.4 + cy * -3.8 + cardTilt * 3.3 + pilePop * (cx < 0 ? -2.8 : 2.8),
      yaw: -cx * (19 + pilePop * 9) + cardTilt * 5.5,
      pitch: cy * 8.4 - pilePop * 3.4,
      scale: 0.5 + focus * 0.36 + pilePop * 0.17 + (row === 1 ? 0.05 : 0),
      depth: -460 + focus * 420 + pilePop * 260 + (row === 1 ? 80 : 0) - Math.abs(cx) * 70,
      layer: 18 + Math.round(focus * 58) + Math.round(pilePop * 22) + row * 3 + (col % 3),
      opacity: Math.min(1, 0.58 + focus * 0.34 + pilePop * 0.08),
      focus,
      blur: (1 - focus) * 1.55 + (pilePop ? 0 : Math.abs(cy) * 0.18),
      drift: breath * (2.8 + pilePop * 2.6),
      phase,
      ghostX: Math.sign(cx || phase || 1) * (30 + (1 - focus) * 40 + pilePop * 18),
      ghostY: cy * 20 + jitterY * 0.8,
      ghostRotate: cx * 9 + cardTilt * 5
    };
  }

  if (mode === 2) {
    const flowerAngle = ordered * 2.399963 + orbitOffset * 0.6 + cinematicTime * 0.32;
    const petalBand = ordered % 5;
    const petalPulse = Math.sin(ordered * 1.7 + cinematicTime * 0.84);
    const ring = Math.min(23.5, 5.6 + Math.sqrt(ordered + 0.8) * 3.25 + petalBand * 0.58);
    const petalWidth = 0.82 + petalPulse * 0.075 + (petalBand === 0 ? 0.1 : 0);
    const front = (Math.sin(flowerAngle) + 1) / 2;
    const pop = ordered % 6 === 0 ? 1 : ordered % 9 === 0 ? 0.72 : 0;
    const focus = Math.min(1, Math.max(0.1, 1 - ring / 28 + front * 0.22 + pop * 0.18));
    return {
      x: 50 + Math.cos(flowerAngle) * ring * petalWidth + Math.cos(flowerAngle * 2.2) * (1.8 + pop * 1.2),
      y: 52 + Math.sin(flowerAngle) * ring * 0.58 + petalPulse * 1.45 - front * 1.6,
      rotate: (flowerAngle * 180) / Math.PI + 82 + petalPulse * 8.5 + pop * 8,
      yaw: Math.cos(flowerAngle) * (-36 - pop * 12),
      pitch: Math.sin(flowerAngle) * 14 - front * 4,
      scale: 0.46 + focus * 0.58 + pop * 0.22 + (petalBand === 0 ? 0.06 : 0),
      depth: -360 + focus * 520 + front * 190 + pop * 240 + Math.cos(flowerAngle) * 54,
      layer: 18 + Math.round(focus * 62) + Math.round(front * 18) + Math.round(pop * 24) + petalBand,
      opacity: Math.min(1, 0.5 + focus * 0.4 + front * 0.08 + pop * 0.08),
      focus,
      blur: (1 - focus) * 1.7 + (front < 0.28 ? 0.35 : 0),
      drift: breath * (2.5 + focus * 4.4 + pop * 1.8),
      phase,
      ghostX: Math.cos(flowerAngle) * (44 + pop * 18),
      ghostY: Math.sin(flowerAngle) * (24 + pop * 10),
      ghostRotate: petalPulse * 14 + pop * 10
    };
  }

  if (mode === 3) {
    const vertical = ordered % 3 === 0;
    const lane = vertical ? (Math.floor(ordered / 3) % 9) - 4 : Math.max(-5.8, Math.min(5.8, phase * 0.54));
    const columnSide = ordered % 2 === 0 ? -1 : 1;
    const crossFocus = vertical ? Math.max(0, 1 - Math.abs(lane) / 4.6) : Math.max(0, 1 - Math.abs(phase) / 11.2);
    const stackPop = vertical && (ordered % 6 === 0 || Math.abs(lane) < 1.2) ? 0.76 : !vertical && Math.abs(phase) < 3.2 ? 0.5 : 0;
    const columnWaver = Math.sin(cinematicTime * 0.58 + ordered * 0.9);
    return {
      x: vertical
        ? 50 + columnSide * (2.4 + Math.abs(lane) * 0.26) + columnWaver * 2.4
        : 50 + phase * 3.08 + Math.sin(phase * 0.8 + cinematicTime) * 1.3,
      y: vertical
        ? 52 + lane * 6.9 + Math.cos(cinematicTime * 0.72 + ordered) * 1.5
        : 54 + Math.sin(phase * 0.56) * 4.2,
      rotate: vertical ? 88 + lane * 2.5 + columnWaver * 3.8 : phase * 0.82 + breath * 0.9,
      yaw: vertical ? columnSide * (21 + stackPop * 12) + columnWaver * 5 : -phase * (8.6 + stackPop * 2),
      pitch: vertical ? lane * -2.9 - stackPop * 2.5 : -4 + crossFocus * 8,
      scale: vertical ? 0.46 + crossFocus * 0.34 + stackPop * 0.17 : 0.43 + crossFocus * 0.68 + stackPop * 0.12,
      depth: vertical ? -450 + crossFocus * 330 + stackPop * 230 : -500 + crossFocus * 740 + stackPop * 160,
      layer: vertical ? 18 + Math.round(crossFocus * 34) + Math.round(stackPop * 22) : 20 + Math.round(crossFocus * 66) + Math.round(stackPop * 16),
      opacity: vertical ? 0.32 + crossFocus * 0.46 + stackPop * 0.12 : 0.42 + crossFocus * 0.5 + stackPop * 0.08,
      focus: crossFocus,
      blur: (1 - crossFocus) * (vertical ? 2.4 : 1.7),
      drift: breath * (3 + stackPop * 1.8),
      phase,
      ghostX: (vertical ? columnSide : Math.sign(phase || 1)) * (52 + stackPop * 20),
      ghostY: vertical ? lane * 6 : Math.sin(phase) * 16,
      ghostRotate: vertical ? 16 + stackPop * 8 : 8 + stackPop * 6
    };
  }

  if (mode === 4) {
    const cols = total > 20 ? 6 : 5;
    const col = ordered % cols;
    const row = Math.floor(ordered / cols);
    const rows = Math.ceil(total / cols);
    const cx = (col - (cols - 1) / 2) / ((cols - 1) / 2 || 1);
    const cy = (row - (rows - 1) / 2) / ((rows - 1) / 2 || 1);
    const curtain = Math.sin(cinematicTime * 0.45 + col * 0.8);
    const front = Math.max(0, 1 - Math.abs(cx) * 0.46 - Math.abs(cy) * 0.12) + (row % 2 === 0 ? 0.08 : 0);
    return {
      x: 50 + cx * 21 + curtain * 1.4 + cy * 1.6,
      y: 49.5 + cy * 16.2 + Math.cos(cinematicTime * 0.38 + row) * 1.1,
      rotate: cx * 3.2 + cy * -1.8 + curtain * 2.4,
      yaw: -cx * 16 + curtain * 4,
      pitch: cy * 5.6 - front * 2,
      scale: 0.46 + front * 0.24 + (col === 0 || col === cols - 1 ? 0.04 : 0),
      depth: -520 + front * 360 - Math.abs(cy) * 36,
      layer: 16 + Math.round(front * 46) + row,
      opacity: Math.min(1, 0.5 + front * 0.34),
      focus: Math.min(1, 0.28 + front * 0.54),
      blur: (1 - Math.min(1, front)) * 1.6,
      drift: breath * (2.2 + front * 2.8),
      phase,
      ghostX: cx * 36,
      ghostY: cy * 24,
      ghostRotate: cx * 8 + curtain * 3
    };
  }

  return basePoint;
}

function mixLayoutPoint(from, to, amount) {
  const mixed = {};
  const fields = ["x", "y", "rotate", "yaw", "pitch", "scale", "depth", "opacity", "focus", "blur", "drift", "phase", "ghostX", "ghostY", "ghostRotate", "spotlight"];
  fields.forEach((field) => {
    mixed[field] = lerp(from[field] || 0, to[field] || 0, amount);
  });
  mixed.layer = Math.round(lerp(from.layer || 1, to.layer || 1, amount));
  return mixed;
}

function getIntroPoint(index, total, target) {
  if (albumIntroProgress >= 0.995) return null;
  const p = easeOutCubic(albumIntroProgress);
  const gather = smoothstep(0.12, 0.58, albumIntroProgress);
  const spread = smoothstep(0.42, 0.98, albumIntroProgress);
  const angle = index * 2.399963 + cinematicTime * 0.42;
  const scatter = 28 + (index % 7) * 3.6;
  const ring = lerp(scatter, 10 + (index % 6) * 2.2, gather);
  const startX = 50 + Math.cos(angle) * ring * (1.05 - gather * 0.28);
  const startY = 52 + Math.sin(angle) * ring * (0.62 - gather * 0.16);
  const startRotate = Math.sin(index * 1.7) * 32 + (index % 2 ? -1 : 1) * (52 - gather * 22);
  const startScale = 0.09 + gather * 0.38 + (index % 5 === 0 ? 0.05 : 0);
  const startDepth = -1380 + gather * 780 + Math.cos(angle) * 120;
  const startOpacity = Math.max(0, (albumIntroProgress - 0.06) / 0.4) * (0.18 + gather * 0.58);
  const mix = spread * p;

  return {
    x: lerp(startX, target.x, mix),
    y: lerp(startY, target.y, mix),
    rotate: lerp(startRotate, target.rotate, mix),
    yaw: lerp(Math.cos(angle) * -54, target.yaw || 0, mix),
    pitch: lerp(Math.sin(angle) * 20, target.pitch || 0, mix),
    scale: lerp(startScale, target.scale, mix),
    depth: lerp(startDepth, target.depth, mix),
    layer: target.layer,
    opacity: lerp(startOpacity, target.opacity || 1, mix),
    focus: lerp(0.12, target.focus || 0, mix),
    blur: lerp(2.8, target.blur || 0, mix),
    drift: target.drift || 0,
    phase: target.phase || 0,
    ghostX: (target.ghostX || 0) * (0.4 + mix * 0.6),
    ghostY: (target.ghostY || 0) * (0.4 + mix * 0.6),
    ghostRotate: (target.ghostRotate || 0) * (0.4 + mix * 0.6)
  };
}

function fract(value) {
  return value - Math.floor(value);
}

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

function smoothstep(edge0, edge1, value) {
  const x = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return x * x * (3 - 2 * x);
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - Math.min(Math.max(value, 0), 1), 3);
}

function wrapPhase(index, total, offset) {
  const half = total / 2;
  return ((((index + offset + half) % total) + total) % total) - half;
}

async function openLetter() {
  const letter = $("#letter");
  if (letter.classList.contains("is-letter-opening")) return;
  letter.classList.add("is-letter-opening");
  $("#envelopeWrap").classList.add("is-open");
  await startMusic();
  window.setTimeout(() => {
    letter.classList.add("is-letter-pulling");
  }, 520);
  window.setTimeout(() => {
    letter.classList.add("is-letter-open");
    if (!letterStarted) typeLetter();
  }, 1250);
}

async function typeLetter() {
  if (letterStarted) return;
  letterStarted = true;
  const target = $("#letterBody");
  target.innerHTML = "";

  if (prefersReducedMotion) {
    target.innerHTML = story.letter.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
    return;
  }

  for (const paragraph of story.letter) {
    const p = document.createElement("p");
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    target.appendChild(p);
    p.appendChild(cursor);

    for (const char of paragraph) {
      cursor.insertAdjacentText("beforebegin", char);
      await wait(char === "，" || char === "。" ? 120 : 36);
    }
    cursor.remove();
    await wait(220);
  }
}

async function startMusic() {
  if (musicOn) return;
  musicOn = true;
  updateMusicButton();

  if (!audio) {
    audio = new Audio(story.musicPath);
    audio.loop = true;
    audio.volume = 0.35;
  }

  try {
    await audio.play();
  } catch {
    startSynth();
  }
}

function stopMusic() {
  musicOn = false;
  if (audio) audio.pause();
  if (synthTimer) {
    clearInterval(synthTimer);
    synthTimer = null;
  }
  updateMusicButton();
}

function updateMusicButton() {
  $("#musicToggle").classList.toggle("is-on", musicOn);
  $("#musicIcon").textContent = musicOn ? "Ⅱ" : "♪";
  $("#musicToggle").setAttribute("aria-label", musicOn ? "暂停音乐" : "播放音乐");
}

function startSynth() {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25];
  let i = 0;

  const playNote = () => {
    if (!musicOn || !audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = notes[i % notes.length];
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.055, audioContext.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.2);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1.25);
    i += 1;
  };

  playNote();
  synthTimer = setInterval(playNote, 1250);
}

function setupEffects() {
  const canvas = $("#effectCanvas");
  const ctx = canvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  resize();
  window.addEventListener("resize", resize);
  if (prefersReducedMotion) return;

  const makeParticle = (burstMode = false, layer = "mid") => {
    const isNear = layer === "near";
    const isDust = layer === "dust";
    const pageView = document.body.dataset.view || "home";
    const albumActive = pageView === "photoWall";
    const ambientPage = !albumActive && !burstMode;
    const ambientGlint = ambientPage && Math.random() > 0.68;
    const sceneBlend = albumActive ? albumSceneBlend : 0;
    const sceneActive = albumActive && albumSceneMode !== 0 && sceneBlend > 0.12;
    const motionBoost = albumActive ? stageMotion : 0;
    const quietAlbumParticle = albumActive && !burstMode;
    const flowSign = Math.sign(queueVelocity || 1);
    const size = quietAlbumParticle
      ? isNear ? 0.9 + Math.random() * (1.8 + sceneBlend * 1.2) : isDust ? 0.42 + Math.random() * (1.05 + sceneBlend * 0.72) : 0.62 + Math.random() * (1.45 + sceneBlend)
      : ambientPage ? ambientGlint ? 0.9 + Math.random() * 2.1 : isNear ? 0.8 + Math.random() * 2.4 : 0.38 + Math.random() * 1.35
      : isDust ? 0.8 + Math.random() * 2.6 : isNear ? 3.4 + Math.random() * 7 : burstMode ? 2.4 + Math.random() * 6.2 : 1.8 + Math.random() * 5;
    return {
      x: burstMode
        ? width / 2 + (Math.random() - 0.5) * 280
        : ambientPage
          ? Math.random() * width
        : sceneActive && Math.random() > 0.35
          ? (flowSign > 0 ? -30 : width + 30) + (Math.random() - 0.5) * 70
          : Math.random() * width,
      y: burstMode
        ? height * 0.52 + (Math.random() - 0.5) * 190
        : quietAlbumParticle
          ? sceneActive ? height * (0.26 + Math.random() * 0.48) : Math.random() * height
          : ambientPage
            ? Math.random() * height
          : height + 24 + Math.random() * 80,
      size,
      speedX: burstMode
        ? (Math.random() - 0.5) * (8 + motionBoost * 5)
        : quietAlbumParticle
          ? sceneActive
            ? flowSign * (0.52 + Math.random() * 1.15 + sceneBlend * 1.1)
            : (Math.random() - 0.5) * (0.12 + motionBoost * 0.36)
          : ambientPage
            ? (Math.random() - 0.5) * (ambientGlint ? 0.18 : 0.12)
          : isNear ? -0.55 - Math.random() * 0.75 : (Math.random() - 0.5) * (0.34 + motionBoost * 0.55),
      speedY: burstMode
        ? -3 - Math.random() * (5.5 + motionBoost * 3)
        : quietAlbumParticle
          ? sceneActive ? (Math.random() - 0.5) * (0.04 + sceneBlend * 0.08) : -0.012 - Math.random() * 0.06
          : ambientPage
            ? -0.012 - Math.random() * (ambientGlint ? 0.055 : 0.035)
          : isDust ? -0.08 - Math.random() * 0.16 : isNear ? -0.3 - Math.random() * 0.55 : -0.18 - Math.random() * 0.38,
      rotate: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * (isNear ? 0.075 : 0.045),
      life: ambientPage ? 380 + Math.random() * 360 : sceneActive ? 180 + Math.random() * 170 : isDust ? 340 + Math.random() * 220 : burstMode ? 90 + Math.random() * 56 : isNear ? 180 + Math.random() * 110 : 260 + Math.random() * 140,
      color: quietAlbumParticle || burstMode
        ? ["#fff4d2", "#e5b86a", "#f8e5b8", "#ffffff"][Math.floor(Math.random() * 4)]
        : ambientPage
          ? ["#fff8df", "#f1cf8a", "#d9ad62", "#f0a4b6", "#ffffff", "#c9c0ff"][Math.floor(Math.random() * 6)]
        : ["#f7cad7", "#f3b35d", "#fff1c7", "#d85b79", "#ffffff", "#d6b4ff"][Math.floor(Math.random() * 6)],
      layer,
      type: ambientPage ? ambientGlint ? "glint" : "dust" : sceneActive && Math.random() > 0.68 ? "glint" : isDust || quietAlbumParticle ? "dust" : burstMode ? Math.random() > 0.7 ? "glint" : "dust" : Math.random() > 0.9 ? "glint" : "dust"
    };
  };

  window.burst = (count = 60) => {
    for (let i = 0; i < count; i += 1) particles.push(makeParticle(true, i % 4 === 0 ? "near" : i % 3 === 0 ? "dust" : "mid"));
  };

  const seedCount = document.body.dataset.view === "photoWall" ? 90 : 120;
  for (let i = 0; i < seedCount; i += 1) {
    particles.push(makeParticle(false, i % 9 === 0 ? "near" : i % 3 === 0 ? "mid" : "dust"));
  }

  const drawHeart = (p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotate);
    ctx.scale(p.size / 15, p.size / 15);
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(-10, -4, -8, -14, 0, -8);
    ctx.bezierCurveTo(8, -14, 10, -4, 0, 4);
    ctx.globalAlpha = Math.max(p.life / 140, 0);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
  };

  const drawPetal = (p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotate);
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.42, p.size * 1.7, 0, 0, Math.PI * 2);
    ctx.globalAlpha = Math.max(p.life / 260, 0);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
  };

  const drawDust = (p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalAlpha = Math.min(Math.max(p.life / 260, 0), 0.62);
    ctx.shadowBlur = p.size * 4;
    ctx.shadowColor = p.color;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawGlint = (p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotate);
    ctx.globalAlpha = Math.min(Math.max(p.life / 170, 0), 0.5);
    ctx.shadowBlur = p.size * 2.8;
    ctx.shadowColor = p.color;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.16, p.size * 1.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const tick = () => {
    ctx.clearRect(0, 0, width, height);
    const pageView = document.body.dataset.view || "home";
    const albumActive = pageView === "photoWall";
    const homeActive = pageView === "home";
    const sceneBlend = albumActive ? albumSceneBlend : 0;
    const sceneActive = albumActive && albumSceneMode !== 0 && sceneBlend > 0.18;
    const particleLimit = albumActive ? Math.round(145 + sceneBlend * 82) : homeActive ? 220 : 185;
    if (particles.length < particleLimit && Math.random() > (albumActive ? sceneActive ? 0.16 : 0.46 : homeActive ? 0.34 : 0.44)) particles.push(makeParticle(false, sceneActive && Math.random() > 0.76 ? "near" : "dust"));
    if (sceneActive && particles.length < particleLimit && Math.random() > 0.64) particles.push(makeParticle(false, "mid"));
    if (!albumActive && particles.length < particleLimit && Math.random() > (homeActive ? 0.54 : 0.64)) particles.push(makeParticle(false, "mid"));
    if (!albumActive && particles.length < particleLimit && Math.random() > 0.88) particles.push(makeParticle(false, "near"));

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      const albumFlow = albumActive ? Math.sign(queueVelocity || 1) * (stageMotion + sceneBlend * 0.38) * (p.layer === "near" ? 1.35 : 0.7) : 0;
      p.x += p.speedX + Math.sin(p.life * 0.03) * 0.18 + albumFlow;
      p.y += p.speedY;
      p.rotate += p.spin;
      p.life -= 1;

      if (p.type === "dust") drawDust(p);
      else if (p.type === "glint") drawGlint(p);
      else if (p.type === "heart") drawHeart(p);
      else drawPetal(p);

      if (p.life <= 0 || p.y < -60 || p.x < -80 || p.x > width + 80) particles.splice(i, 1);
    }

    requestAnimationFrame(tick);
  };

  tick();
}

window.burst = () => {};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", init);
