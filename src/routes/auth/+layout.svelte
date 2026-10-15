<script lang="ts">
  import AuthLayout from "../../features/auth/layouts/AuthLayout.svelte";
  import AuthSessionRedirect from "../../features/auth/components/AuthSessionRedirect.svelte";

  let { children } = $props();
</script>

<AuthSessionRedirect />
<AuthLayout>
  {@render children()}
</AuthLayout>
