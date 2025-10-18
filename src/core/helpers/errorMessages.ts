/**
 * User-friendly error messages untuk chat system
 */

export const ERROR_MESSAGES = {
  AI_RESPONSE_FAILED: "Maaf, saat ini asisten AI sedang mengalami gangguan. Silakan coba lagi dalam beberapa saat atau hubungi admin jika masalah berlanjut.",
  NETWORK_ERROR: "Koneksi internet Anda bermasalah. Silakan periksa koneksi dan coba lagi.",
  SERVICE_UNAVAILABLE: "Layanan chat sedang dalam pemeliharaan. Silakan coba lagi nanti.",
  TIMEOUT_ERROR: "Respon AI membutuhkan waktu terlalu lama. Silakan coba kirim pesan dengan kata yang lebih sederhana.",
  GENERAL_ERROR: "Terjadi kesalahan tidak terduga. Silakan coba lagi atau hubungi admin jika masalah berlanjut.",
} as const;

/**
 * Mengkonversi error message teknis menjadi pesan yang user-friendly
 */
export function ErrorMessage(error: string | Error | unknown): string {
  if (typeof error === "string") {
    const lowerError = error.toLowerCase();
    
    // Check for specific error patterns
    if (lowerError.includes("ai response failed") || 
        lowerError.includes("ai tidak memberikan jawaban") ||
        lowerError.includes("failed to generate response")) {
      return ERROR_MESSAGES.AI_RESPONSE_FAILED;
    }
    
    if (lowerError.includes("network") || 
        lowerError.includes("connection") ||
        lowerError.includes("fetch")) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    if (lowerError.includes("timeout") || 
        lowerError.includes("too long")) {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    
    if (lowerError.includes("service unavailable") || 
        lowerError.includes("maintenance")) {
      return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
    }
  }
  
  if (error instanceof Error) {
    return ErrorMessage(error.message);
  }
  
  // Fallback untuk error yang tidak dikenali
  return ERROR_MESSAGES.GENERAL_ERROR;
}

/**
 * Formats error message dengan tambahan troubleshooting tips
 */
export function getErrorMessageWithTips(error: string | Error | unknown): string {
  const baseMessage = ErrorMessage(error);
  
  // Add helpful tips based on error type
  if (baseMessage === ERROR_MESSAGES.AI_RESPONSE_FAILED) {
    return `${baseMessage}\n\n💡 Tips:\n• Coba kirim ulang pesan Anda\n• Gunakan kata-kata yang lebih sederhana\n• Periksa apakah pertanyaan Anda jelas`;
  }
  
  if (baseMessage === ERROR_MESSAGES.NETWORK_ERROR) {
    return `${baseMessage}\n\n💡 Tips:\n• Periksa koneksi Wi-Fi atau data seluler\n• Coba refresh halaman\n• Tutup aplikasi lain yang menggunakan internet`;
  }
  
  if (baseMessage === ERROR_MESSAGES.TIMEOUT_ERROR) {
    return `${baseMessage}\n\n💡 Tips:\n• Pecah pertanyaan panjang menjadi beberapa bagian\n• Hindari pertanyaan yang terlalu kompleks\n• Coba lagi dengan pertanyaan yang lebih spesifik`;
  }
  
  return baseMessage;
}
