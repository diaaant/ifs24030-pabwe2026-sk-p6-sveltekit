<script lang="ts">
  import { untrack } from "svelte"; // 1. Tambahkan import ini
  import ModalShell from "../components/ModalShell.svelte";
  import { useInput } from "../../../hooks/useInput";
  import { addContent, changeContent } from "../states/coursesStore";
  import { handleResult } from "../../../helpers/toolsHelper";

  let { courseId, item, onClose } = $props();

  // 2. Bungkus dengan untrack()
  const title = untrack(() => useInput(item ? item.title : ""));
  const youtube = untrack(() => useInput(item ? item.youtube : ""));
  
  const titleValue = title.value;
  const youtubeValue = youtube.value;

  async function submit(event: Event) {
    event.preventDefault();
    const data = { title: $titleValue, youtube: $youtubeValue };
    const res = item
      ? await changeContent(courseId, item.id, data)
      : await addContent(courseId, data);
    await handleResult(res, onClose);
  }
</script>

<ModalShell title={item ? "Ubah Konten" : "Tambah Konten"} {onClose}>
  <form onsubmit={submit} class="space-y-3" data-testid="content-form">
    <div>
      <label for="content-title" class="block text-sm font-medium mb-1">Judul materi</label>
      <input id="content-title" required value={$titleValue} oninput={title.onChange}
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
    </div>
    <div>
      <label for="content-youtube" class="block text-sm font-medium mb-1">Tautan YouTube</label>
      <input id="content-youtube" type="url" required value={$youtubeValue} oninput={youtube.onChange}
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
    </div>
    <button type="submit" class="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-semibold">Simpan</button>
  </form>
</ModalShell>