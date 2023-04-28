export const intersectionObserver = new IntersectionObserver(
  async (entries) => {
    // show / hide elements based on intersection with inline styles
    entries.forEach((entry) => {
      console.log('entry:', entry)
      console.log('entry.isIntersecting:', entry.isIntersecting)
      if (entry.isIntersecting) {
        entry.target.style.visibility = "visible";
      } else {
        entry.target.style.visibility = "hidden";
      }
    });
  }
);
