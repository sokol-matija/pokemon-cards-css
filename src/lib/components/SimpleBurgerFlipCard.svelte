<script>
  // Burger properties
  export let name = "Simple Flip Burger";
  export let price = "$9.99";
  
  // image props
  export let front = "/img/burger.png";
  export let back = "/img/pattern.svg";

  let flipped = false;

  // SVG pattern for the back
  const svgPattern = `<svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <g opacity='0.7'>
      <path d='M10 30 Q20 35 30 30 Q20 25 10 30' stroke='#ffb86b' stroke-width='2' fill='none'/>
      <rect x='12' y='12' width='16' height='8' rx='4' stroke='#ffb86b' stroke-width='2' fill='none'/>
      <circle cx='20' cy='20' r='3' stroke='#ffb86b' stroke-width='2' fill='none'/>
    </g>
  </svg>`;
  
  function flipCard() {
    flipped = !flipped;
  }
</script>

<div class="simple-flip-card-outer">
  <div
    class="simple-flip-card {flipped ? 'flipped' : ''}"
    tabindex="0"
    on:click={flipCard}
    on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && flipCard()}
    aria-label="Flip card"
  >
    <!-- Card Front -->
    <div class="card-face card-front">
      <div class="card-bg"></div>
      
      <!-- Burger Avatar -->
      <div class="burger-avatar">
        <img src={front} alt={name} draggable="false" />
      </div>
      
      <!-- Card Content -->
      <div class="card-details">
        <h2 class="burger-name shimmer-text">{name}</h2>
        <div class="price-label shimmer-text">{price}</div>
        <button
          class="add-to-cart-btn"
          on:click|stopPropagation={() => {}}
          aria-label="Add to cart"
        >
          <span class="plus-icon">+</span>
        </button>
      </div>
      
      <!-- Effects -->
      <div class="card-shine"></div>
      <div class="card-glare"></div>
    </div>
    
    <!-- Card Back -->
    <div class="card-face card-back">
      <div class="card-bg"></div>
      <div class="card-pattern"></div>
    </div>
    
    <!-- Pastel Orange Border -->
    <div class="holo-border"></div>
  </div>
</div>

<style>
  .simple-flip-card-outer {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 500px;
    perspective: 1200px;
    margin: 0 auto;
  }
  
  .simple-flip-card {
    position: relative;
    width: 340px;
    aspect-ratio: 0.718;
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(.22,.61,.36,1);
    cursor: pointer;
    margin: 0 auto;
  }
  
  .simple-flip-card.flipped {
    transform: rotateY(180deg);
  }
  
  .card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    backface-visibility: hidden;
    border-radius: 2.2em;
    overflow: hidden;
    box-shadow: 0 8px 32px 0 rgba(0,0,0,0.1);
  }
  
  .card-back {
    transform: rotateY(180deg);
  }
  
  .card-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0; top: 0;
    border-radius: 2.2em;
    background: linear-gradient(135deg, #23243a 0%, #23243a 60%, #18181b 100%), url('/img/grain.webp') repeat;
    z-index: 1;
  }
  
  .card-back .card-bg {
    opacity: 0.95;
  }
  
  .card-pattern {
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    background-image: url('data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7"><path d="M10 30 Q20 35 30 30 Q20 25 10 30" stroke="%23ffb86b" stroke-width="2" fill="none"/><rect x="12" y="12" width="16" height="8" rx="4" stroke="%23ffb86b" stroke-width="2" fill="none"/><circle cx="20" cy="20" r="3" stroke="%23ffb86b" stroke-width="2" fill="none"/></g></svg>');
    background-repeat: repeat;
    background-size: 60px 60px;
    opacity: 0.7;
    z-index: 2;
    transform: rotate(-45deg);
    border-radius: 2.2em;
  }
  
  .card-shine,
  .card-glare {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 2.2em;
    pointer-events: none;
    z-index: 20;
  }
  
  .card-shine {
    background: linear-gradient(133deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 100%);
    mix-blend-mode: color-dodge;
    opacity: 0.7;
  }
  
  .card-glare {
    background: radial-gradient(circle at 50% 50%, 
                rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 80%, transparent 100%);
    mix-blend-mode: lighten;
    opacity: 0.2;
  }
  
  .holo-border {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border: 2px solid rgba(255, 184, 107, 0.5);
    border-radius: 2.2em;
    box-shadow: 0 0 8px rgba(255, 184, 107, 0.5);
    z-index: 0;
    pointer-events: none;
  }
  
  .burger-avatar {
    position: absolute;
    left: 50%;
    top: 10px;
    transform: translateX(-50%);
    width: 200px;
    height: 200px;
    z-index: 10;
    background: #ffb86b;
    border-radius: 50%;
    box-shadow: 0 8px 32px 0 rgba(0,0,0,0.5), 0 0 0 8px rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
    border: 4px solid rgba(255,255,255,0.5);
  }
  
  .burger-avatar img {
    width: 240px;
    height: 240px;
    object-fit: contain;
    border-radius: 50%;
    transform: scale(1.2);
  }
  
  .card-details {
    margin-top: 220px;
    text-align: center;
    color: #ff9f43;
    font-family: 'Roboto Condensed', 'Roboto', sans-serif;
    z-index: 10;
    width: 100%;
    position: relative;
    padding: 0 20px;
  }
  
  .burger-name {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 18px 0;
    letter-spacing: 1px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
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
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
    margin-bottom: 0;
    background: linear-gradient(90deg, #ffb86b, #ff9f43, #ffe5c2, #ffb86b);
    background-size: 200% auto;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 2.5s linear infinite reverse;
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
    box-shadow: 0 2px 12px rgba(255,159,67,0.33), 0 0 0 0 rgba(255,229,194,0.33);
    color: #fff;
    font-size: 2.2rem;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(.22,.61,.36,1), box-shadow 0.2s, background 0.2s;
    position: relative;
    z-index: 15;
  }
  
  .add-to-cart-btn:hover {
    transform: scale(1.12) rotate(-10deg);
    box-shadow: 0 4px 24px rgba(255,159,67,0.33), 0 0 0 8px rgba(255,229,194,0.33);
    background: linear-gradient(120deg, #2ecc40 0%, #b6fcd5 100%);
  }
  
  .add-to-cart-btn:active {
    transform: scale(0.98) rotate(10deg);
  }
  
  .plus-icon {
    display: block;
    font-size: 2.2rem;
    font-weight: bold;
    line-height: 1;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  }
  
  @keyframes shimmer {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
</style> 