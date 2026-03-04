# Presentation Script — 4 Canvas Animations

> **Tech stack:** HTML5 Canvas + Vanilla JavaScript (no libraries)
> **Total time:** ~5–7 minutes

---

## 1. Introduction (30s)

> Good morning everyone. Today I will present **four interactive animations** I built using **HTML5 Canvas and JavaScript only** — no libraries.
>
> Each animation demonstrates a different programming concept: **object-oriented programming, 3D projection, recursion, and trigonometry**.

---

## 2. Animation 1 — Particle Network (1 min)

> *(Open index.html)*
>
> This is a **Particle Network**. 120 particles float on screen. When two particles are close, a **line connects them** — like a constellation.
>
> **How it works:**
> - Each particle is an **object** with position, velocity, and color.
> - Every frame, particles move and **bounce off edges**.
> - For every pair, I calculate the **distance** using the Pythagorean theorem. If it's less than 150 pixels, I draw a connecting line.
> - The line **fades** as the distance increases.
> - When you **move the mouse**, particles are **attracted** toward it.
>
> **Key concept:** Object-Oriented Programming — the `Particle` class holds all data and behavior in one place.

---

## 3. Animation 2 — Starfield Galaxy (1 min)

> *(Open starfield/index.html)*
>
> This simulates **flying through space**. Stars rush toward you, creating a **warp speed** effect.
>
> **How it works:**
> - Each star has 3D coordinates: x, y, and **z (depth)**.
> - Every frame, **z decreases** — the star moves closer to the camera.
> - To show it on a 2D screen, I use **perspective projection**: `screenX = x / z`. The smaller the z, the further from center and the bigger the star appears.
> - At high speed, I draw **streak lines** behind each star for the warp trail effect.
> - Moving your mouse **steers** the camera direction.
>
> **Key concept:** 3D-to-2D Projection — turning three-dimensional coordinates into a flat screen using division by depth.

---

## 4. Animation 3 — Fractal Tree (1 min)

> *(Open fractal-tree/index.html)*
>
> This is a **fractal tree** that **grows** in real time.
>
> **How it works:**
> - I use a **recursive function** called `drawBranch()`.
> - It draws one branch, then **calls itself twice** — once for the left child branch, once for the right. Each child is shorter and thinner.
> - This repeats up to **10 levels deep**, creating hundreds of branches from a simple rule.
> - Moving the mouse left or right applies a **wind** effect — all branches sway.
> - At the tips, small **glowing circles** represent leaves or blossoms.
> - The tree **grows gradually** — the allowed recursion depth increases over time.
>
> **Key concept:** Recursion — a function calling itself to build complex structures from a simple pattern.

---

## 5. Animation 4 — Ocean Waves (1 min)

> *(Open wave-ocean/index.html)*
>
> This creates a **layered ocean** with a day/night sky.
>
> **How it works:**
> - Each wave layer is a **sine wave**: `y = sin(x * frequency + time * speed) * amplitude`.
> - I stack **5 layers** with different speeds, heights, and colors. Back layers move slower — this creates a **depth illusion**.
> - To make waves look natural, I combine **3 sine waves** with different frequencies — this breaks the perfect pattern.
> - Moving the mouse creates a **local ripple distortion**. Clicking generates an **expanding ring**.
> - The day/night toggle switches the entire color palette — sky, water, moon/sun, and reflections.
>
> **Key concept:** Trigonometry — sine and cosine functions create smooth, repeating wave motion.

---

## 6. Summary & Comparison (30s)

> | Animation | Core Concept | Math Used |
> |---|---|---|
> | Particle Network | OOP, Classes | Distance formula, vectors |
> | Starfield Galaxy | 3D Projection | Perspective division (x/z) |
> | Fractal Tree | Recursion | Angles, trigonometry |
> | Ocean Waves | Wave Layering | Sine/cosine functions |
>
> All four use the same tools — **Canvas API** and **requestAnimationFrame** for 60fps rendering. No libraries needed.
>
> This shows that with basic **math and programming concepts**, we can create beautiful, interactive visuals in the browser.

---

## 7. Conclusion (20s)

> To wrap up — these animations prove that **simple code can produce complex beauty**. Each one uses a different computer science concept, but they all share the same foundation: a canvas, a loop, and some math.
>
> Thank you. Any questions?

---

## Q&A Preparation

**Q: Why Canvas instead of CSS?**
> Canvas gives pixel-level control for hundreds of objects. CSS is better for UI elements, not custom drawing.

**Q: Which one is the hardest to build?**
> The Fractal Tree — recursion is tricky to debug, and balancing the branch angles took some tuning.

**Q: Can these run on phones?**
> Yes. Canvas works on all modern mobile browsers. We just need to add touch events for interaction.

**Q: What is the performance bottleneck?**
> Particle Network's O(n²) connection check. For 300+ particles, a spatial grid would help. The others are all O(n) per frame.

**Q: Why no libraries like Three.js?**
> To show that these effects don't require heavy frameworks. Understanding the raw math is more educational.
