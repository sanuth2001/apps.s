/* ═══════════════════════════════════════════════════════
   VALENTINE SURPRISE — MAIN SCRIPT
   Handles animations, typewriter, game logic, confetti
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── DOM References ──────────────────────────────── */
  const openHeartBtn = document.getElementById('open-heart-btn');
  const typewriterEl = document.getElementById('typewriter');
  const cursorEl = document.getElementById('cursor');
  const scoreEl = document.getElementById('score');
  const gameArea = document.getElementById('game-area');
  const startGameBtn = document.getElementById('start-game-btn');
  const modal = document.getElementById('game-modal');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const celebration = document.getElementById('celebration');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const musicToggle = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  const musicLabel = musicToggle.querySelector('.music-label');
  let musicPlaying = false;

  /* ═══════════════════════════════════════════════════
     1. FLOATING HEARTS (Landing Background)
     ═══════════════════════════════════════════════════ */
  const heartsContainer = document.querySelector('.floating-hearts');
  const heartEmojis = ['💖', '💕', '💗', '💓', '💘', '💝', '🩷', '♥️'];

  function createFloatingHeart() {
    const heart = document.createElement('span');
    heart.classList.add('floating-heart');
    heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.setProperty('--duration', (6 + Math.random() * 8) + 's');
    heart.style.setProperty('--delay', (Math.random() * 2) + 's');
    heart.style.fontSize = (16 + Math.random() * 24) + 'px';
    heartsContainer.appendChild(heart);

    // Remove after animation completes to avoid DOM bloat
    const totalTime = parseFloat(heart.style.getPropertyValue('--duration')) +
      parseFloat(heart.style.getPropertyValue('--delay'));
    setTimeout(() => heart.remove(), totalTime * 1000 + 500);
  }

  // Spawn hearts continuously
  function spawnHearts() {
    createFloatingHeart();
    setTimeout(spawnHearts, 400 + Math.random() * 600);
  }
  // Create initial batch
  for (let i = 0; i < 15; i++) {
    setTimeout(createFloatingHeart, i * 300);
  }
  spawnHearts();

  /* ═══════════════════════════════════════════════════
     2. NAVIGATION & SCROLL CONTROL
     ═══════════════════════════════════════════════════ */
  const sections = document.querySelectorAll('section');
  let currentSectionIndex = 0;

  function scrollToSection(index) {
    if (index < 0 || index >= sections.length) return;
    currentSectionIndex = index;
    sections[index].scrollIntoView({ behavior: 'smooth' });
  }

  // "Open My Heart" -> Go to Message (Index 1) AND Play Music
  openHeartBtn.addEventListener('click', () => {
    scrollToSection(1);
    if (!musicPlaying) {
      bgMusic.volume = 0.5;
      bgMusic.play().catch(e => console.log("Audio play failed:", e));
      musicPlaying = true;
      musicToggle.classList.add('playing');
      if (musicLabel) musicLabel.textContent = 'Pause';
    }
  });

  // Navigation Buttons
  const navToReasonsBtn = document.getElementById('nav-to-reasons');
  if (navToReasonsBtn) {
    navToReasonsBtn.addEventListener('click', () => scrollToSection(2));
  }

  const navToGameBtn = document.getElementById('nav-to-game');
  if (navToGameBtn) {
    navToGameBtn.addEventListener('click', () => scrollToSection(3));
  }

  // Block default scroll (wheel & touch) but keep programmatic scroll
  // REMOVED: To allow internal scrolling on mobile
  // window.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
  // window.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

  // Optional: Allow Arrow Keys to navigate
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      scrollToSection(currentSectionIndex + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      scrollToSection(currentSectionIndex - 1);
    }
  });

  /* ═══════════════════════════════════════════════════
     3. INTERSECTION OBSERVER — REVEAL ANIMATIONS
     ═══════════════════════════════════════════════════ */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // only trigger once
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ═══════════════════════════════════════════════════
     4. TYPEWRITER EFFECT
     ═══════════════════════════════════════════════════ */
  const typewriterLines = [
    "I don't know why... my heart just beats differently.",
    "There's something about you that makes everything feel brighter, softer, and alive.",
    "And I can't help but feel this quietly, beautifully... just for you. 💖"
  ];
  const fullText = typewriterLines.join('\n');
  let typewriterStarted = false;
  let charIndex = 0;

  function typeChar() {
    if (charIndex < fullText.length) {
      typewriterEl.textContent += fullText[charIndex];
      charIndex++;
      const delay = fullText[charIndex - 1] === '\n' ? 600 :
        fullText[charIndex - 1] === '.' ? 400 :
          fullText[charIndex - 1] === ',' ? 200 : 50;
      setTimeout(typeChar, delay);
    } else {
      // Typing done — hide cursor and show Next button
      setTimeout(() => {
        cursorEl.style.display = 'none';
        if (navToReasonsBtn) {
          navToReasonsBtn.classList.remove('hidden');
          navToReasonsBtn.style.animation = 'fadeInUp 1s forwards';
        }
      }, 1000);
    }
  }

  // Trigger typewriter when section is in view
  const messageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !typewriterStarted) {
        typewriterStarted = true;
        setTimeout(typeChar, 600); // small initial delay
        messageObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  messageObserver.observe(document.getElementById('message'));

  /* ═══════════════════════════════════════════════════
     5. HEART CATCHING GAME
     ═══════════════════════════════════════════════════ */
  let score = 0;
  let gameRunning = false;
  let gameInterval = null;
  const TARGET_SCORE = 10;
  const gameHeartEmojis = ['❤️', '💖', '💗', '💕', '💘', '🩷'];

  startGameBtn.addEventListener('click', startGame);

  function startGame() {
    score = 0;
    scoreEl.textContent = '0';
    gameRunning = true;

    // Remove placeholder
    const placeholder = gameArea.querySelector('.game-placeholder');
    if (placeholder) placeholder.remove();

    // Spawn hearts at intervals
    gameInterval = setInterval(spawnGameHeart, 600);
  }

  function spawnGameHeart() {
    if (!gameRunning) return;

    const heart = document.createElement('span');
    heart.classList.add('game-heart');
    heart.textContent = gameHeartEmojis[Math.floor(Math.random() * gameHeartEmojis.length)];

    // Random horizontal position within game area
    const areaWidth = gameArea.offsetWidth;
    const x = Math.random() * (areaWidth - 40);
    heart.style.left = x + 'px';

    // Random fall speed
    const fallDuration = 2 + Math.random() * 2;
    heart.style.setProperty('--fall-duration', fallDuration + 's');

    // Click handler
    heart.addEventListener('click', () => catchHeart(heart));

    gameArea.appendChild(heart);

    // Remove when animation ends
    setTimeout(() => {
      if (heart.parentNode) heart.remove();
    }, fallDuration * 1000 + 100);
  }

  function catchHeart(heartEl) {
    if (!gameRunning) return;
    heartEl.classList.add('caught');
    score++;
    scoreEl.textContent = score;

    // Pop animation on score
    scoreEl.classList.add('pop');
    setTimeout(() => scoreEl.classList.remove('pop'), 200);

    // Remove caught heart
    setTimeout(() => heartEl.remove(), 400);

    // Win condition
    if (score >= TARGET_SCORE) {
      gameRunning = false;
      clearInterval(gameInterval);
      // Remove remaining hearts
      gameArea.querySelectorAll('.game-heart').forEach(h => h.remove());
      // Show modal
      setTimeout(showModal, 600);
    }
  }

  /* ═══════════════════════════════════════════════════
     6. MODAL — YES / THINK AGAIN
     ═══════════════════════════════════════════════════ */
  function showModal() {
    modal.classList.add('active');
  }

  function hideModal() {
    modal.classList.remove('active');
  }

  // "YES" button → celebration
  btnYes.addEventListener('click', () => {
    hideModal();
    triggerCelebration();
  });

  // "Think Again" button → dodges the cursor!
  btnNo.addEventListener('mouseover', dodgeButton);
  btnNo.addEventListener('touchstart', dodgeButton);
  btnNo.addEventListener('focus', dodgeButton);

  function dodgeButton() {
    const modalCard = document.querySelector('.modal-card');
    const cardRect = modalCard.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();

    // Calculate max offsets within the modal card
    const maxX = cardRect.width - btnRect.width - 20;
    const maxY = cardRect.height - btnRect.height - 20;

    const randomX = Math.random() * maxX - maxX / 2;
    const randomY = Math.random() * maxY - maxY / 2;

    btnNo.style.position = 'relative';
    btnNo.style.transform = `translate(${randomX}px, ${randomY}px)`;
  }

  /* ═══════════════════════════════════════════════════
     7. CELEBRATION + CONFETTI
     ═══════════════════════════════════════════════════ */
  function triggerCelebration() {
    scrollToSection(4); // Scroll to Final/Background section
    celebration.classList.remove('hidden');
    launchConfetti();
  }

  function launchConfetti() {
    const canvas = confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiColors = [
      '#ff6b9d', '#c084fc', '#ffd54f', '#f48fb1',
      '#e91e63', '#9c27b0', '#ff9800', '#4caf50',
      '#2196f3', '#ffffff'
    ];

    const particles = [];
    const PARTICLE_COUNT = 200;

    // Create particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }

    function animateConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let aliveCount = 0;
      particles.forEach(p => {
        if (p.opacity <= 0) return;
        aliveCount++;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity
        p.rotation += p.rotationSpeed;
        p.vx *= 0.99; // air resistance

        // Fade out when past 80% of screen
        if (p.y > canvas.height * 0.8) {
          p.opacity -= 0.02;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      if (aliveCount > 0) {
        requestAnimationFrame(animateConfetti);
      }
    }

    animateConfetti();

    // Launch more waves
    setTimeout(() => launchWave(150), 1000);
    setTimeout(() => launchWave(100), 2500);

    function launchWave(count) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -20,
          w: 6 + Math.random() * 8,
          h: 4 + Math.random() * 6,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          vx: (Math.random() - 0.5) * 6,
          vy: 2 + Math.random() * 5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 12,
          opacity: 1,
          shape: Math.random() > 0.5 ? 'rect' : 'circle'
        });
      }
    }
  }

  // Resize confetti canvas on window resize
  window.addEventListener('resize', () => {
    if (confettiCanvas) {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
  });

  /* ═══════════════════════════════════════════════════
     8. MUSIC TOGGLE
     ═══════════════════════════════════════════════════ */
  // let musicPlaying = false; // Moved to top scope

  musicToggle.addEventListener('click', () => {
    if (musicPlaying) {
      bgMusic.pause();
      musicToggle.classList.remove('playing');
      musicLabel.textContent = 'Play';
    } else {
      bgMusic.volume = 0.4;
      bgMusic.play().catch(() => {
        // Autoplay may be blocked — that's OK
        console.log('Music playback requires user interaction first.');
      });
      musicToggle.classList.add('playing');
      musicLabel.textContent = 'Pause';
    }
    musicPlaying = !musicPlaying;
  });

  /* ═══════════════════════════════════════════════════
     9. FINAL SECTION — SPARKLE PARTICLES
     ═══════════════════════════════════════════════════ */
  const finalSection = document.getElementById('final');

  function createSparkle() {
    const sparkle = document.createElement('span');
    sparkle.textContent = '✨';
    sparkle.style.cssText = `
      position: absolute;
      font-size: ${8 + Math.random() * 16}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      opacity: 0;
      pointer-events: none;
      animation: sparkleAnim ${1.5 + Math.random() * 2}s forwards;
    `;
    finalSection.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 4000);
  }

  // Add sparkle keyframes dynamically
  const sparkleStyle = document.createElement('style');
  sparkleStyle.textContent = `
    @keyframes sparkleAnim {
      0% { opacity: 0; transform: scale(0) rotate(0deg); }
      50% { opacity: 1; transform: scale(1) rotate(180deg); }
      100% { opacity: 0; transform: scale(0.5) rotate(360deg); }
    }
  `;
  document.head.appendChild(sparkleStyle);

  // Only sparkle when section is visible
  const finalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sparkleInterval = setInterval(createSparkle, 300);
        // Stop after 20 seconds to avoid performance issues
        setTimeout(() => clearInterval(sparkleInterval), 20000);
        finalObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  finalObserver.observe(finalSection);

  // Final Proposal Logic
  const finalYes = document.getElementById('final-yes');
  const finalNo = document.getElementById('final-no');

  if (finalYes) {
    finalYes.addEventListener('click', () => {
      // Trigger confetti
      if (typeof launchConfetti === 'function') {
        launchConfetti();
      }

      const phone = "94779275387";
      const message = "I just finished your Valentine surprise 💖 Yes… YES 💕 💖 Forever With You❤️";
      const waURL = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

      // Delay slightly so confetti is seen before redirect
      setTimeout(() => {
        window.open(waURL, '_blank');
      }, 1500);
    });
  }

  if (finalNo) {
    const moveButton = () => {
      const container = document.querySelector('.final-proposal');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const btnRect = finalNo.getBoundingClientRect();

      // Ensure the button is within the proposal box boundaries
      // We'll use a safer range that keeps it inside the padding
      const padding = 20;
      const maxX = (containerRect.width - btnRect.width) / 2 - padding;
      const maxY = (containerRect.height - btnRect.height) / 2 - padding;

      // Calculate random translation
      const randomX = (Math.random() * (maxX * 2)) - maxX;
      const randomY = (Math.random() * (maxY * 2)) - maxY;

      finalNo.style.position = 'relative';
      finalNo.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      finalNo.style.transform = `translate(${randomX}px, ${randomY}px)`;
      finalNo.style.zIndex = '10000';

      // Playful shake effect
      finalNo.classList.add('shake');
      setTimeout(() => finalNo.classList.remove('shake'), 400);
    };

    finalNo.addEventListener('mouseover', moveButton);
    finalNo.addEventListener('click', (e) => {
      e.preventDefault();
      moveButton();
    });
    // For mobile
    finalNo.addEventListener('touchstart', (e) => {
      e.preventDefault();
      setTimeout(moveButton, 10);
    });
  }
});
