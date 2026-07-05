export default function ({ n }) {
  function slowFib(x) {
    if (x <= 1) return x;
    return slowFib(x - 1) + slowFib(x - 2);
  }
  return slowFib(n);
}
