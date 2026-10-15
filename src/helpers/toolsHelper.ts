import Swal from "sweetalert2";
import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const dialog = (icon: "success" | "error" | "warning", title: string, text: string) =>
  Swal.fire({ icon, title, text, confirmButtonColor: "#4f46e5" });

export const showSuccessDialog = (message: string) => dialog("success", "Berhasil", message);
export const showErrorDialog = (message: string) => dialog("error", "Gagal", message);
export const showWarningDialog = (message: string) => dialog("warning", "Perhatian", message);

export async function showConfirmDialog(message: string) {
  const result = await Swal.fire({
    icon: "warning",
    title: "Konfirmasi",
    text: message,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
    confirmButtonColor: "#4f46e5",
  });
  return result.isConfirmed;
}

/** Tampilkan dialog sesuai hasil API; jalankan onSuccess bila berhasil. */
export async function handleResult(
  response: { status: string; message: string },
  onSuccess: () => void
) {
  if (response.status === "success") {
    await showSuccessDialog(response.message);
    onSuccess();
    return true;
  }
  await showErrorDialog(response.message);
  return false;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** Ambil ID video dari tautan YouTube (watch, youtu.be, embed); string kosong bila tidak valid. */
export function getYoutubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : "";
}
