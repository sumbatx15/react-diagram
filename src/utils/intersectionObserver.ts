export const intersectionObserver = new IntersectionObserver(
  async (entries) => {
    // show / hide elements based on intersection with inline styles
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.visibility = "visible";
      } else {
        entry.target.style.visibility = "hidden";
      }
    });
  }
);
