/**
 * return a value that has been rounded to a set precision
 * @param {Number} value the value to round
 * @param {Number} precision the precision (decimal places), default: 0
 * @returns {Number}
 */
export function round(value, precision = 0) {
	const multiplier = Math.pow(10, precision);
	return Math.round(value * multiplier) / multiplier;
}

/**
 * return a value that has been limited between min & max
 * @param {Number} value the value to clamp
 * @param {Number} min minimum value to allow, default: 0
 * @param {Number} max maximum value to allow, default: 100
 * @returns {Number}
 */
export function clamp(value, min = 0, max = 100) {
	return Math.min(Math.max(value, min), max);
}

/**
 * return a value that has been re-mapped according to the from/to
 * - for example, adjust(10, 0, 100, 100, 0) = 90
 * @param {Number} value the value to re-map (or adjust)
 * @param {Number} fromMin min value to re-map from
 * @param {Number} fromMax max value to re-map from
 * @param {Number} toMin min value to re-map to
 * @param {Number} toMax max value to re-map to
 * @returns {Number} 
 */
export function adjust(value, fromMin, fromMax, toMin, toMax) {
	const fromRange = fromMax - fromMin;
	const toRange = toMax - toMin;
	const scaledValue = (value - fromMin) / fromRange;
	return toMin + (scaledValue * toRange);
}