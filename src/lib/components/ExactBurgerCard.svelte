<script>
  import { spring } from "svelte/motion";
  import { onMount } from "svelte";
  import { exactBurgerCard } from "../stores/exactBurgerCardStore.js";
  import { orientation, resetBaseOrientation } from "../stores/orientation.js";
  import { clamp, round, adjust } from "../helpers/Math.js";

  // Burger properties
  export let name = "Giant Burger";
  export let price = "$99.99";
  
  // image props
  export let front = "/img/burger.png";
  export let back = "/img/pattern.svg";
  
  // context/environment props
  export let showcase = false;

  const randomSeed = {
    x: Math.random(),
    y: Math.random()
  }

  const cosmosPosition = { 
    x: Math.floor(randomSeed.x * 734), 
    y: Math.floor(randomSeed.y * 1280) 
  };

  let thisCard;
  let repositionTimer;

  let active = false;
  let interacting = false;
  let firstPop = true;
  let loading = true;
  let isVisible = document.visibilityState === "visible";
  let imageLoaded = false;

  const springInteractSettings = { stiffness: 0.066, damping: 0.25 };
  const springPopoverSettings = { stiffness: 0.033, damping: 0.45 };
  let springRotate = spring({ x: 0, y: 0 }, springInteractSettings);
  let springGlare = spring({ x: 50, y: 50, o: 0 }, springInteractSettings);
  let springBackground = spring({ x: 50, y: 50 }, springInteractSettings);
  let springRotateDelta = spring({ x: 0, y: 0 }, springPopoverSettings);
  let springTranslate = spring({ x: 0, y: 0 }, springPopoverSettings);
  let springScale = spring(1, springPopoverSettings);

  let showcaseInterval;
  let showcaseTimerStart;
  let showcaseTimerEnd;
  let showcaseRunning = showcase;

  const endShowcase = () => {
    if (showcaseRunning) {
      clearTimeout(showcaseTimerEnd);
      clearTimeout(showcaseTimerStart);
      clearInterval(showcaseInterval);
      showcaseRunning = false;
    }
  };

  const interact = (e) => {
    endShowcase();

    if (!isVisible || !imageLoaded) {
      return (interacting = false);
    }
    
    // prevent other background cards being interacted with
    if ($exactBurgerCard && $exactBurgerCard !== thisCard) {
      return (interacting = false);
    }

    interacting = true;

    if (e.type === "touchmove") {
      e.clientX = e.touches[0].clientX;
      e.clientY = e.touches[0].clientY;
    }

    const $el = e.currentTarget;
    const rect = $el.getBoundingClientRect(); // get element's current size/position
    const absolute = {
      x: e.clientX - rect.left, // get mouse position from left
      y: e.clientY - rect.top, // get mouse position from right
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

  const activate = (e) => {
    if ($exactBurgerCard && $exactBurgerCard === thisCard) {
      // If already active, deactivate
      $exactBurgerCard = undefined;
    } else {
      $exactBurgerCard = thisCard;
      resetBaseOrientation();
    }
  };

  const deactivate = (e) => {
    interactEnd();
    $exactBurgerCard = undefined;
  };

  const reposition = (e) => {
    clearTimeout(repositionTimer);
    repositionTimer = setTimeout(() => {
      if ($exactBurgerCard && $exactBurgerCard === thisCard) {
        setCenter();
      }
    }, 300);
  };

  const setCenter = () => {
    const rect = thisCard.getBoundingClientRect(); // get element's size/position
    const view = document.documentElement; // get window/viewport size

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
    if (!imageLoaded) return;
    
    const rect = thisCard.getBoundingClientRect(); // get element's size/position
    let delay = 100;
    let scaleW = (window.innerWidth / rect.width) * 0.9;
    let scaleH = (window.innerHeight / rect.height) * 0.9;
    let scaleF = 1.75;
    setCenter();
    if (firstPop) {
      delay = 500; // Reduced from 1000ms to improve responsiveness
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

  const reset = () => {
    interactEnd(null, 0);
    springScale.set(1, { hard: true });
    springTranslate.set({ x: 0, y: 0 }, { hard: true });
    springRotateDelta.set({ x: 0, y: 0 }, { hard: true });
    springRotate.set({ x: 0, y: 0 }, { hard: true });
  };

  $: {
    if ($exactBurgerCard && $exactBurgerCard === thisCard) {
      popover();
      active = true;
    } else {
      retreat();
      active = false;
    }
  }

  // Modern dark gradient background for the card
  const cardBg = `
    linear-gradient(135deg, #23243a 0%, #23243a 60%, #18181b 100%),
    url('/img/grain.webp') repeat
  `;

  // SVG pattern for the back
  const svgPattern = `<svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <g opacity='0.7'>
      <path d='M10 30 Q20 35 30 30 Q20 25 10 30' stroke='#ffb86b' stroke-width='2' fill='none'/>
      <rect x='12' y='12' width='16' height='8' rx='4' stroke='#ffb86b' stroke-width='2' fill='none'/>
      <circle cx='20' cy='20' r='3' stroke='#ffb86b' stroke-width='2' fill='none'/>
    </g>
  </svg>`;

  const staticStyles = `
    --seedx: ${randomSeed.x};
    --seedy: ${randomSeed.y};
    --cosmosbg: ${cosmosPosition.x}px ${cosmosPosition.y}px;
  `;
  
  $: dynamicStyles = `
    --pointer-x: ${$springGlare.x}%;
    --pointer-y: ${$springGlare.y}%;
    --pointer-from-center: ${ 
      clamp( Math.sqrt( 
        ($springGlare.y - 50) * ($springGlare.y - 50) + 
        ($springGlare.x - 50) * ($springGlare.x - 50) 
      ) / 50, 0, 1) };
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

  // Only respond to orientation changes when active to reduce calculations
  let orientationUnsubscribe;
  
  $: {
    if ($exactBurgerCard && $exactBurgerCard === thisCard && imageLoaded) {
      interacting = true;
      
      // Only add orientation listener when card is active
      if (!orientationUnsubscribe && $orientation) {
        orientationUnsubscribe = orientation.subscribe(orientate);
      }
    } else if (orientationUnsubscribe) {
      orientationUnsubscribe();
      orientationUnsubscribe = null;
    }
  }

  document.addEventListener("visibilitychange", (e) => {
    isVisible = document.visibilityState === "visible";
    endShowcase();
    reset();
  });

  const imageLoader = (e) => {
    loading = false;
    imageLoaded = true;
    
    // Pre-calculate and cache card styles
    if (thisCard) {
      // Apply initial styles to reduce calculation lag during animation
      const rect = thisCard.getBoundingClientRect();
      // Pre-warm animation calculations
      springBackground.set({ x: 50, y: 50 }, { hard: true });
      springRotate.set({ x: 0, y: 0 }, { hard: true });
      springGlare.set({ x: 50, y: 50, o: 0 }, { hard: true });
    }
  };

  onMount(() => {
    // Ensure we unsubscribe on component destruction
    return () => {
      if (orientationUnsubscribe) {
        orientationUnsubscribe();
      }
    };
  });
</script>

<svelte:window on:scroll={reposition} />

<div
  class="burger-card"
  class:active
  class:interacting
  class:loading
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
      aria-label="Expand the Burger Card: {name}"
      tabindex="0"
    >
      <!-- Card Front - Only showing front now -->
      <div class="burger-card__front">
        <div class="card-bg"></div>
        
        <!-- Burger Avatar -->
        <div class="burger-avatar">
          <img 
            src={front} 
            alt="Giant Burger" 
            draggable="false" 
            on:load={imageLoader} 
            width="240" 
            height="240"
            style="will-change: transform;" 
          />
        </div>
        
        <!-- Card Content -->
        <div class="card-details">
          <h2 class="burger-name">{name}</h2>
          <div class="price-label">{price}</div>
          <button
            class="add-to-cart-btn"
            on:click|stopPropagation={() => {}}
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
    will-change: transform, opacity;
  }
  
  .burger-card.active {
    z-index: 1200;
  }
  
  .burger-card.interacting {
    z-index: calc(var(--card-scale) * 120);
  }
  
  .burger-card__translater {
    position: relative;
    transform: translate3d(var(--translate-x), var(--translate-y), 0.1px) scale(var(--card-scale));
    transform-style: preserve-3d;
    transform-origin: center;
    perspective: 600px;
    will-change: transform;
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
    box-shadow: 0 8px 32px 0 rgba(0,0,0,0.1);
    will-change: transform, box-shadow;
  }
  
  .burger-card.active .burger-card__rotator {
    box-shadow: 0 0 3px -1px white, 0 0 3px 1px #ffb86b, 0 0 12px 2px #ff9f43, 
                0px 10px 20px -5px black, 0 0 40px -30px #ff9f43, 0 0 50px -20px #ff9f43;
  }
  
  .burger-card__front {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    border-radius: 2.2em;
    overflow: hidden;
    transform-style: preserve-3d;
    z-index: 2;
    background: transparent;
    will-change: transform;
  }
  
  .card-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0; top: 0;
    border-radius: 2.2em;
    background: linear-gradient(135deg, #23243a 0%, #23243a 60%, #18181b 100%), url('/img/grain.webp') repeat;
    z-index: 1;
    will-change: opacity;
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
    z-index: 20;
    will-change: opacity;
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
    background: rgba(0,0,0,0.3);
    z-index: 1100;
    backdrop-filter: blur(2px);
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
    will-change: transform;
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