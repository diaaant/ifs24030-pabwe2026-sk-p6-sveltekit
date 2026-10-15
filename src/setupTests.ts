import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import StubIcon from "./test-icon.svelte";

// Ikon lucide-svelte diganti komponen stub agar render pengujian ringan.
vi.mock("lucide-svelte", () => ({
  GraduationCap: StubIcon,
  LogOut: StubIcon,
  Users: StubIcon,
  User: StubIcon,
  Plus: StubIcon,
  Trash2: StubIcon,
  Pencil: StubIcon,
  Image: StubIcon,
  Star: StubIcon,
  Video: StubIcon,
  Check: StubIcon,
}));

// Dialog SweetAlert2 dimock; secara bawaan pengguna menekan tombol konfirmasi.
vi.mock("sweetalert2", () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: true }) },
}));

// Modul $app/* milik SvelteKit dimock: goto dan state halaman (page).
const mockPage = vi.hoisted(() => ({
  url: { pathname: "/" },
  params: {} as Record<string, string>,
}));
vi.mock("$app/navigation", () => ({ goto: vi.fn() }));
vi.mock("$app/state", () => ({ page: mockPage }));
