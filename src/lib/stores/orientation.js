import { writable } from "svelte/store";

// Initial orientation values
const initialOrientation = {
  absolute: { alpha: 0, beta: 0, gamma: 0 },
  relative: { alpha: 0, beta: 0, gamma: 0 }
};

// Create the store with initial values
export const orientation = writable(initialOrientation);

// Base orientation values for reference point
let baseOrientation = {
  alpha: 0,
  beta: 0,
  gamma: 0
};

// Reset the base orientation to current values
export function resetBaseOrientation() {
  if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
    baseOrientation = {
      alpha: initialOrientation.absolute.alpha,
      beta: initialOrientation.absolute.beta,
      gamma: initialOrientation.absolute.gamma
    };
  }
}

// Initialize orientation detection on client
if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', handleOrientation);
}

// Handle device orientation changes
function handleOrientation(event) {
  const absolute = {
    alpha: event.alpha || 0,
    beta: event.beta || 0,
    gamma: event.gamma || 0
  };
  
  const relative = {
    alpha: absolute.alpha - baseOrientation.alpha,
    beta: absolute.beta - baseOrientation.beta,
    gamma: absolute.gamma - baseOrientation.gamma
  };
  
  orientation.set({ absolute, relative });
}
