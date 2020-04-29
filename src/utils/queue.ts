import assert from 'assert';

class Node<T> {
  value?: T;
  succ?: Node<T>;

  constructor(value?: T, succ?: Node<T>) {
    this.value = value;
    this.succ = succ;
  }
}

export class Queue<T> {
  private readonly head: Node<T> = new Node<T>(undefined, undefined);
  private tail: Node<T> = this.head;

  constructor(...values: T[]) {
    for (const value of values) {
      this.push(value);
    }
  }

  push(value: T) {
    assert(this.tail.succ === undefined);
    this.tail.succ = new Node(value, undefined);
    this.tail = this.tail.succ;
  }

  isEmpty() {
    return this.head.succ === undefined;
  }

  pop() {
    if (this.head.succ === undefined) {
      return false;
    }
    this.head.succ = this.head.succ.succ;
    if (this.head.succ === undefined) {
      this.tail = this.head;
    }
    return true;
  }

  front(): T {
    if (this.head.succ === undefined) {
      throw new Error('Queue is empty');
    }
    return this.head.succ.value as T;
  }
}
