<script lang="ts">
  import { GraduationCap } from "lucide-svelte";

  let { children } = $props();
</script>

<main class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-slate-100">
  <div class="w-full max-w-md">
    <div class="text-center mb-6">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white mb-3">
        <GraduationCap size={28} />
      </div>
      <h1 class="text-2xl font-extrabold">Delcom Courses</h1>
      <p class="text-sm text-slate-600 mt-1">Belajar lewat kursus video dan pantau kemajuan belajarmu.</p>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {@render children()}
    </div>
  </div>
</main>
