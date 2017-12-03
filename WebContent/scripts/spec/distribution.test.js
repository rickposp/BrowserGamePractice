import Distribution from '../modules/distribution.js';
import Bucket from '../modules/bucket.js';

test('constructor', () => {
	let buckets = [];
	buckets.push(new Bucket("bucket1", 10));
	buckets.push(new Bucket("bucket2", 15));
	let distribution = new Distribution(buckets);
	expect(distribution.get_buckets().length == 2).toBeTruthy;
});

test('too much damage', () => {
	let buckets = [];
	buckets.push(new Bucket("bucket1", 10));
	buckets.push(new Bucket("bucket2", 15));
	let distribution = new Distribution(buckets);
	expect(() => {
		distribution.distribute_damage(26);
	  }).toThrow();
});

test('under limit one bucket', () => {
	let buckets = [];
	buckets.push(new Bucket("bucket1", 2));
	let distribution = new Distribution(buckets);
	distribution.distribute_damage(1);
});

test('at limit two buckets', () => {
	let buckets = [];
	buckets.push(new Bucket("bucket1", 1));
	buckets.push(new Bucket("bucket2", 1));
	let distribution = new Distribution(buckets);
	distribution.distribute_damage(2);
});

test('under limit two buckets', () => {
	let buckets = [];
	buckets.push(new Bucket("bucket1", 1));
	buckets.push(new Bucket("bucket2", 1));
	let distribution = new Distribution(buckets);
	distribution.distribute_damage(1);
});

test('under limit five buckets', () => {
	let buckets = [];
	buckets.push(new Bucket("bucket1", 1));
	buckets.push(new Bucket("bucket2", 1));
	buckets.push(new Bucket("bucket3", 1));
	buckets.push(new Bucket("bucket4", 1));
	buckets.push(new Bucket("bucket5", 1));
	let distribution = new Distribution(buckets);
	distribution.distribute_damage(3);
});