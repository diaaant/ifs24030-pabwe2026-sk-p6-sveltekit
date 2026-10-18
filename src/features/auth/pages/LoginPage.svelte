<script lang="ts">
  import { useInput } from "../../../hooks/useInput";
  import { login } from "../states/authStore";
  import { isSuccess } from "../../../helpers/apiHelper";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  const email = useInput();
  const password = useInput();
  const emailValue = email.value;
  const passwordValue = password.value;
  let loading = $state(false);

  // Pengalihan ke beranda dilakukan AuthSessionRedirect setelah profil tersedia.
  async function submit(event: Event) {
    event.preventDefault();
    loading = true;
    const res = await login($emailValue, $passwordValue);
    loading = false;
    if (!isSuccess(res)) await showErrorDialog(res.message);
  }
</script>

<form onsubmit={submit} class="space-y-4" data-testid="login-form">
  <h1 class="text-lg font-bold">Masuk</h1>
  <div>
    <label for="login-email-input" class="block text-sm font-medium mb-1">Email</label>
    <input id="login-email-input" type="email" required value={$emailValue} oninput={email.onChange}
      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
  </div>
  <div>
    <label for="login-password-input" class="block text-sm font-medium mb-1">Kata sandi</label>
    <input id="login-password-input" type="password" required value={$passwordValue} oninput={password.onChange}
      class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
  </div>
  <button id="login-submit-button" type="submit" disabled={loading}
    class="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-semibold disabled:opacity-60">
    {loading ? "Memproses..." : "Masuk"}
  </button>
  <p class="text-sm text-center text-slate-600">
    Belum punya akun? <a href="/auth/register" class="text-indigo-700 font-semibold underline">Daftar</a>
  </p>
</form>
