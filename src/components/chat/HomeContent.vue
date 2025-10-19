<template>
  <div
    class="w-full h-full flex flex-col bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden"
  >
    <!-- Header -->
    <div
      class="bg-gradient-to-br from-[#FF6B00] via-[#FFA14E] to-[#FFE5CC] text-white p-5 relative rounded-t-2xl"
    >
      <button
        @click="emitClose"
        class="absolute right-4 top-4 text-white/80 hover:text-white transition cursor-pointer"
      >
        ✕
      </button>

      <div class="space-y-1">
        <h2 class="text-xl font-semibold flex items-center gap-2">
          Hai, Sobat BNPB <span>👋</span>
        </h2>
        <p class="text-sm leading-snug opacity-95 max-w-[320px]">
          Selamat datang di sistem informasi kebencanaan BNPB.
          Dapatkan bantuan dan informasi terkini secara cepat.
        </p>
      </div>
    </div>

    <!-- Body -->
    <div class="flex-1 p-5 space-y-4 bg-white rounded-b-2xl">
      <!-- Card CTA -->
      <div
        class="w-full bg-gray-50 border border-gray-200 rounded-t-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
        @click="goToChat"
      >
        <div>
          <p class="font-semibold text-gray-800 text-sm">Mulai Percakapan</p>
          <p class="text-xs text-gray-500">AI Assistant siap membantu Anda</p>
        </div>
        <button
          class="bg-[#FF6B00] hover:bg-[#FF8533] active:bg-[#E55A00] text-white p-2.5 rounded-full transition-all duration-200 flex items-center justify-center min-w-[40px] min-h-[40px] cursor-pointer"
          @click.stop="goToChat"
        >
          <i class="ki-outline ki-arrow-right text-base"></i>
        </button>
      </div>

      <!-- Feature list -->
      <div class="pt-2 space-y-3 text-sm text-gray-700">
        <div class="flex items-center gap-3">
          <i class="ki-outline ki-information text-[#FF6B00] text-lg"></i>
          <span>Informasi kebencanaan terkini</span>
        </div>
        <div class="flex items-center gap-3">
          <i class="ki-outline ki-message-text-2 text-[#FF6B00] text-lg"></i>
          <span>Chat dengan AI assistant BNPB</span>
        </div>
        <div class="flex items-center gap-3">
          <i class="ki-outline ki-shield-tick text-[#FF6B00] text-lg"></i>
          <span>Layanan tanggap darurat 24/7</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div
      class="border-t border-gray-100 text-center py-2 text-[11px] text-gray-400 bg-gray-50"
    >
      BNPB Chat Widget • v1.0.0
    </div>
  </div>
</template>

<script setup lang="ts">
interface Emits {
  (e: "close"): void;
  (e: "switch-to-chat"): void;
}

const emit = defineEmits<Emits>();

function emitClose() {
  emit("close");
}

function goToChat() {
  emit("switch-to-chat");
}
</script>
