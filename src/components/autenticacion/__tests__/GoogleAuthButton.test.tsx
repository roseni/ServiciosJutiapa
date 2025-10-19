/* @vitest-environment jsdom */
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { create } from "zustand";
import * as authModule from "@/lib/firebase/auth";
import { GoogleAuthButton } from "../GoogleAuthButton";

vi.mock("@/lib/firebase/auth", () => ({
  signInWithGoogle: vi.fn(),
  signOutCurrentUser: vi.fn(),
}));

vi.mock("@/store/authStore", () => {
  const store = create(() => ({
    user: null,
    initialized: true,
    setUser: () => {},
    ensureSubscribed: () => {},
  }));
  return { useAuthStore: store };
});

describe("GoogleAuthButton", () => {
  it("renders sign-in when no user and calls signInWithGoogle on click", async () => {
    render(<GoogleAuthButton />);
    
    // Esperar a que el componente se monte
    const btn = await waitFor(() => 
      screen.getByText(/Continuar con Google/i)
    );
    
    fireEvent.click(btn);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((authModule as any).signInWithGoogle).toHaveBeenCalled();
  });
});


