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
      console.log("entry.boundingClientRect:", entry.boundingClientRect);
      target._resolver &&
        target._resolver.forEach((resolve) =>
          resolve(entry.boundingClientRect)
        );
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
      element._resolver ||= [];
      element._resolver.push(resolve);
      this.observer.observe(element);
    });
  }
}

export const singletonIntersectionObserver =
  SingletonIntersectionObserver.getInstance();
