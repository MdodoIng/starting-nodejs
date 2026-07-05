import { describe, test, expect, beforeEach, vi } from "vitest";
import { add, divide, fetchQuoteLength } from "./math.js";

describe("add()", () => {
  test("sums two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });
  test("handles negatives", () => {
    expect(add(-2, 3)).toBe(1);
  });
});

describe("divide()", () => {
  test("throws on zero", () => {
    expect(() => divide(10, 0)).toThrow(/Cannot divide by zero/);
  });
});

test("expect matchers", () => {
  expect(5).toBe(5);
  expect([1, 2, 3]).toContain(2);
  expect({ name: "joe" }).toEqual({ name: "joe" }); // deep equality
  expect(null).toBeNull();
  expect(undefined).toBeUndefined();
  expect("hello world").toMatch(/world/);
  expect(5).toBeGreaterThan(3);
});

let counter;

beforeEach(() => {
  counter = 0;
});

test("starts at zero", () => {
  expect(counter).toBe(0);
});

test("fetchQuoteLength with a mocked fetch", async () => {
  global.fetch = vi.fn(async () => ({
    json: async () => ({ content: "hello" }),
  }));

  const len = await fetchQuoteLength("http://fake-url");
  expect(len).toBe(5);
  expect(fetch).toHaveBeenCalledTimes(1);
});


vi.mock("./weather.js", () => ({
  getWeather: vi.fn(() => "sunny"),
}));