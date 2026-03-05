/**
 * Fractal Tree Animation
 *
 * Uses recursion to draw a tree that branches at each level.
 * The tree grows with animation and sways in the wind based on mouse position.
 * Leaves (small circles) appear at the tips of the smallest branches.
 */
(function () {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  let maxDepth = 10;
  let branchAngle = 25;
  let windOffset = 0;
  let growthProgress = 0;
  let isGrowing = true;
  let time = 0;
  const mouse = { x: 0.5 };

  // Color palettes for branches (depth-based gradient)
  const branchColors = [
    '#4a3728', '#5a4633', '#6b553e', '#7c6449',
    '#3d6b35', '#2d8a3e', '#1fa34a', '#15b855',
    '#0fcc5f', '#00e066',
  ];

  const leafColors = ['#ff6ec7', '#ff85d5', '#ffb3e6', '#ffd700', '#ff6b6b', '#ff9ff3'];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / canvas.width;
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    mouse.x = e.touches[0].clientX / canvas.width;
  }, { passive: false });

  /**
   * Recursive function to draw a branch.
   *
   * @param {number} x - Start x position
   * @param {number} y - Start y position
   * @param {number} length - Branch length
   * @param {number} angle - Branch angle in radians
   * @param {number} depth - Current recursion depth
   * @param {number} maxGrowDepth - Maximum depth allowed by current growth
   */
  function drawBranch(x, y, length, angle, depth, maxGrowDepth) {
    if (depth > maxGrowDepth || depth > maxDepth || length < 2) return;

    // Calculate branch end point
    const wind = (mouse.x - 0.5) * 0.3 + Math.sin(time * 2 + depth * 0.5) * 0.02;
    const adjustedAngle = angle + wind * (depth / maxDepth);

    const endX = x + Math.cos(adjustedAngle) * length;
    const endY = y + Math.sin(adjustedAngle) * length;

    // Branch thickness decreases with depth
    const thickness = Math.max(1, (maxDepth - depth) * 1.5);

    // Color transitions from brown (trunk) to green (tips)
    const colorIndex = Math.min(depth, branchColors.length - 1);

    // Draw branch
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = branchColors[colorIndex];
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.shadowBlur = depth > 6 ? 5 : 0;
    ctx.shadowColor = branchColors[colorIndex];
    ctx.stroke();
    ctx.shadowBlur = 0;

    // At the tips, draw leaves
    if (depth >= maxDepth - 2 && depth === Math.floor(maxGrowDepth)) {
      drawLeaf(endX, endY, depth);
    }

    // Recurse: two child branches
    const angleRad = (branchAngle * Math.PI) / 180;
    const shrink = 0.68 + Math.random() * 0.08;

    drawBranch(endX, endY, length * shrink, adjustedAngle - angleRad, depth + 1, maxGrowDepth);
    drawBranch(endX, endY, length * shrink, adjustedAngle + angleRad, depth + 1, maxGrowDepth);

    // Sometimes add a third smaller branch
    if (depth < maxDepth - 3 && Math.random() > 0.7) {
      drawBranch(endX, endY, length * shrink * 0.6, adjustedAngle, depth + 1, maxGrowDepth);
    }
  }

  /**
   * Draw a small glowing leaf/blossom at branch tips.
   */
  function drawLeaf(x, y, depth) {
    const color = leafColors[Math.floor(Math.random() * leafColors.length)];
    const size = Math.random() * 4 + 2;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  /**
   * Draw ground with a gradient.
   */
  function drawGround() {
    const groundY = canvas.height * 0.85;
    const gradient = ctx.createLinearGradient(0, groundY, 0, canvas.height);
    gradient.addColorStop(0, '#1a2a15');
    gradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
  }

  /**
   * Draw a subtle starry sky background.
   */
  function drawSky() {
    // Gradient sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.85);
    gradient.addColorStop(0, '#0a0a2e');
    gradient.addColorStop(0.5, '#0f1530');
    gradient.addColorStop(1, '#1a2a15');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Twinkling stars
    for (let i = 0; i < 80; i++) {
      const sx = (Math.sin(i * 127.1 + 311.7) * 0.5 + 0.5) * canvas.width;
      const sy = (Math.sin(i * 269.5 + 183.3) * 0.5 + 0.5) * canvas.height * 0.6;
      const twinkle = Math.sin(time * 3 + i) * 0.5 + 0.5;

      ctx.beginPath();
      ctx.arc(sx, sy, twinkle * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.6})`;
      ctx.fill();
    }
  }

  /**
   * Main animation loop.
   */
  function animate() {
    time += 0.016;

    drawSky();
    drawGround();

    // Growth animation
    if (isGrowing && growthProgress < maxDepth) {
      growthProgress += 0.03;
    }

    // Draw tree from bottom center
    const startX = canvas.width / 2;
    const startY = canvas.height * 0.85;
    const trunkLength = Math.min(canvas.height * 0.2, 150);

    drawBranch(startX, startY, trunkLength, -Math.PI / 2, 0, growthProgress);

    requestAnimationFrame(animate);
  }

  // Controls
  document.getElementById('depth').addEventListener('input', (e) => {
    maxDepth = parseInt(e.target.value);
    document.getElementById('depthDisplay').textContent = maxDepth;
  });

  document.getElementById('angle').addEventListener('input', (e) => {
    branchAngle = parseInt(e.target.value);
    document.getElementById('angleDisplay').textContent = branchAngle;
  });

  document.getElementById('regrow').addEventListener('click', () => {
    growthProgress = 0;
    isGrowing = true;
  });

  animate();
})();
