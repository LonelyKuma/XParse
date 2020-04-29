import { Queue } from '../src/utils/queue';

test('Queue', () => {
  const queue = new Queue(1, 2, 3);
  expect(queue.front()).toBe(1);
  expect(queue.pop()).toBeTruthy();
  expect(queue.front()).toBe(2);
  expect(queue.pop()).toBeTruthy();
  expect(queue.front()).toBe(3);
  queue.push(4);
  expect(queue.pop()).toBeTruthy();
  expect(queue.front()).toBe(4);
  expect(queue.pop()).toBeTruthy();
  expect(queue.pop()).toBeFalsy();
  expect(queue.pop()).toBeFalsy();
  expect(queue.pop()).toBeFalsy();

  queue.push(5);
  expect(queue.front()).toBe(5);
  queue.push(6);
  expect(queue.front()).toBe(5);
});
