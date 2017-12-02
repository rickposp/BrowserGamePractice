import Bucket from '../modules/bucket.js';

test('at limit', () => {
	let bucket = new Bucket("name", 10);
	bucket.add_points(10);
	expect(bucket.at_limit());
});