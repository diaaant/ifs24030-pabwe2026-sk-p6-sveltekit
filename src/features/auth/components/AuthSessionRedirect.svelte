<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { authToken, isAuthLogin, logout } from "../states/authStore";
  import { profile, loadProfile } from "../../users/states/usersStore";
  import { isSuccess } from "../../../helpers/apiHelper";

  let { children } = $props();

  let sessionChecked = $state(false);

  onMount(async () => {
    if ($authToken) {
      if (!$profile) {
        const res = await loadProfile();
        if (isSuccess(res)) {
          isAuthLogin.set(true);
        } else {
          logout();
        }
      } else {
        // FIX: Jika profil sudah ada, pastikan status login diset true
        isAuthLogin.set(true);
      }
    }
    sessionChecked = true;
  });

  $effect(() => {
    if (!sessionChecked) return;

    const pathname = page?.url?.pathname || "/";
    const isAuthRoute = pathname.startsWith("/auth");

    if ($authToken && $isAuthLogin && $profile) {
      if (isAuthRoute) {
        goto("/", { replaceState: true });
      }
    } else if (!$authToken && !isAuthRoute) {
      goto("/auth/login", { replaceState: true });
    }
  });
</script>

{#if !sessionChecked}
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-slate-500">Memuat...</p>
  </div>
{:else if $authToken && $isAuthLogin && $profile}
  {@render children?.()}
{:else}
  <div class="min-h-screen flex items-center justify-center">
    <p class="text-slate-500">Mengalihkan...</p>
  </div>
{/if}