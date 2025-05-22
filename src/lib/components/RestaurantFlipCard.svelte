<script>
  import { spring } from "svelte/motion";
  import { tick } from 'svelte';

  let flipped = false;
  let added = false;

  const name = "Giant Burger";
  const price = "$99.99";
  const burgerImg = "/img/burger.png";

  // SVG pattern for the back
  const svgPattern = `<svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <g opacity='0.7'>
      <path d='M10 30 Q20 35 30 30 Q20 25 10 30' stroke='#ffb86b' stroke-width='2' fill='none'/>
      <rect x='12' y='12' width='16' height='8' rx='4' stroke='#ffb86b' stroke-width='2' fill='none'/>
      <circle cx='20' cy='20' r='3' stroke='#ffb86b' stroke-width='2' fill='none'/>
    </g>
  </svg>`;
  $: patternUrl = `url('data:image/svg+xml;utf8,${encodeURIComponent(svgPattern)}')`;

  // 3D tilt and shine logic
  let cardEl;
  let springRotate = spring({ x: 0, y: 0 }, { stiffness: 0.066, damping: 0.25 });
  let springGlare = spring({ x: 50, y: 50, o: 0 }, { stiffness: 0.066, damping: 0.25 });

  function interact(e) {
    const rect = cardEl.getBoundingClientRect();
    const absolute = {
      x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
      y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top,
    };
    const percent = {
      x: Math.min(Math.max(Math.round((100 / rect.width) * absolute.x), 0), 100),
      y: Math.min(Math.max(Math.round((100 / rect.height) * absolute.y), 0), 100),
    };
    const center = {
      x: percent.x - 50,
      y: percent.y - 50,
    };
    springRotate.set({ x: -(center.y / 3.5), y: center.x / 2 });
    springGlare.set({ x: percent.x, y: percent.y, o: 1 });
  }
  function interactEnd() {
    springRotate.set({ x: 0, y: 0 });
    springGlare.set({ x: 50, y: 50, o: 0 });
  }

  // Shine/Glare styles
  $: shineStyle = `
    background: linear-gradient(133deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 100%);
    mix-blend-mode: color-dodge;
    opacity: 0.7;
    pointer-events: none;
    border-radius: 2.2em;
  `;
  $: glareStyle = `
    background: radial-gradient(circle at ${$springGlare.x}% ${$springGlare.y}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 80%, transparent 100%);
    mix-blend-mode: lighten;
    opacity: ${$springGlare.o * 0.5};
    pointer-events: none;
    border-radius: 2.2em;
  `;

  // Modern dark gradient background for the card
  $: cardBg = `
    linear-gradient(135deg, #23243a 0%, #23243a 60%, #18181b 100%),
    url('/img/grain.webp') repeat
  `;

  // Add to cart animation
  let plusBtn;
  let plusRot = 0;
  async function addToCart() {
    if (added) return;
    added = true;
    plusRot += 360;
    await tick();
    setTimeout(() => { added = false; }, 900);
  }
</script>

<div class="restaurant-card-outer">
  <div
    class="restaurant-card {flipped ? 'flipped' : ''}"
    bind:this={cardEl}
    tabindex="0"
    on:click={() => (flipped = !flipped)}
    on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (flipped = !flipped)}
    on:pointermove={interact}
    on:pointerleave={interactEnd}
    aria-label="Flip card"
    style="transform: rotateX({$springRotate.x}deg) rotateY({$springRotate.y}deg);"
  >
    <!-- Burger Avatar -->
    <div class="burger-avatar">
      <img src={burgerImg} alt="Giant Burger" draggable="false" />
    </div>
    <!-- Card Front -->
    <div class="card-face card-front">
      <div class="card-bg" style="background: {cardBg};"></div>
      <div class="card-details">
        <h2 class="burger-name shimmer-text">{name}</h2>
        <div class="price-label shimmer-text">{price}</div>
        <button
          class="add-to-cart-btn"
          bind:this={plusBtn}
          on:click|stopPropagation={addToCart}
          style="transform: rotate({plusRot}deg);"
          aria-label="Add to cart"
        >
          <span class="plus-icon">+</span>
        </button>
      </div>
      <div class="card-shine" style={shineStyle}></div>
      <div class="card-glare" style={glareStyle}></div>
    </div>
    <!-- Card Back -->
    <div class="card-face card-back">
      <div class="card-bg" style="background: {cardBg}; opacity: 0.95;"></div>
      <div class="card-pattern" style="background-image: {patternUrl};"></div>
    </div>
    <!-- Pastel Orange Border -->
    <div class="holo-border"></div>
  </div>
