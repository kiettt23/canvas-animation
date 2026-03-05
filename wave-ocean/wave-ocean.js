/**
 * Wave Ocean Animation
 *
 * Multiple layers of sine waves stacked to create an ocean effect.
 * Each layer has different speed, amplitude, frequency, and color.
 * Mouse creates ripple distortions. Supports day/night mode.
 */
(function () {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  let layerCount = 5;
  let waveHeight = 50;
  let waveSpeedMult = 1.0;
  let isNight = true;
  let time = 0;

  const mouse = { x: null, y: null };
  const ripples = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: false });
  canvas.addEventListener('touchstart', (e) => {
    ripples.push({ x: e.touches[0].clientX, y: e.touches[0].clientY, radius: 0, maxRadius: 200, alpha: 1 });
  });

  canvas.addEventListener('click', (e) => {
    ripples.push({ x: e.clientX, y: e.clientY, radius: 0, maxRadius: 200, alpha: 1 });
  });

  // Night and day sky color palettes
  const themes = {
    night: {
      skyTop: '#0a0a2e',
      skyBottom: '#001233',
      wavePalette: [
        { r: 0, g: 20, b: 80 },
        { r: 0, g: 40, b: 100 },
        { r: 0, g: 60, b: 120 },
        { r: 0, g: 80, b: 140 },
        { r: 0, g: 100, b: 160 },
        { r: 0, g: 120, b: 180 },
        { r: 0, g: 140, b: 200 },
        { r: 0, g: 160, b: 220 },
      ],
      highlight: 'rgba(200, 220, 255, 0.3)',
    },
    day: {
      skyTop: '#87ceeb',
      skyBottom: '#e0f0ff',
      wavePalette: [
        { r: 0, g: 80, b: 160 },
        { r: 0, g: 100, b: 180 },
        { r: 0, g: 119, b: 182 },
        { r: 0, g: 140, b: 200 },
        { r: 0, g: 160, b: 210 },
        { r: 72, g: 202, b: 228 },
        { r: 144, g: 224, b: 239 },
        { r: 202, g: 240, b: 248 },
      ],
      highlight: 'rgba(255, 255, 255, 0.4)',
    },
  };

  /**
   * Draw the sky gradient and optional celestial bodies.
   */
  function drawSky() {
    const theme = isNight ? themes.night : themes.day;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.5);
    gradient.addColorStop(0, theme.skyTop);
    gradient.addColorStop(1, theme.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isNight) {
      drawMoon();
      drawStars();
    } else {
      drawSun();
    }
  }

  function drawMoon() {
    const x = canvas.width * 0.8;
    const y = canvas.height * 0.12;
    const radius = 40;

    // Moon glow
    const glow = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 4);
    glow.addColorStop(0, 'rgba(200, 220, 255, 0.15)');
    glow.addColorStop(1, 'rgba(200, 220, 255, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.5);

    // Moon
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#e8e8f0';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#aabbee';
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawSun() {
    const x = canvas.width * 0.75;
    const y = canvas.height * 0.1;

    const glow = ctx.createRadialGradient(x, y, 20, x, y, 200);
    glow.addColorStop(0, 'rgba(255, 220, 100, 0.4)');
    glow.addColorStop(0.5, 'rgba(255, 200, 50, 0.1)');
    glow.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.5);

    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#ffaa00';
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawStars() {
    for (let i = 0; i < 60; i++) {
      const sx = (Math.sin(i * 127.1 + 311.7) * 0.5 + 0.5) * canvas.width;
      const sy = (Math.sin(i * 269.5 + 183.3) * 0.5 + 0.5) * canvas.height * 0.35;
      const twinkle = Math.sin(time * 2 + i * 1.7) * 0.5 + 0.5;

      ctx.beginPath();
      ctx.arc(sx, sy, twinkle * 1.2 + 0.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.7})`;
      ctx.fill();
    }
  }

  /**
   * Draw a single wave layer.
   *
   * @param {number} index - Layer index (0 = farthest back)
   * @param {number} totalLayers - Total number of layers
   */
  function drawWaveLayer(index, totalLayers) {
    const theme = isNight ? themes.night : themes.day;
    const palette = theme.wavePalette;

    // Each layer has different parameters
    const layerRatio = index / totalLayers;
    const baseY = canvas.height * (0.4 + layerRatio * 0.35);
    const amplitude = waveHeight * (0.3 + layerRatio * 0.7);
    const frequency = 0.003 + layerRatio * 0.002;
    const speed = (0.5 + layerRatio * 0.8) * waveSpeedMult;
    const colorIdx = Math.floor(layerRatio * (palette.length - 1));
    const color = palette[Math.min(colorIdx, palette.length - 1)];

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    for (let x = 0; x <= canvas.width; x += 2) {
      // Combine multiple sine waves for organic look
      let y = baseY;
      y += Math.sin(x * frequency + time * speed) * amplitude;
      y += Math.sin(x * frequency * 2.3 + time * speed * 1.5 + index) * amplitude * 0.3;
      y += Math.sin(x * frequency * 0.5 + time * speed * 0.7) * amplitude * 0.5;

      // Mouse ripple effect
      if (mouse.x !== null) {
        const dx = x - mouse.x;
        const distFromMouse = Math.abs(dx);
        if (distFromMouse < 200) {
          const rippleStrength = (1 - distFromMouse / 200) * 20;
          y += Math.sin(distFromMouse * 0.05 - time * 5) * rippleStrength;
        }
      }

      ctx.lineTo(x, y);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();

    // Gradient fill for each wave
    const gradientFill = ctx.createLinearGradient(0, baseY - amplitude, 0, canvas.height);
    const alpha = 0.6 + layerRatio * 0.4;
    gradientFill.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
    gradientFill.addColorStop(1, `rgba(${color.r * 0.5}, ${color.g * 0.5}, ${color.b * 0.5}, ${alpha})`);
    ctx.fillStyle = gradientFill;
    ctx.fill();

    // Subtle highlight on wave crests
    if (index === totalLayers - 1) {
      ctx.strokeStyle = theme.highlight;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  /**
   * Update and draw click ripple effects.
   */
  function drawRipples() {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += 3;
      r.alpha -= 0.015;

      if (r.alpha <= 0) {
        ripples.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.5})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  /**
   * Draw light reflection on water surface.
   */
  function drawReflection() {
    const theme = isNight ? themes.night : themes.day;

    // Shimmering light path on water
    const sourceX = isNight ? canvas.width * 0.8 : canvas.width * 0.75;

    for (let i = 0; i < 30; i++) {
      const rx = sourceX + (Math.random() - 0.5) * 150;
      const ry = canvas.height * 0.45 + Math.random() * canvas.height * 0.4;
      const rw = Math.random() * 30 + 5;
      const rh = Math.random() * 3 + 1;
      const shimmer = Math.sin(time * 3 + i * 2) * 0.5 + 0.5;

      ctx.fillStyle = isNight
        ? `rgba(200, 220, 255, ${shimmer * 0.15})`
        : `rgba(255, 220, 100, ${shimmer * 0.2})`;
      ctx.fillRect(rx, ry, rw, rh);
    }
  }

  function animate() {
    time += 0.016;

    drawSky();
    drawReflection();

    for (let i = 0; i < layerCount; i++) {
      drawWaveLayer(i, layerCount);
    }

    drawRipples();

    requestAnimationFrame(animate);
  }

  // Controls
  document.getElementById('layers').addEventListener('input', (e) => {
    layerCount = parseInt(e.target.value);
    document.getElementById('layerDisplay').textContent = layerCount;
  });

  document.getElementById('waveHeight').addEventListener('input', (e) => {
    waveHeight = parseInt(e.target.value);
    document.getElementById('heightDisplay').textContent = waveHeight;
  });

  document.getElementById('waveSpeed').addEventListener('input', (e) => {
    waveSpeedMult = parseFloat(e.target.value) / 10;
    document.getElementById('speedDisplay').textContent = waveSpeedMult.toFixed(1);
  });

  document.getElementById('toggleTime').addEventListener('click', () => {
    isNight = !isNight;
    document.getElementById('toggleTime').textContent = isNight ? 'Switch to Day' : 'Switch to Night';
  });

  animate();
})();
