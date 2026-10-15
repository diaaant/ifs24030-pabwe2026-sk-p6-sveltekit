<script lang="ts">
  import ModalShell from "../components/ModalShell.svelte";
  import { changeCover } from "../states/coursesStore";
  import { handleResult, showWarningDialog } from "../../../helpers/toolsHelper";

  let { courseId, onClose } = $props();
  let file = $state<File | null>(null);

  const onFile = (event: Event) => {
    file = (event.target as HTMLInputElement).files![0];
  };

  async function submit(event: Event) {
    event.preventDefault();
    if (!file) {
      await showWarningDialog("Pilih berkas cover terlebih dahulu");
      return;
    }
    const res = await changeCover(courseId, file);
    await handleResult(res, onClose);
  }
</script>

<ModalShell title="Ubah Sampul" {onClose}>
  <form onsubmit={submit} class="space-y-3" data-testid="cover-form">
    <input type="file" accept="image/*" aria-label="Pilih berkas sampul" onchange={onFile} data-testid="cover-input" class="text-sm" />
    <button type="submit" class="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-semibold">Unggah sampul</button>
  </form>
</ModalShell>
