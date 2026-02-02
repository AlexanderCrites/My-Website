function setVH() {
  document.documentElement.style.setProperty(
    '--vh',
    `${window.innerHeight * 0.01}px`
  );
}

setVH();
window.addEventListener('resize', setVH);

// ==========================================================
// GLOBAL STATE & HELPERS
// ==========================================================
let ticking = false;
let viewportHeight = window.innerHeight;
let viewportWidth = window.innerWidth;

function clamp(v, min = 0, max = 1) {
  return Math.min(Math.max(v, min), max);
}

function isMobile() {
  return window.matchMedia("(max-width: 768px)").matches;
}

window.addEventListener("resize", () => {
  viewportHeight = window.innerHeight;
  viewportWidth = window.innerWidth;
  recalc();
});

// ==========================================================
// HIDE HEADER
// ==========================================================
let lastScrollY = window.scrollY;
const topDiv = document.getElementById("topDiv");
const delta = 5;

function handleHeaderHide() {
  const currentScroll = window.scrollY;

  if (Math.abs(currentScroll - lastScrollY) > delta) {
    if (currentScroll > lastScrollY) {
      topDiv?.classList.add("hidden");
    } else {
      topDiv?.classList.remove("hidden");
    }
    lastScrollY = currentScroll;
  }
}

// ==========================================================
// DROPDOWN HEADER
// ==========================================================
const menu = document.querySelector(".header-right5");
const button = document.querySelector(".header-right5-button");
const dropdownLinks = menu?.querySelectorAll(
  ".dropdown-header-right1 a, .dropdown-header-right2 a, .dropdown-header-right3 a, .dropdown-header-right4 a"
);

button?.addEventListener("click", (e) => {
  e.preventDefault();
  const isOpen = menu.classList.toggle("open");
  button.setAttribute("aria-expanded", isOpen);
});

dropdownLinks?.forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("click", (e) => {
  if (menu && !menu.contains(e.target)) {
    menu.classList.remove("open");
    button?.setAttribute("aria-expanded", "false");
  }
});

// ==========================================================
// COPY TO CLIPBOARD
// ==========================================================
document.querySelectorAll(".copy-text").forEach((el) => {
  el.addEventListener("click", () => {
    const text = el.dataset.copy || el.innerText;

    navigator.clipboard.writeText(text).then(() => {
      el.classList.add("copied");
      setTimeout(() => el.classList.remove("copied"), 750);
    });
  });
});

// ==========================================================
// THIS IS THE VIDEO SCROLL PLAYBACK SCRIPT
// ==========================================================
const hero = document.querySelector(".hero-container");
const video = document.getElementById("vid");

let heroTop = 0;
let heroHeight = 0;
let lastVideoTime = 0;

function recalc() {
  if (!hero) return;
  const rect = hero.getBoundingClientRect();
  heroTop = rect.top + window.scrollY;
  heroHeight = hero.offsetHeight;
}

/** Syncs the video playback to scroll */
function syncVideoToScroll() {
  if (!hero || !video) return;

  const scrollY = window.scrollY;

  // Linear progress: 0 at top of hero, 1 at bottom of hero
  const start = heroTop;
  const end = heroTop + heroHeight - viewportHeight;
  const maxScroll = end - start;

  if (maxScroll <= 0) return;

  let progress = (scrollY - start) / maxScroll;
  progress = clamp(progress);

  // Update video currentTime (FPS-safe)
  if (!isNaN(video.duration) && video.duration > 0) {
    const targetTime = progress * video.duration;

    if (Math.abs(targetTime - lastVideoTime) > 0.042) {
      video.currentTime = targetTime;
      lastVideoTime = targetTime;
    }
  }
}

/** Initialize scroll syncing */
function initVideoScroll() {
  recalc();
  syncVideoToScroll();
}

