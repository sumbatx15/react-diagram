export const shallowDiff = <T extends Record<string, any> | any[]>(
  a: T,
  b: T
): T => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return shallowDiffArray(a, b) as T;
  } else if (typeof a === "object" && typeof b === "object") {
    return shallowDiffObject(a, b) as T;
  } else {
    throw new Error("shallowDiff only works on objects and arrays");
  }
};

export const shallowDiffObject = <T extends Record<string, any>>(
  a: T,
  b: T
): T => {
  const diff = {} as T;
  for (const key in a) {
    if (a[key] !== b[key]) {
      diff[key] = b[key];
    }
  }
  return diff;
};

export const shallowDiffArray = <T extends any[]>(a: T, b: T) => {
  const diff = [];

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      diff.push(b[i]);
    }
  }
  return diff;
};

// test shallowDiff
const a = { a: 1, b: 2, c: 3 };
const b = { a: 1, b: 2, c: 4 };
const c = { a: 1, b: 2, c: 4, d: 5 };
const d = { a: 1, b: 2, c: 4, d: 5, e: 6 };
shallowDiff(a, b); // { c: 4 }