</div>

<style>
.restaurant-card-outer {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  perspective: 1200px;
  transition: z-index 0.3s;
}
.restaurant-card {
  width: 340px;
  aspect-ratio: 0.718;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(.22,.61,.36,1), box-shadow 0.4s;
  cursor: pointer;
  outline: none;
  border-radius: 2.2em;
  box-shadow: 0 8px 32px 0 #0002;
  background: none;
}
.restaurant-card.flipped {
  transform: rotateY(180deg);
}
.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 2.2em;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: transparent;
  z-index: 2;
  transition: box-shadow 0.3s;
}
.card-front {
  z-index: 2;
  background: transparent;
}
.card-back {
  transform: rotateY(180deg);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0; top: 0;
  z-index: 1;
  border-radius: 2.2em;
  pointer-events: none;
}
.holo-border {
  pointer-events: none;
  position: absolute;
  z-index: 20;
  left: 0; top: 0; right: 0; bottom: 0;
  border-radius: 2.2em;
  border: 5px solid #ffb86b;
  box-shadow: 0 0 24px 4px #ffe5c2, 0 0 48px 8px #ff9f43;
  transition: border-color 0.3s;
}
.burger-avatar {
  position: absolute;
  left: 50%;
  top: -90px;
  transform: translateX(-50%);
  width: 180px;
  height: 180px;
  z-index: 30;
  background: #ffb86b;
  border-radius: 50%;
  box-shadow: 0 8px 32px 0 #0008, 0 0 0 8px #fff3;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  border: 4px solid #fff8;
}
.burger-avatar img {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.18);
}
.card-details {
  margin-top: 120px;
  text-align: center;
  color: #ff9f43;
  font-family: 'Roboto Condensed', 'Roboto', sans-serif;
  z-index: 3;
  width: 100%;
  position: relative;
}
.burger-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 18px 0;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px #000a;
  color: #ff9f43;
  background: linear-gradient(90deg, #ffb86b, #ff9f43, #ffe5c2, #ffb86b);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 2.5s linear infinite;
}
.price-label {
  font-size: 2.3rem;
  font-weight: 900;
  color: #ffb86b;
  text-shadow: 0 2px 8px #000a;
  margin-bottom: 0;
  background: linear-gradient(90deg, #ffb86b, #ff9f43, #ffe5c2, #ffb86b);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 2.5s linear infinite reverse;
}
@keyframes shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
.add-to-cart-btn {
  margin: 32px auto 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(120deg, #ffb86b 0%, #ffe5c2 100%);
  border: none;
  box-shadow: 0 2px 12px #ff9f4355, 0 0 0 0 #ffe5c255;
  color: #fff;
  font-size: 2.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(.22,.61,.36,1), box-shadow 0.2s, background 0.2s;
  position: relative;
  z-index: 4;
}
.add-to-cart-btn:hover {
  transform: scale(1.12) rotate(-10deg);
  box-shadow: 0 4px 24px #ff9f4355, 0 0 0 8px #ffe5c255;
  background: linear-gradient(120deg, #2ecc40 0%, #b6fcd5 100%);
}
.add-to-cart-btn:active {
  transform: scale(0.98) rotate(10deg);
}
.add-to-cart-btn.added {
  animation: btn-spin 0.9s cubic-bezier(.22,.61,.36,1);
}
@keyframes btn-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.plus-icon {
  display: block;
  font-size: 2.2rem;
  font-weight: bold;
  line-height: 1;
  color: #fff;
  text-shadow: 0 2px 8px #000a;
}
.card-shine, .card-glare {
  pointer-events: none;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0; top: 0;
  z-index: 5;
  border-radius: 2.2em;
}
.card-pattern {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-repeat: repeat;
  background-size: 60px 60px;
  opacity: 0.7;
  z-index: 2;
  transform: rotate(-45deg);
}
</style> 