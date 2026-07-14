// Standar format Rupiah untuk seluruh frontend. Backend tetap menerima/mengirim angka polos.

/** Format angka menjadi "Rp 1.000.000" untuk tampilan (read-only). */
export function formatIDR(value: number): string {
  return `Rp ${Math.round(value || 0).toLocaleString("id-ID")}`;
}

/** Format string input mentah menjadi "1.000.000" (tanpa "Rp") saat user mengetik. */
export function formatThousands(input: string): string {
  const digits = input.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("id-ID");
}

/** Ubah string berformat ("1.000.000" / "Rp 1.000.000") menjadi angka polos untuk dikirim ke BE. */
export function parseIDR(input: string): number {
  const digits = input.replace(/[^0-9]/g, "");
  return Number(digits || "0");
}
