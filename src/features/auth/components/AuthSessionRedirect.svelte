<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { authToken, isAuthLogin, logout } from "../states/authStore";
  import { profile, loadProfile } from "../../users/states/usersStore";
  import { isSuccess } from "../../../helpers/apiHelper";

  // Sesi dipulihkan dari token tersimpan: muat profil, lalu tandai status login.
  onMount(async () => {
    if ($authToken && !$profile) {
      const res = await loadProfile();
      if (isSuccess(res)) isAuthLogin.set(true);
      else logout();
    }
  });

  // Alihkan ke beranda hanya setelah token, status login, dan profil sama-sama siap.
  $effect(() => {
    if ($authToken && $isAuthLogin && $profile) goto("/");
  });
</script>
