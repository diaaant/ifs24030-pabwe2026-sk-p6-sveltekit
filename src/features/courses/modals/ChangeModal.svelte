<script lang="ts">
  import ModalShell from "../components/ModalShell.svelte";
  import { useInput } from "../../../hooks/useInput";
  import { changeCourse } from "../states/coursesStore";
  import { handleResult } from "../../../helpers/toolsHelper";

  let { course, onClose } = $props();

  const title = useInput(course.title);
  const description = useInput(course.description);
  const titleValue = title.value;
  const descriptionValue = description.value;

  async function submit(event: Event) {
    event.preventDefault();
    const res = await changeCourse(course.id, { title: $titleValue, description: $descriptionValue });
    await handleResult(res, onClose);
  }
</script>

<ModalShell title="Ubah Kursus" {onClose}>
  <form onsubmit={submit} class="space-y-3" data-testid="change-form">
    <div>
      <label for="change-title" class="block text-sm font-medium mb-1">Judul</label>
      <input id="change-title" required value={$titleValue} oninput={title.onChange}
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
    </div>
    <div>
      <label for="change-description" class="block text-sm font-medium mb-1">Deskripsi</label>
      <textarea id="change-description" rows="3" required value={$descriptionValue} oninput={description.onChange}
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"></textarea>
    </div>
    <button type="submit" class="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-semibold">Simpan perubahan</button>
  </form>
</ModalShell>
