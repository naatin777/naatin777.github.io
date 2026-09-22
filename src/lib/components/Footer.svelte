<script lang="ts">
  import { author } from "$lib/config/site";
  import { socialLinks } from "$lib/config/social";
  import SocialIcon from "./SocialIcon.svelte";

  const year = new Date().getFullYear();
</script>

<footer class="border-border border-t">
  <div class="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-8">
    <div class="flex flex-wrap items-center justify-center gap-4">
      {#each socialLinks as link (link.name)}
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer me"
          aria-label={link.name}
          class="text-muted hover:text-foreground p-1 transition-colors"
        >
          <SocialIcon icon={link.icon} />
        </a>
      {/each}
    </div>
    <p class="text-muted text-center text-xs leading-tight">
      &copy; {year}
      {author.displayName}. All Rights Reserved.
    </p>
  </div>
</footer>
