export function add(a, b) {
  return a + b;
}

export function divide(a, b) {
  if (b === 0) throw new Error("Cannot divide by zero");
  return a / b;
}

export async function fetchQuoteLength(url) {
  const res = await fetch(url);
  const data = await res.json();
  return data.content.length;
}

