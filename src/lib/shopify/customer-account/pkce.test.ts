/**
 * @test-file   PKCE utilities
 * @description generateCodeVerifier, generateCodeChallenge, generateState — format and uniqueness
 * @ai-generated
 * @reviewed-by
 */

import { describe, it, expect } from "vitest";
import { generateCodeVerifier, generateCodeChallenge, generateState } from "./pkce";

const BASE64URL_RE = /^[A-Za-z0-9\-_]+$/;

describe("generateCodeVerifier", () => {
  /**
   * @test-suite  Format
   * @target      output is a non-empty base64url string
   * @cases
   *   - [PASS] contains only base64url characters
   *   - [PASS] has length > 0
   */
  it("returns a non-empty base64url string", () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBeGreaterThan(0);
    expect(BASE64URL_RE.test(verifier)).toBe(true);
  });

  it("does not contain padding characters", () => {
    const verifier = generateCodeVerifier();
    expect(verifier).not.toContain("=");
    expect(verifier).not.toContain("+");
    expect(verifier).not.toContain("/");
  });

  it("returns a different value on each call", () => {
    const a = generateCodeVerifier();
    const b = generateCodeVerifier();
    expect(a).not.toBe(b);
  });
});

describe("generateCodeChallenge", () => {
  /**
   * @test-suite  Format
   * @target      SHA-256 hash of verifier encoded as base64url
   * @cases
   *   - [PASS] returns a non-empty base64url string
   *   - [PASS] is deterministic for the same input
   *   - [PASS] differs for different inputs
   */
  it("returns a non-empty base64url string", async () => {
    const challenge = await generateCodeChallenge("test-verifier");
    expect(challenge.length).toBeGreaterThan(0);
    expect(BASE64URL_RE.test(challenge)).toBe(true);
  });

  it("does not contain padding characters", async () => {
    const challenge = await generateCodeChallenge("test-verifier");
    expect(challenge).not.toContain("=");
  });

  it("is deterministic for the same verifier", async () => {
    const a = await generateCodeChallenge("same-verifier");
    const b = await generateCodeChallenge("same-verifier");
    expect(a).toBe(b);
  });

  it("returns different challenges for different verifiers", async () => {
    const a = await generateCodeChallenge("verifier-aaa");
    const b = await generateCodeChallenge("verifier-bbb");
    expect(a).not.toBe(b);
  });
});

describe("generateState", () => {
  /**
   * @test-suite  Format
   * @target      output is a non-empty base64url string
   * @cases
   *   - [PASS] contains only base64url characters
   *   - [PASS] returns a different value on each call
   */
  it("returns a non-empty base64url string", () => {
    const state = generateState();
    expect(state.length).toBeGreaterThan(0);
    expect(BASE64URL_RE.test(state)).toBe(true);
  });

  it("returns a different value on each call", () => {
    const a = generateState();
    const b = generateState();
    expect(a).not.toBe(b);
  });
});