// Defer until hero is visible (perf only — not correctness)
if (hero && video) {
  recalc();

  const heroObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        recalc();
        syncVideoToScroll();
      }
    },
    { threshold: 0.02 }
  );

  heroObserver.observe(hero);

  // If video metadata is already loaded (cached), init immediately
  if (video.readyState >= 1) {
    initVideoScroll();
  } else {
    // Otherwise wait for metadata to load
    video.addEventListener("loadedmetadata", initVideoScroll, { once: true });
  }

  // Optional: handle videos that take a bit to be seekable
  video.addEventListener("canplay", () => {
    syncVideoToScroll();
  });
}


// ==========================================================
// THIS IS THE FADE AND SLIDE ANIMATIONS SCRIPT
// ==========================================================
const hero2 = document.querySelector(".hero-container");
const title = document.querySelector(".hero-title-container");
const blackBg = document.querySelector(".black-fade");
const scrollSymbol = document.querySelector(".scroll-symbol");

let heroAnimVisible = false;

// 🔧 Force initial hidden state to prevent flash on reload
if (scrollSymbol) {
  scrollSymbol.style.opacity = "0";
}

if (hero2) {
  const heroAnimObserver = new IntersectionObserver(
    (entries) => {
      heroAnimVisible = entries[0].isIntersecting;

      if (heroAnimVisible) {
        // 🔧 Immediate sync when hero becomes visible
        updateScrollAnimations();
      }
    },
    { threshold: 0.1 }
  );

  heroAnimObserver.observe(hero2);
}

function updateScrollAnimations() {
  if (!hero2 || !heroAnimVisible) return;

  const rect = hero2.getBoundingClientRect();
  const heroHeight = hero2.offsetHeight;

  const maxScroll = heroHeight - viewportHeight;
  const scrolled = clamp(-rect.top, 0, maxScroll);
  const progress = maxScroll === 0 ? 0 : scrolled / maxScroll;

  // Scroll symbol
  let symbolProgress = clamp((progress - 0.0) / 0.05);
  const symbolOpacity = 1 - symbolProgress;
  if (scrollSymbol) scrollSymbol.style.opacity = symbolOpacity;

  // Title
  let titleProgress = clamp((progress - 0.21) / 0.41);
  const titleOpacity = 1 - titleProgress;
  const titleScale = 1 - titleProgress * 0.3;
  if (title) {
    title.style.opacity = titleOpacity;
    title.style.transform = `scale(${titleScale})`;
  }

  // Fade to black
  let fadeProgress = clamp((progress - 0.87) / 0.13);
  if (blackBg) blackBg.style.opacity = fadeProgress;
}

// 🔧 Initial sync for reload-in-middle cases
requestAnimationFrame(updateScrollAnimations);


// ==========================================================
// THIS IS THE FADE SCRIPT
// ==========================================================
function svhToPx(svh) {
  return window.innerHeight * (svh / 100);
}

const FADE_DISTANCE_SVH = 50;

const stickyFades = [
  {
    container: document.querySelector('.sticky-img-container1'),
    img: document.querySelector('.sticky-img1')
  },
  {
    container: document.querySelector('.sticky-img-container2'),
    img: document.querySelector('.sticky-img2')
  },
  {
    container: document.querySelector('.sticky-img-container3'),
    img: document.querySelector('.sticky-img3')
  }
];

function updateStickyFades() {
  const fadeDistance = svhToPx(FADE_DISTANCE_SVH);

  stickyFades.forEach(({ container, img }) => {
    if (!container || !img) return; // 🔒 CRITICAL SAFETY GUARD

    const rect = container.getBoundingClientRect();
    let progress = -rect.top / fadeDistance;
    progress = clamp(progress, 0, 1);

    img.style.opacity = progress;
  });
}


// ==========================================================
// THIS IS THE HORIZONTAL SCROLL SCRIPT
// ==========================================================
// ==========================================================
// THIS IS THE HORIZONTAL SCROLL SCRIPT (MULTI-INSTANCE SAFE)
// ==========================================================
const horizontalSections = document.querySelectorAll(".horizontal-scroll-section");

