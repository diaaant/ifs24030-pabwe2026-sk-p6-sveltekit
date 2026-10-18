<script lang="ts">
  import { onMount } from "svelte";
  import { GraduationCap, Plus, Trash2 } from "lucide-svelte";
  import AddModal from "../modals/AddModal.svelte";
  import { courses, loadCourses, removeCourse, removeAllCourses } from "../states/coursesStore";
  import { profile } from "../../users/states/usersStore";
  import { handleResult, showConfirmDialog } from "../../../helpers/toolsHelper";

  let search = $state("");
  let onlyMine = $state(false);
  let showAdd = $state(false);

  const noop = () => {};
  const isMine = (item: any) => item.user_id === ($profile || {}).id;

  const filtered = $derived(
    $courses.filter(
      (item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) && (!onlyMine || isMine(item))
    )
  );

  onMount(() => {
    loadCourses();
  });

  async function remove(item: any) {
    if (await showConfirmDialog(`Hapus kursus "${item.title}"?`)) {
      await handleResult(await removeCourse(item.id), noop);
    }
  }

  async function removeAll() {
    if (await showConfirmDialog("Hapus semua kursus? Tindakan ini tidak dapat dibatalkan.")) {
      await handleResult(await removeAllCourses(), noop);
    }
  }
</script>

<section class="space-y-5">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h1 class="text-xl font-bold">Semua Kursus</h1>
    <div class="flex gap-2">
      <button type="button" onclick={removeAll}
        class="flex items-center gap-1 rounded-lg border border-red-200 text-red-600 px-3 py-2 text-sm font-semibold">
        <Trash2 size={16} /> Hapus semua
      </button>
      <button type="button" onclick={() => (showAdd = true)}
        class="flex items-center gap-1 rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm font-semibold">
        <Plus size={16} /> Tambah
      </button>
    </div>
  </div>

  <div class="flex flex-wrap items-center gap-3">
    <input type="search" placeholder="Cari kursus..." bind:value={search} aria-label="Cari"
      class="flex-1 min-w-48 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
    <label class="flex items-center gap-2 text-sm" for="only-mine">
      <input id="only-mine" type="checkbox" bind:checked={onlyMine} /> Milik saya
    </label>
  </div>

  {#if filtered.length === 0}
    <p class="text-slate-500" data-testid="empty">Tidak ada kursus.</p>
  {:else}
    <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each filtered as item (item.id)}
        <li class="bg-white border border-slate-200 rounded-2xl overflow-hidden" data-testid="card">
          {#if item.cover}
            <img src={item.cover} alt={item.title} class="h-32 w-full object-cover" />
          {:else}
            <div class="h-32 flex items-center justify-center bg-indigo-50 text-indigo-400"><GraduationCap size={36} /></div>
          {/if}
          <div class="p-4 space-y-2">
            <a href={`/courses/${item.id}`} class="block font-bold truncate hover:text-indigo-600">{item.title}</a>
            <p class="text-sm text-slate-500 line-clamp-2">{item.description}</p>
            <button type="button" onclick={() => remove(item)} aria-label={`Hapus ${item.title}`}
              class="text-red-700 text-sm flex items-center gap-1"><Trash2 size={14} /> Hapus</button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

{#if showAdd}
  <AddModal onClose={() => (showAdd = false)} />
{/if}