/* This is a wrapper function for Math.random.
 * It is used to make the code easier to test.
 */

export function randomNum(){
	return Math.random();
}

export function randomInt(min, max) {
    return Math.floor(randomNum() * (max - min + 1)) + min;
}