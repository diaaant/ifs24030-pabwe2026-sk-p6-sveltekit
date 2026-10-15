<script lang="ts">
  import { onMount } from "svelte";
  import { Check } from "lucide-svelte";
  import { content, loadContent, setLearnStatus } from "../states/coursesStore";
  import { getYoutubeId, handleResult } from "../../../helpers/toolsHelper";

  let { courseId, contentId } = $props();

  const noop = () => {};

  onMount(() => {
    content.set(null);
    loadContent(contentId);
  });

  async function toggle(current: number) {
    await handleResult(await setLearnStatus(contentId, current === 1 ? 0 : 1), noop);
  }
</script>

<section class="max-w-3xl space-y-4">
  <a href={`/courses/${courseId}`} class="text-sm text-indigo-600 font-semibold">&larr; Kembali ke kursus</a>

  {#if $content}
    {@const videoId = getYoutubeId($content.youtube)}
    <h1 class="text-xl font-bold" data-testid="content-title">{$content.title}</h1>
    {#if videoId}
      <div class="aspect-video rounded-2xl overflow-hidden bg-black">
        <iframe
          title={$content.title}
          src={`https://www.youtube.com/embed/${videoId}`}
          class="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    {:else}
      <p class="text-slate-500" data-testid="invalid-video">Tautan video tidak valid.</p>
    {/if}
    <button type="button" onclick={() => toggle($content.status)}
      class="flex items-center gap-1 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold">
      <Check size={16} />
      {$content.status === 1 ? "Tandai belum selesai" : "Tandai selesai"}
    </button>
  {:else}
    <p class="text-slate-500" data-testid="loading">Memuat materi...</p>
  {/if}
</section>
