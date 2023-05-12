export const intersectionObserver = new IntersectionObserver(
  async (entries) => {
    // show / hide elements based on intersection with inline styles
    entries.forEach((entry) => {
      const target = entry.target as HTMLElement;
      if (entry.isIntersecting) {
        target.style.visibility = "visible";
      } else {
        target.style.visibility = "hidden";
      }
    });
  }
);
