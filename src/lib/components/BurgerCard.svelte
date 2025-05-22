<script>
  import { spring } from "svelte/motion";
  import { onMount } from "svelte";
  import { activeBurgerCard } from "../stores/activeBurgerCard.js";
  import { clamp, round } from "../helpers/Math.js";

  // Burger card properties
  export let name = "Giant Burger";
  export let price = "$99.99";
  export let burgerImg = "/img/burger.png";

  // SVG pattern for the back
  const svgPattern = `<svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <g opacity='0.7'>
      <path d='M10 30 Q20 35 30 30 Q20 25 10 30' stroke='#ffb86b' stroke-width='2' fill='none'/>
      <rect x='12' y='12' width='16' height='8' rx='4' stroke='#ffb86b' stroke-width='2' fill='none'/>
      <circle cx='20' cy='20' r='3' stroke='#ffb86b' stroke-width='2' fill='none'/>
    </g>
  </svg>`;
  
  // Card state and refs
  let thisCard;
  let repositionTimer;
  let active = false;
  let interacting = false;
  let firstPop = true;
  let loading = true;
  let flipped = false;

  // Spring settings and instances
  const springInteractSettings = { stiffness: 0.066, damping: 0.25 };
  const springPopoverSettings = { stiffness: 0.033, damping: 0.45 };
  
  let springRotate = spring({ x: 0, y: 0 }, springInteractSettings);
  let springGlare = spring({ x: 50, y: 50, o: 0 }, springInteractSettings);
  let springBackground = spring({ x: 50, y: 50 }, springInteractSettings);
  let springRotateDelta = spring({ x: 0, y: 0 }, springPopoverSettings);
  let springTranslate = spring({ x: 0, y: 0 }, springPopoverSettings);
  let springScale = spring(1, springPopoverSettings);

  // Add to cart animation
  let plusBtn;
  let plusRot = 0;
  
  // Background style
  const cardBg = `
    linear-gradient(135deg, #23243a 0%, #23243a 60%, #18181b 100%),
    url('/img/grain.webp') repeat
  `;

  // Interaction functions
  const interact = (e) => {
    if (!active && !$activeBurgerCard) return;
    
    interacting = true;

    if (e.type === "touchmove") {
      e.clientX = e.touches[0].clientX;
      e.clientY = e.touches[0].clientY;
    }

    const $el = e.currentTarget;
    const rect = $el.getBoundingClientRect();
    const absolute = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    const percent = {
      x: clamp(round((100 / rect.width) * absolute.x)),
      y: clamp(round((100 / rect.height) * absolute.y)),
    };
    const center = {
      x: percent.x - 50,
      y: percent.y - 50,
    };

    updateSprings({
      x: adjust(percent.x, 0, 100, 37, 63),
      y: adjust(percent.y, 0, 100, 33, 67),
    },{
      x: round(-(center.x / 3.5)),
      y: round(center.y / 2),
    },{
      x: round(percent.x),
      y: round(percent.y),
      o: 1,
    });
  };

  // Helper function to adjust values
  function adjust(value, fromMin, fromMax, toMin, toMax) {
    const fromRange = fromMax - fromMin;
    const toRange = toMax - toMin;
    const scaledValue = (value - fromMin) / fromRange;
    return toMin + (scaledValue * toRange);
  }

  const interactEnd = (e, delay = 500) => {
    setTimeout(function () {
      const snapStiff = 0.01;
      const snapDamp = 0.06;
      interacting = false;

      springRotate.stiffness = snapStiff;
      springRotate.damping = snapDamp;
      springRotate.set({ x: 0, y: 0 }, { soft: 1 });

      springGlare.stiffness = snapStiff;
      springGlare.damping = snapDamp;
      springGlare.set({ x: 50, y: 50, o: 0 }, { soft: 1 });

      springBackground.stiffness = snapStiff;
      springBackground.damping = snapDamp;
      springBackground.set({ x: 50, y: 50 }, { soft: 1 });
    }, delay);
  };

  const updateSprings = (background, rotate, glare) => {
    springBackground.stiffness = springInteractSettings.stiffness;
    springBackground.damping = springInteractSettings.damping;
    springRotate.stiffness = springInteractSettings.stiffness;
    springRotate.damping = springInteractSettings.damping;
    springGlare.stiffness = springInteractSettings.stiffness;
    springGlare.damping = springInteractSettings.damping;

    springBackground.set(background);
    springRotate.set(rotate);
    springGlare.set(glare);
  };

  // Popover/activation functions
  const activate = (e) => {
    if ($activeBurgerCard && $activeBurgerCard === thisCard) {
      // If the card is already active, flip it
      flipped = !flipped;
    } else {
      // If the card is not active, activate it
      $activeBurgerCard = thisCard;
      flipped = false;
    }
  };

  const deactivate = (e) => {
    interactEnd();
    $activeBurgerCard = undefined;
    flipped = false;
  };

  const reposition = (e) => {
    clearTimeout(repositionTimer);
    repositionTimer = setTimeout(() => {
      if ($activeBurgerCard && $activeBurgerCard === thisCard) {
        setCenter();
      }
    }, 300);
  };

  const setCenter = () => {
    const rect = thisCard.getBoundingClientRect();
    const view = document.documentElement;

    const delta = {
      x: round(view.clientWidth / 2 - rect.x - rect.width / 2),
      y: round(view.clientHeight / 2 - rect.y - rect.height / 2),
    };
    
    springTranslate.set({
      x: delta.x,
      y: delta.y,
    });
  };

  const popover = () => {
    const rect = thisCard.getBoundingClientRect();
    let delay = 100;
    let scaleW = (window.innerWidth / rect.width) * 0.9;
    let scaleH = (window.innerHeight / rect.height) * 0.9;
    let scaleF = 1.75;
    
    setCenter();
    
    if (firstPop) {
      delay = 1000;
      springRotateDelta.set({
        x: 360,
        y: 0,
      });
    }
    
    firstPop = false;
    springScale.set(Math.min(scaleW, scaleH, scaleF));
    interactEnd(null, delay);
  };

  const retreat = () => {
    springScale.set(1, { soft: true });
    springTranslate.set({ x: 0, y: 0 }, { soft: true });
    springRotateDelta.set({ x: 0, y: 0 }, { soft: true });
    interactEnd(null, 100);
  };

  // Add to cart animation
  async function addToCart(e) {
    e.stopPropagation();
    
    plusRot += 360;
    await tick();
  }

  // React to active card changes
  $: {
    if ($activeBurgerCard && $activeBurgerCard === thisCard) {
      popover();
      active = true;
    } else {
      retreat();
      active = false;
    }
  }

  // Dynamic styles
  $: dynamicStyles = `
    --pointer-x: ${$springGlare.x}%;
    --pointer-y: ${$springGlare.y}%;
    --pointer-from-center: ${
      clamp(Math.sqrt(
        ($springGlare.y - 50) * ($springGlare.y - 50) +
        ($springGlare.x - 50) * ($springGlare.x - 50)
      ) / 50, 0, 1)
    };
    --pointer-from-top: ${$springGlare.y / 100};
    --pointer-from-left: ${$springGlare.x / 100};
    --card-opacity: ${$springGlare.o};
    --rotate-x: ${$springRotate.x + $springRotateDelta.x}deg;
    --rotate-y: ${$springRotate.y + $springRotateDelta.y}deg;
    --background-x: ${$springBackground.x}%;
    --background-y: ${$springBackground.y}%;
    --card-scale: ${$springScale};
    --translate-x: ${$springTranslate.x}px;
    --translate-y: ${$springTranslate.y}px;
  `;

  import { tick } from 'svelte';

  onMount(() => {
    // Initialize card
  });
