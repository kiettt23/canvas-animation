/**
 * Particle class - represents a single particle in the network.
 *
 * Each particle has position (x, y), velocity (vx, vy), radius, and color.
 * Particles bounce off canvas edges and can be attracted toward the mouse.
 */
class Particle {
  constructor(canvas, colorTheme) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.radius = Math.random() * 2.5 + 1;
    this.baseRadius = this.radius;
    this.color = this.pickColor(colorTheme);
  }

  /**
   * Pick a random color from the current theme palette.
   */
  pickColor(theme) {
    const themes = {
      neon: ['#00d2ff', '#7a5cff', '#ff6ec7', '#00ffa3', '#ffee00'],
      ocean: ['#006994', '#00b4d8', '#48cae4', '#90e0ef', '#caf0f8'],
      sunset: ['#ff6b35', '#f7c59f', '#efefd0', '#004e89', '#1a659e'],
      aurora: ['#00ff87', '#60efff', '#7b2ff7', '#ff2079', '#ffdf00'],
    };
    const palette = themes[theme] || themes.neon;
    return palette[Math.floor(Math.random() * palette.length)];
  }

  /**
   * Update particle position each frame.
   * - Apply velocity with speed multiplier
   * - Bounce off canvas edges
   * - Attract toward mouse when nearby
   */
  update(speedMultiplier, mouse) {
    // Move particle
    this.x += this.vx * speedMultiplier;
    this.y += this.vy * speedMultiplier;

    // Bounce off edges
    if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;

    // Keep inside canvas
    this.x = Math.max(0, Math.min(this.canvas.width, this.x));
    this.y = Math.max(0, Math.min(this.canvas.height, this.y));

    // Mouse attraction effect
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 200) {
        // Gentle pull toward mouse
        const force = (200 - dist) / 200 * 0.02;
        this.vx += dx * force;
        this.vy += dy * force;

        // Grow particle near mouse
        this.radius = this.baseRadius + (200 - dist) / 200 * 2;
      } else {
        this.radius = this.baseRadius;
      }
    }

    // Limit max speed to prevent particles flying off
    const maxSpeed = 3 * speedMultiplier;
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (currentSpeed > maxSpeed) {
      this.vx = (this.vx / currentSpeed) * maxSpeed;
      this.vy = (this.vy / currentSpeed) * maxSpeed;
    }
  }

  /**
   * Draw the particle as a glowing circle.
   */
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
