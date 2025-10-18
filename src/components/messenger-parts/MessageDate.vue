<template>
  <div class="flex justify-center items-center my-4 px-4">
    <div
      class="bg-black/5 text-gray-600 text-xs font-medium py-1.5 px-3 rounded-lg text-center tracking-wide shadow-sm backdrop-blur-md border border-black/[0.08] md:text-[0.7rem] md:py-1 md:px-2"
    >
      {{ formattedDate }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLanguageStore } from "@/stores/language";

interface Props {
  date: string;
}

const props = defineProps<Props>();
const { currentMessages, currentLanguage } = useLanguageStore();

const monthNames = computed(() => {
  if (currentLanguage === "id") {
    return [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
  } else {
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
  }
});
const formattedDate = computed(() => {
  try {
    // Parse the date and format as "9 September 2025"
    const date = new Date(props.date);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return props.date; // Return original if invalid
    }

    // Smart date labeling
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Normalize dates to compare only date part (ignore time)
    const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const normalizedToday = normalizeDate(today);
    const normalizedYesterday = normalizeDate(yesterday);
    const normalizedDate = normalizeDate(date);

    // Check if it's today
    if (normalizedDate.getTime() === normalizedToday.getTime()) {
      return currentMessages.today; // Use locale for "Today"
    }

    // Check if it's yesterday
    if (normalizedDate.getTime() === normalizedYesterday.getTime()) {
      return currentMessages.yesterday; // Use locale for "Yesterday"
    }

    // For anything more than 2 days, always use full date format (with year)
    const day = date.getDate(); // No padding for day
    const month = monthNames.value[date.getMonth()];
    const year = date.getFullYear();

    // Always show full format: day + month + year
    return `${day} ${month} ${year}`;
  } catch {
    // Return original date if parsing fails
    return props.date;
  }
});
</script>

<style scoped>
[data-bs-theme="dark"] .bg-black\/5 {
  background-color: rgba(255, 255, 255, 0.08);
  color: var(--bs-gray-400);
  border-color: rgba(255, 255, 255, 0.12);
}
</style>
