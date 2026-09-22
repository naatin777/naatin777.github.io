<script lang="ts">
  import { author } from "$lib/config/site";
  import { socialLinks } from "$lib/config/social";

  const year = new Date().getFullYear();
</script>

<footer class="border-border border-t">
  <div class="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-8">
    <div class="flex flex-wrap items-center justify-center gap-4">
      {#each socialLinks as link (link.name)}
        <a href={link.url} target="_blank" rel="noopener noreferrer me" aria-label={link.label}>
          <img src={link.iconLight} alt="" aria-hidden="true" width="24" height="24" class="size-6 dark:hidden" />
          <img src={link.iconDark} alt="" aria-hidden="true" width="24" height="24" class="hidden size-6 dark:block" />
        </a>
      {/each}
    </div>
    <p class="text-muted text-center text-xs leading-tight">
      &copy; {year}
      {author.displayName}. All Rights Reserved.
    </p>
  </div>
</footer>
