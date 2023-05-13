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

export const containerIntersectionObserver = new IntersectionObserver(
  async (entries) => {
    console.log("entries:", entries);
    // show / hide elements based on intersection with inline styles
    entries.forEach((entry) => {
      console.log("containerIntersectionObserver:", entry);
      const target = entry.target as HTMLElement;
    });
  }
, {
  threshold: 1
});
