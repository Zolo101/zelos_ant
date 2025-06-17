<script lang="ts">
    let { ...rest } = $props();
</script>

<button class="cursor-pointer rounded px-3 py-1 outline-2 outline-white" {...rest}>
    <slot />
</button>
