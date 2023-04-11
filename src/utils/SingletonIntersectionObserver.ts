import { CustomHTMLElement } from "./CustomHTMLElement";

class SingletonIntersectionObserver {
  private static instance: SingletonIntersectionObserver;
  private observer: IntersectionObserver;

  private constructor() {
    this.observer = new IntersectionObserver(this.callback, {});
  }

  private callback(
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ): void {
    entries.forEach((entry) => {
      const target = entry.target as CustomHTMLElement;
      observer.disconnect();
      target._resolver && target._resolver(entry.boundingClientRect);
    });
  }

  public static getInstance(): SingletonIntersectionObserver {
    if (!SingletonIntersectionObserver.instance) {
      SingletonIntersectionObserver.instance =
        new SingletonIntersectionObserver();
    }
    return SingletonIntersectionObserver.instance;
  }

  public observe(element: CustomHTMLElement): Promise<DOMRectReadOnly> {
    return new Promise((resolve) => {
      element._resolver = resolve;
      this.observer.observe(element);
    });
  }
}

export const singletonIntersectionObserver =
  SingletonIntersectionObserver.getInstance();
