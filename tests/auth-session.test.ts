import { describe, it, expect } from "vitest";
import {
  hashPassword,
  comparePassword,
  signSessionToken,
  verifySessionToken,
} from "../src/lib/auth/session";

describe("Authentication & Session Security", () => {
  it("hashes and securely compares passwords", async () => {
    const rawPass = "super_secure_password_123";
    const hash = await hashPassword(rawPass);

    expect(hash).not.toBe(rawPass);
    const matches = await comparePassword(rawPass, hash);
    expect(matches).toBe(true);

    const wrongMatches = await comparePassword("wrong_password", hash);
    expect(wrongMatches).toBe(false);
  });

  it("signs and verifies JWT session tokens with payload", async () => {
    const payload = {
      userId: "usr_12345",
      email: "tanmay@echo.ai",
      workspaceId: "ws_67890",
    };

    const token = await signSessionToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.workspaceId).toBe(payload.workspaceId);
  });
});
