<script lang="ts">
  import "../index.css";
  import { page } from "$app/state";
  import CourseLayout from "../features/courses/layouts/CourseLayout.svelte";
  import AuthSessionRedirect from "../features/auth/components/AuthSessionRedirect.svelte";

  let { children } = $props();

  const isAuthRoute = $derived(page.url.pathname.startsWith("/auth"));
</script>

{#if isAuthRoute}
  {@render children?.()}
{:else}
  <AuthSessionRedirect>
    <CourseLayout>
      {@render children?.()}
    </CourseLayout>
  </AuthSessionRedirect>
{/if}