<script lang="ts">
  import "../index.css";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import CourseLayout from "../features/courses/layouts/CourseLayout.svelte";
  import { authToken } from "../features/auth/states/authStore";

  let { children } = $props();

  const isAuthRoute = $derived(page.url.pathname.startsWith("/auth"));

  // Halaman selain /auth membutuhkan token.
  $effect(() => {
    if (!isAuthRoute && !$authToken) goto("/auth/login", { replaceState: true });
  });
</script>

{#if isAuthRoute}
  {@render children()}
{:else}
  <CourseLayout>
    {@render children()}
  </CourseLayout>
{/if}
