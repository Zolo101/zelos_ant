<script lang="ts">
    import type { Snippet } from "svelte";

    type Props = {
        href: string;
        children: Snippet;
        icon?: boolean;
    };

    const { href, children, icon = false }: Props = $props();
</script>

<!-- stolen from zelo.dev -->

{#if icon}
    <span class="site-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
            <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07l-1.62 1.62" />
            <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.62-1.62" />
        </svg>
    </span>
{/if}<a {href} target="_blank" rel="noopener noreferrer">{@render children()}</a>

<style>
    .site-icon {
        display: inline-flex;
        height: 1.5rem;
        width: 1.5rem;
        align-items: center;
        justify-content: center;
        padding: 0.125rem;
        vertical-align: middle;
        color: var(--color-blue-300);
    }

    svg {
        height: 1.1rem;
        width: 1.1rem;
        fill: none;
        stroke: currentColor;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: 2;
    }

    a {
        transition:
            background-color 0.1s ease-out,
            color 0.1s ease-out;
        padding: 0.05rem 0.2rem;
        color: var(--color-blue-400);

        &:hover {
            color: white;
            background-color: var(--color-blue-600);
        }
    }
</style>
