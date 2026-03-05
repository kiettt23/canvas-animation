/**
 * Main animation controller.
 *
 * Manages the particle system, draws connections between nearby particles,
 * and handles user interaction (mouse, controls).
 */
(function () {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  // --- State ---
  let particles = [];
  let particleCount = 120;
  let connectionDist = 150;
  let speedMultiplier = 1.0;
  let colorTheme = 'neon';
  const colorThemes = ['neon', 'ocean', 'sunset', 'aurora'];
  let themeIndex = 0;

  const mouse = { x: null, y: null };

  // --- Canvas Setup ---
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
  });

  // --- Mouse & Touch Tracking ---
  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: false });
  canvas.addEventListener('touchend', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // --- Initialize Particles ---
  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas, colorTheme));
    }
  }

  /**
   * Draw lines between particles that are within connectionDist of each other.
   * Line opacity fades as distance increases — creating a "network" effect.
   */
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDist) {
          const opacity = 1 - dist / connectionDist;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
          ctx.lineWidth = opacity * 1.5;
          ctx.stroke();
        }
      }
    }

    // Draw connections from mouse to nearby particles
    if (mouse.x !== null && mouse.y !== null) {
      for (const p of particles) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDist * 1.5) {
          const opacity = 1 - dist / (connectionDist * 1.5);
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(122, 92, 255, ${opacity * 0.5})`;
          ctx.lineWidth = opacity * 2;
          ctx.stroke();
        }
      }
    }
  }

  /**
   * Main animation loop using requestAnimationFrame.
   * Each frame: clear canvas → draw background → update particles → draw connections → draw particles.
   */
  function animate() {
    // Semi-transparent background for trail effect
    ctx.fillStyle = 'rgba(10, 10, 46, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw each particle
    for (const p of particles) {
      p.update(speedMultiplier, mouse);
      p.draw(ctx);
    }

    // Draw network connections
    drawConnections();

    requestAnimationFrame(animate);
  }

  // --- UI Controls ---
  const countSlider = document.getElementById('particleCount');
  const distSlider = document.getElementById('connectionDist');
  const speedSlider = document.getElementById('speed');
  const toggleBtn = document.getElementById('toggleColors');

  countSlider.addEventListener('input', (e) => {
    particleCount = parseInt(e.target.value);
    document.getElementById('countDisplay').textContent = particleCount;
    initParticles();
  });

  distSlider.addEventListener('input', (e) => {
    connectionDist = parseInt(e.target.value);
    document.getElementById('distDisplay').textContent = connectionDist;
  });

  speedSlider.addEventListener('input', (e) => {
    speedMultiplier = parseFloat(e.target.value) / 10;
    document.getElementById('speedDisplay').textContent = speedMultiplier.toFixed(1);
  });

  toggleBtn.addEventListener('click', () => {
    themeIndex = (themeIndex + 1) % colorThemes.length;
    colorTheme = colorThemes[themeIndex];
    toggleBtn.textContent = `Theme: ${colorTheme}`;
    initParticles();
  });

  // --- Start ---
  initParticles();
  animate();
})();
