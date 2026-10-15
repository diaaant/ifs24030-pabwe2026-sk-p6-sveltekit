<script lang="ts">
  import ModalShell from "../components/ModalShell.svelte";
  import { useInput } from "../../../hooks/useInput";
  import { addCourse } from "../states/coursesStore";
  import { handleResult } from "../../../helpers/toolsHelper";

  let { onClose } = $props();

  const title = useInput();
  const description = useInput();
  const titleValue = title.value;
  const descriptionValue = description.value;

  async function submit(event: Event) {
    event.preventDefault();
    const res = await addCourse({ title: $titleValue, description: $descriptionValue });
    await handleResult(res, onClose);
  }
</script>

<ModalShell title="Tambah Kursus" {onClose}>
  <form onsubmit={submit} class="space-y-3" data-testid="add-form">
    <div>
      <label for="add-title" class="block text-sm font-medium mb-1">Judul</label>
      <input id="add-title" required value={$titleValue} oninput={title.onChange}
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
    </div>
    <div>
      <label for="add-description" class="block text-sm font-medium mb-1">Deskripsi</label>
      <textarea id="add-description" rows="3" required value={$descriptionValue} oninput={description.onChange}
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"></textarea>
    </div>
    <button type="submit" class="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-semibold">Simpan</button>
  </form>
</ModalShell>
