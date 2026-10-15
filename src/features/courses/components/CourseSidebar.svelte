<script lang="ts">
  import { GraduationCap, Users, User } from "lucide-svelte";
  import { page } from "$app/state";
  import { cn } from "../../../helpers/toolsHelper";

  const menuClass = (path: string, href: string) =>
    cn(
      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
      path === href ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
    );
</script>

<aside class="w-56 shrink-0 bg-white border-r border-slate-200 p-3 hidden sm:block">
  <nav class="space-y-1">
    <a href="/" class={menuClass(page.url.pathname, "/")}><GraduationCap size={18} /> Semua Kursus</a>
    <a href="/users" class={menuClass(page.url.pathname, "/users")}><Users size={18} /> Pengguna</a>
    <a href="/profile" class={menuClass(page.url.pathname, "/profile")}><User size={18} /> Profil</a>
  </nav>
</aside>