</script>

<svelte:window on:scroll={reposition} />

<div
  class="burger-card"
  class:active
  class:interacting
  class:flipped
  style={dynamicStyles}
  bind:this={thisCard}
>
  <div class="burger-card__translater">
    <button
      class="burger-card__rotator"
      on:click={activate}
      on:pointermove={interact}
      on:mouseleave={interactEnd}
      on:blur={deactivate}
      aria-label="Expand the burger card: {name}"
      tabindex="0"
    >
      <!-- Card Back -->
      <div class="burger-card__back">
        <div class="card-bg" style="background: {cardBg}; opacity: 0.95;"></div>
        <div class="card-pattern" style="background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(svgPattern)}');"></div>
      </div>
      
      <!-- Card Front -->
      <div class="burger-card__front">
        <div class="card-bg" style="background: {cardBg};"></div>
        
        <!-- Burger Avatar -->
        <div class="burger-avatar">
          <img src={burgerImg} alt="Giant Burger" draggable="false" />
        </div>
        
        <!-- Card Content -->
        <div class="card-details">
          <h2 class="burger-name">{name}</h2>
          <div class="price-label">{price}</div>
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
        
        <!-- Effects -->
        <div class="burger-card__shine"></div>
        <div class="burger-card__glare"></div>
      </div>
    </button>
  </div>
