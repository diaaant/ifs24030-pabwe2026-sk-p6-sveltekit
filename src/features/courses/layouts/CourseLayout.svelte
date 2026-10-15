<script lang="ts">
  import { onMount } from "svelte";
  import CourseNavbar from "../components/CourseNavbar.svelte";
  import CourseSidebar from "../components/CourseSidebar.svelte";
  import { profile, loadProfile } from "../../users/states/usersStore";
  import { logout } from "../../auth/states/authStore";
  import { isSuccess } from "../../../helpers/apiHelper";

  let { children } = $props();

  onMount(async () => {
    if (!$profile) {
      const res = await loadProfile();
      if (!isSuccess(res)) logout();
    }
  });
</script>

<div class="min-h-screen flex flex-col">
  <CourseNavbar />
  <div class="flex flex-1">
    <CourseSidebar />
    <main class="flex-1 p-4 sm:p-6 min-w-0">
      {@render children()}
    </main>
  </div>
</div>
