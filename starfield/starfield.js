/**
 * Starfield Galaxy Animation
 *
 * Simulates flying through a 3D star field using 2D projection.
 * Stars have depth (z-axis) that creates a parallax/warp speed effect.
 * Mouse position steers the camera direction.
 */
(function () {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  let stars = [];
  let starCount = 800;
  let warpSpeed = 1.0;
  const mouse = { x: 0.5, y: 0.5 }; // normalized 0-1

  // Star colors for variety
  const starColors = [
    '#ffffff', '#ffe4b5', '#add8e6', '#ffd700',
    '#ff6ec7', '#87ceeb', '#f0e68c',
  ];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / canvas.width;
    mouse.y = e.clientY / canvas.height;
  });

  /**
   * Each star has x, y (random position in 3D space) and z (depth).
   * As z decreases, the star appears to fly toward the viewer.
   */
  function createStar() {
    return {
      x: (Math.random() - 0.5) * canvas.width * 3,
      y: (Math.random() - 0.5) * canvas.height * 3,
      z: Math.random() * canvas.width,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      brightness: Math.random() * 0.5 + 0.5,
    };
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push(createStar());
    }
  }

  /**
   * Project 3D star position onto 2D screen.
   * Uses perspective division: screenX = x / z, screenY = y / z
   */
  function animate() {
    // Dark background with slight trail
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Mouse offset for steering
    const offsetX = (mouse.x - 0.5) * 100;
    const offsetY = (mouse.y - 0.5) * 100;

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];

      // Move star toward viewer (decrease z)
      star.z -= warpSpeed * 4;

      // Reset star when it passes the camera
      if (star.z <= 0) {
        star.x = (Math.random() - 0.5) * canvas.width * 3;
        star.y = (Math.random() - 0.5) * canvas.height * 3;
        star.z = canvas.width;
        star.brightness = Math.random() * 0.5 + 0.5;
      }

      // 3D to 2D projection
      const projX = (star.x - offsetX) / star.z * 300 + centerX;
      const projY = (star.y - offsetY) / star.z * 300 + centerY;

      // Size based on depth (closer = bigger)
      const size = Math.max(0.1, (1 - star.z / canvas.width) * 4);

      // Brightness based on depth
      const alpha = Math.min(1, (1 - star.z / canvas.width) * star.brightness);

      // Draw star streak (motion trail for warp effect)
      const prevZ = star.z + warpSpeed * 4;
      const prevX = (star.x - offsetX) / prevZ * 300 + centerX;
      const prevY = (star.y - offsetY) / prevZ * 300 + centerY;

      if (warpSpeed > 1.5) {
        // Draw streak line at high speed
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(projX, projY);
        ctx.strokeStyle = star.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#', '');
        // Use hex alpha approach
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = star.color;
        ctx.lineWidth = size * 0.8;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Draw star dot
      ctx.beginPath();
      ctx.arc(projX, projY, size, 0, Math.PI * 2);
      ctx.fillStyle = star.color;
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = size * 5;
      ctx.shadowColor = star.color;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Central glow effect (galaxy core)
    const gradient = ctx.createRadialGradient(
      centerX + offsetX * 0.5, centerY + offsetY * 0.5, 0,
      centerX + offsetX * 0.5, centerY + offsetY * 0.5, 200
    );
    gradient.addColorStop(0, 'rgba(100, 50, 200, 0.03)');
    gradient.addColorStop(0.5, 'rgba(50, 20, 100, 0.02)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(animate);
  }

  // Controls
  document.getElementById('starCount').addEventListener('input', (e) => {
    starCount = parseInt(e.target.value);
    document.getElementById('countDisplay').textContent = starCount;
    initStars();
  });

  document.getElementById('warpSpeed').addEventListener('input', (e) => {
    warpSpeed = parseFloat(e.target.value) / 10;
    document.getElementById('speedDisplay').textContent = warpSpeed.toFixed(1);
  });

  initStars();
  animate();
})();
