import { describe, expect, it } from "vitest";
import { calculateDuration, formatDate, formatDateRange } from "./utils";

describe("formatDate", () => {
  it('formats as "Mon. YYYY"', () => {
    expect(formatDate(new Date(2023, 2, 15))).toBe("Mar. 2023");
  });
});

describe("formatDateRange", () => {
  it("joins start and end dates", () => {
    const start = new Date(2020, 0, 1);
    const end = new Date(2023, 5, 1);
    expect(formatDateRange(start, end)).toBe("Jan. 2020 - Jun. 2023");
  });

  it('uses "Present" when end is null', () => {
    const start = new Date(2024, 0, 1);
    expect(formatDateRange(start, null)).toBe("Jan. 2024 - Present");
  });
});

describe("calculateDuration", () => {
  it("formats years and months between fixed dates", () => {
    const start = new Date(2020, 0, 1);
    const end = new Date(2021, 7, 1);
    expect(calculateDuration(start, end)).toBe("1 yr 7 mos");
  });

  it("formats years only", () => {
    const start = new Date(2020, 0, 1);
    const end = new Date(2022, 0, 1);
    expect(calculateDuration(start, end)).toBe("2 yrs");
  });

  it("formats months only", () => {
    const start = new Date(2020, 0, 1);
    const end = new Date(2020, 2, 1);
    expect(calculateDuration(start, end)).toBe("2 mos");
  });

  it("returns empty string when end is before start", () => {
    const start = new Date(2022, 0, 1);
    const end = new Date(2020, 0, 1);
    expect(calculateDuration(start, end)).toBe("");
  });
});