</div>

<!-- Overlay for clicking outside -->
{#if active}
  <div class="burger-card-overlay" on:click={deactivate}></div>
{/if}

<style>
  :root {
    --pointer-x: 50%;
    --pointer-y: 50%;
    --card-scale: 1;
    --card-opacity: 0;
    --translate-x: 0px;
    --translate-y: 0px;
    --rotate-x: 0deg;
    --rotate-y: 0deg;
    --background-x: var(--pointer-x);
    --background-y: var(--pointer-y);
    --pointer-from-center: 0;    
    --pointer-from-top: var(--pointer-from-center);
    --pointer-from-left: var(--pointer-from-center);
  }
  
  .burger-card {
    position: relative;
    width: 340px;
    perspective: 1200px;
    transform-style: preserve-3d;
    transform-origin: center;
    z-index: 1;
    margin: 0 auto;
  }
  
  .burger-card.active {
    z-index: 1200;
  }
  
  .burger-card.interacting {
    z-index: calc(var(--card-scale) * 120);
  }
  
  .burger-card.flipped .burger-card__rotator {
    transform: rotateY(180deg) rotateX(var(--rotate-y)) rotateY(var(--rotate-x));
  }
  
  .burger-card__translater {
    position: relative;
    transform: translate3d(var(--translate-x), var(--translate-y), 0.1px) scale(var(--card-scale));
    transform-style: preserve-3d;
    transform-origin: center;
    perspective: 600px;
    will-change: transform, box-shadow;
  }
  
  .burger-card__rotator {
    position: relative;
    width: 100%;
    aspect-ratio: 0.718;
    transform: rotateX(var(--rotate-y)) rotateY(var(--rotate-x));
    transform-style: preserve-3d;
    transform-origin: center;
    transition: transform 0.7s cubic-bezier(.22,.61,.36,1), box-shadow 0.4s;
    border: none;
    background: transparent;
    padding: 0;
    border-radius: 2.2em;
    cursor: pointer;
    outline: none;
    box-shadow: 0 8px 32px 0 #0002;
  }
  
  .burger-card.active .burger-card__rotator {
    box-shadow: 0 0 3px -1px white, 0 0 3px 1px #ffb86b, 0 0 12px 2px #ff9f43, 
                0px 10px 20px -5px black, 0 0 40px -30px #ff9f43, 0 0 50px -20px #ff9f43;
  }
  
  .burger-card__front,
  .burger-card__back {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    backface-visibility: hidden;
    border-radius: 2.2em;
    overflow: hidden;
    transform-style: preserve-3d;
  }
  
  .burger-card__back {
    transform: rotateY(180deg);
    background: transparent;
  }
  
  .burger-card__front {
    z-index: 2;
    background: transparent;
  }
  
  .burger-card__shine,
  .burger-card__glare {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 2.2em;
    pointer-events: none;
    z-index: 3;
  }
  
  .burger-card__shine {
    background: linear-gradient(133deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 100%);
    mix-blend-mode: color-dodge;
    opacity: 0.7;
  }
  
  .burger-card__glare {
    background: radial-gradient(circle at var(--pointer-x) var(--pointer-y), 
                rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 80%, transparent 100%);
    mix-blend-mode: lighten;
    opacity: calc(var(--card-opacity) * 0.5);
  }
  
  .burger-card-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1100;
    cursor: pointer;
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
  
  .card-pattern {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background-repeat: repeat;
    background-size: 60px 60px;
    opacity: 0.7;
    z-index: 2;
    transform: rotate(-45deg);
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
  
  @keyframes shimmer {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }
  
  .plus-icon {
    display: block;
    font-size: 2.2rem;
    font-weight: bold;
    line-height: 1;
    color: #fff;
    text-shadow: 0 2px 8px #000a;
  }
</style> 