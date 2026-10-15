<script lang="ts">
  import { onMount } from "svelte";
  import { GraduationCap, Pencil, Trash2, Plus, Image, Star, Video } from "lucide-svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ContentModal from "../modals/ContentModal.svelte";
  import {
    course,
    loadCourse,
    joinCourse,
    leaveCourse,
    rateCourse,
    removeContent,
  } from "../states/coursesStore";
  import { profile } from "../../users/states/usersStore";
  import { handleResult, showConfirmDialog } from "../../../helpers/toolsHelper";

  let { courseId } = $props();

  let showChange = $state(false);
  let showCover = $state(false);
  let showContent = $state(false);
  let editingContent = $state<any>(null);

  const noop = () => {};
  const me = $derived(($profile || {}).id);

  onMount(() => {
    course.set(null);
    loadCourse(courseId);
  });

  const average = (ratings: { rating: number }[]) =>
    ratings.length === 0 ? 0 : ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

  const openContent = (item: any) => {
    editingContent = item;
    showContent = true;
  };

  async function join() {
    await handleResult(await joinCourse(courseId), noop);
  }

  async function leave() {
    if (await showConfirmDialog("Keluar dari kursus ini?")) {
      await handleResult(await leaveCourse(courseId), noop);
    }
  }

  async function rate(value: number) {
    await handleResult(await rateCourse(courseId, value), noop);
  }

  async function removeItem(item: any) {
    if (await showConfirmDialog(`Hapus konten "${item.title}"?`)) {
      await handleResult(await removeContent(courseId, item.id), noop);
    }
  }
</script>

<section class="max-w-3xl space-y-5">
  <a href="/" class="text-sm text-indigo-600 font-semibold">&larr; Semua Kursus</a>

  {#if $course}
    {@const isOwner = $course.user_id === me}
    {@const isStudent = $course.students.some((s: any) => s.id === me)}
    {@const ratingText = `${average($course.ratings).toFixed(1)} (${$course.ratings.length} rating)`}
    {@const studentTitle = `Peserta (${$course.students.length})`}
    <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {#if $course.cover}
        <img src={$course.cover} alt={$course.title} class="h-48 w-full object-cover" />
      {:else}
        <div class="h-48 flex items-center justify-center bg-indigo-50 text-indigo-400"><GraduationCap size={48} /></div>
      {/if}
      <div class="p-5 space-y-3">
        <h1 class="text-xl font-bold" data-testid="detail-title">{$course.title}</h1>
        <p class="text-slate-600">{$course.description}</p>
        <p class="text-sm text-slate-500 flex items-center gap-1" data-testid="rating-average">
          <Star size={14} /> <span>{ratingText}</span>
        </p>

        {#if isOwner}
          <div class="flex flex-wrap gap-2" data-testid="owner-actions">
            <button type="button" onclick={() => (showChange = true)}
              class="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"><Pencil size={14} /> Ubah data</button>
            <button type="button" onclick={() => (showCover = true)}
              class="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"><Image size={14} /> Ubah sampul</button>
          </div>
        {:else if isStudent}
          <div class="space-y-2" data-testid="student-actions">
            <div class="flex items-center gap-1">
              <span class="text-sm mr-2">Beri rating:</span>
              {#each [1, 2, 3, 4, 5] as value (value)}
                <button type="button" onclick={() => rate(value)} aria-label={`Beri rating ${value}`}><Star size={20} /></button>
              {/each}
            </div>
            <button type="button" onclick={leave}
              class="rounded-lg border border-red-200 text-red-600 px-3 py-2 text-sm font-semibold">Keluar dari kursus</button>
          </div>
        {:else}
          <button type="button" onclick={join}
            class="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-semibold">Daftar kursus</button>
        {/if}
      </div>
    </div>

    {#if isOwner}
      <div class="space-y-2">
        <h2 class="font-bold">{studentTitle}</h2>
        {#if $course.students.length === 0}
          <p class="text-slate-500" data-testid="no-students">Belum ada peserta.</p>
        {:else}
          <ul class="flex flex-wrap gap-2">
            {#each $course.students as student (student.id)}
              <li class="rounded-full bg-slate-100 px-3 py-1 text-sm" data-testid="student">{student.name}</li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="font-bold">Konten</h2>
        {#if isOwner}
          <button type="button" onclick={() => openContent(null)}
            class="flex items-center gap-1 rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm font-semibold"><Plus size={14} /> Tambah konten</button>
        {/if}
      </div>
      {#if !isOwner && !isStudent}
        <p class="text-slate-500" data-testid="locked">Daftar kursus untuk mengakses materi.</p>
      {:else if $course.contents.length === 0}
        <p class="text-slate-500" data-testid="no-contents">Belum ada konten.</p>
      {:else}
        <ul class="space-y-2">
          {#each $course.contents as item (item.id)}
            <li class="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3" data-testid="content-item">
              <a href={`/courses/${courseId}/contents/${item.id}`} class="flex items-center gap-2 min-w-0">
                <Video size={18} />
                <span class="font-semibold truncate">{item.title}</span>
                {#if item.status === 1}<span class="text-xs rounded-full bg-green-100 text-green-700 px-2 py-0.5">Selesai</span>{/if}
              </a>
              {#if isOwner}
                <div class="flex gap-2 shrink-0">
                  <button type="button" onclick={() => openContent(item)} aria-label={`Ubah ${item.title}`}><Pencil size={16} /></button>
                  <button type="button" onclick={() => removeItem(item)} aria-label={`Hapus ${item.title}`} class="text-red-700"><Trash2 size={16} /></button>
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {:else}
    <p class="text-slate-500" data-testid="loading">Memuat kursus...</p>
  {/if}
</section>

{#if showChange}
  <ChangeModal course={$course} onClose={() => (showChange = false)} />
{/if}
{#if showCover}
  <ChangeCoverModal {courseId} onClose={() => (showCover = false)} />
{/if}
{#if showContent}
  <ContentModal {courseId} item={editingContent} onClose={() => (showContent = false)} />
{/if}