// prepare each section
horizontalSections.forEach(section => {
  const track = section.querySelector(".image-track");
  if (!track) return;

  // Force layer promotion early (prevents Chrome pop-in)
  track.style.willChange = "transform";
  track.style.transform = "translateY(-50%) translateX(0px)";

  function updateHorizontalScroll() {
    const rect = section.getBoundingClientRect();
    const totalScroll = section.offsetHeight - viewportHeight;

    if (totalScroll <= 0) return;

    const scrolled = clamp(-rect.top, 0, totalScroll);
    const progress = scrolled / totalScroll;

    const trackWidth = track.scrollWidth;

    const startX = 0;
    const endX = viewportWidth - trackWidth;
    const currentX = startX + (endX - startX) * progress;

    track.style.transform =
      `translateY(-50%) translateX(${currentX}px)`;
  }

  // store updater on the element (no globals added)
  section._updateHorizontalScroll = updateHorizontalScroll;

  // initial sync (prevents first-frame flash)
  updateHorizontalScroll();
});


// ==========================================================
// Image Carousel Next & Previous Buttons
// ==========================================================
const slider = document.getElementById("slider");
const slides = slider?.querySelectorAll(".carousel-image");
const prevBtn = document.querySelector(".button-previous");
const nextBtn = document.querySelector(".button-next");
const dots = document.querySelectorAll(".slider-nav a");

let currentIndex = 0;

/* AUTOPLAY STATE */
let autoPlayEnabled = true;
let autoPlayInterval = null;
const AUTO_PLAY_DELAY = 3500;

let carouselVisible = false;

function goToSlide(index) {
  if (!slides || !slider) return;

  if (index < 0) {
    currentIndex = slides.length - 1;
  } else if (index >= slides.length) {
    currentIndex = 0;
  } else {
    currentIndex = index;
  }

  const slideWidth = slides[0].offsetWidth;

  slider.scrollTo({
    left: slideWidth * currentIndex,
    behavior: "smooth",
  });

  updateDots();
}

function updateDots() {
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });
}

function startAutoPlay() {
  if (autoPlayInterval || !carouselVisible) return;

  autoPlayInterval = setInterval(() => {
    if (autoPlayEnabled) {
      goToSlide(currentIndex + 1);
    }
  }, AUTO_PLAY_DELAY);
}

function stopAutoPlay() {
  autoPlayEnabled = false;
  clearInterval(autoPlayInterval);
  autoPlayInterval = null;
}

prevBtn?.addEventListener("click", () => {
  stopAutoPlay();
  goToSlide(currentIndex - 1);
});

nextBtn?.addEventListener("click", () => {
  stopAutoPlay();
  goToSlide(currentIndex + 1);
});

dots.forEach((dot, index) => {
  dot.addEventListener("click", (e) => {
    e.preventDefault();
    stopAutoPlay();
    goToSlide(index);
  });
});

/* DEFER AUTOPLAY UNTIL VISIBLE */
if (slider) {
  const carouselObserver = new IntersectionObserver(
    (entries) => {
      carouselVisible = entries[0].isIntersecting;

      if (carouselVisible) {
        autoPlayEnabled = true;
        startAutoPlay();
      } else {
        stopAutoPlay();
      }
    },
    { threshold: 0.0 }
  );

  carouselObserver.observe(slider);
}

updateDots();

// ==========================================================
// CV VIDEO AUTOPLAY
// ==========================================================
const cvVideo = document.querySelector(".cv-video");

if (cvVideo) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          cvVideo.play().catch(() => {});
        } else {
          cvVideo.pause();
        }
      });
    },
    { threshold: 0.0 }
  );

  observer.observe(cvVideo);
}

// ==========================================================
// ONE RAF-THROTTLED SCROLL LOOP
// ==========================================================
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      handleHeaderHide();
      syncVideoToScroll();
      updateScrollAnimations();
      updateStickyFades();

      horizontalSections.forEach(section => {
        section._updateHorizontalScroll?.();
      });

      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener("scroll", onScroll);
