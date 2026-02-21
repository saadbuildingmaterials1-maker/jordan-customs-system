import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("Developer Information", () => {
  it("should have developer name set", () => {
    expect(ENV.developerName).toBeTruthy();
    expect(ENV.developerName).toBe("سعد النابلسي");
  });

  it("should have developer email set", () => {
    expect(ENV.developerEmail).toBeTruthy();
    expect(ENV.developerEmail).toContain("@");
    expect(ENV.developerEmail).toBe("saad.building.materials1@gmail.com");
  });

  it("should have developer phone set", () => {
    expect(ENV.developerPhone).toBeTruthy();
    expect(ENV.developerPhone).toBe("00962795917424");
  });
});
