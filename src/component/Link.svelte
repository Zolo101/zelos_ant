<script lang="ts">
    const { children, href } = $props();
</script>

<a {href} target="_blank" class="hover:underline">{@render children?.()}</a>
