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
    try {
      if ($authToken) {
        if (!$profile) {
          const res = await loadProfile();
          if (isSuccess(res)) {
            isAuthLogin.set(true);
          } else {
            logout();
          }
        } else {
          isAuthLogin.set(true);
        }
      }
    } catch (error) {
      console.error("Gagal memuat profil:", error);
      logout();
    } finally {
      sessionChecked = true;
    }
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

  const pathname = $derived(page?.url?.pathname || "/");
  const isAuthRoute = $derived(pathname.startsWith("/auth"));
  const isLoggedIn = $derived(!!($authToken && $isAuthLogin && $profile));
</script>

{#if !sessionChecked}
  <div class="min-h-screen flex items-center justify-center">
    <h1 class="text-slate-500 text-xl font-bold">Memuat...</h1>
  </div>
{:else if isLoggedIn && isAuthRoute}
  <div class="min-h-screen flex items-center justify-center">
    <h1 class="text-slate-500 text-xl font-bold">Mengalihkan...</h1>
  </div>
{:else if isLoggedIn && !isAuthRoute}
  {@render children?.()}
{:else if !$authToken && isAuthRoute}
  {@render children?.()}
{:else}
  <div class="min-h-screen flex items-center justify-center">
    <h1 class="text-slate-500 text-xl font-bold">Mengalihkan...</h1>
  </div>
{/if}