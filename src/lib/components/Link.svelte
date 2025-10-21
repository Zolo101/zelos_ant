<script lang="ts">
    const { children, href } = $props();
</script>

<a {href} target="_blank" class="font-black hover:underline">{@render children?.()}</a>
