<script lang="ts">
  import { resolve } from "$app/paths";
  import LangText from "#lib/components/LangText.svelte";
  import Seo from "#lib/components/Seo.svelte";
  import { site } from "#lib/config/site.js";
  import { formatDate } from "#lib/date.js";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<Seo title={`${data.name} · ${site.title}`} />

<section class="flex flex-col gap-6">
  <p class="text-muted text-sm">
    <a href={resolve("series/")} class="hover:text-foreground hover:underline"
      ><LangText texts={{ ja: "シリーズ", en: "Series" }} /></a
    >
  </p>
  <h1 class="text-2xl font-bold tracking-tight">{data.name}</h1>
  <ol class="flex flex-col gap-3">
    {#each data.posts as post, i (post.slug)}
      <li class="card hover:border-foreground relative flex gap-3">
        <span class="text-muted shrink-0 text-sm">{i + 1}</span>
        <div class="min-w-0">
          <a
            href={resolve(`posts/${post.slug}/`)}
            class="font-medium after:absolute after:inset-0 after:content-[''] hover:underline">{post.title}</a
          >
          <p class="text-muted mt-0.5 text-xs">
            <LangText texts={{ ja: "公開", en: "Published" }} />:
            <time datetime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            · <LangText texts={{ ja: "更新", en: "Updated" }} />:
            <time datetime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
            {#if post.description}
              · {post.description}{/if}
          </p>
        </div>
      </li>
    {/each}
  </ol>
</section>
