/* @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { create } from "zustand";

vi.mock("@/store/authStore", () => {
  const store = create(() => ({
    user: { uid: "test-user", email: "test@test.com" },
    initialized: true,
    setUser: () => {},
    ensureSubscribed: () => {},
  }));
  return { useAuthStore: store };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/",
}));

const ClientAuthGate = (
  await import("../ClientAuthGate")
).default;

describe("ClientAuthGate", () => {
  it("renders children when user is authenticated", async () => {
    render(
      <ClientAuthGate>
        <div>Protected content</div>
      </ClientAuthGate>
    );
    await waitFor(() => {
      expect(screen.getByText("Protected content")).toBeDefined();
    });
  });
});
