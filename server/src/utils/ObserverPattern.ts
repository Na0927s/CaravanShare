// Observer Interface
export interface Observer<T> {
  update(subject: Subject<T>, event: T): void;
}

// Subject Interface
export interface Subject<T> {
  attach(observer: Observer<T>): void;
  detach(observer: Observer<T>): void;
  notify(event: T): void;
}

// Concrete Subject Implementation
export class ConcreteSubject<T> implements Subject<T> {
  private observers: Observer<T>[] = [];

  attach(observer: Observer<T>): void {
    const isExist = this.observers.includes(observer);
    if (!isExist) {
      this.observers.push(observer);
    }
  }

  detach(observer: Observer<T>): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex !== -1) {
      this.observers.splice(observerIndex, 1);
    }
  }

  notify(event: T): void {
    for (const observer of this.observers) {
      observer.update(this, event);
    }
  }
}
