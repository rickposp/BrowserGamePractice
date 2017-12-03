import Bucket from '../modules/bucket.js';

test('at limit', () => {
	let bucket = new Bucket("name", 10);
	bucket.add_points(10);
	expect(bucket.at_limit()).toBeTruthy;
});

test('under limit', () => {
	let bucket = new Bucket("name", 10);
	bucket.add_points(9);
	expect(bucket.at_limit()).toBeFalsy;
});

test('over limit', () => {
	let bucket = new Bucket("name", 10);
	bucket.add_points(11);
	expect(bucket.at_limit()).toBeTruthy;
});

test('add points', () => {
	let bucket = new Bucket("name", 8);
	bucket.add_points(1);
	expect(bucket.points).toBe(1);
});