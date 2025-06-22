<script lang="ts">
    let { ...rest } = $props();
</script>

<button
    class="cursor-pointer rounded px-3 py-1 font-bold text-purple-200 outline-2 outline-purple-900 transition-all hover:bg-purple-900/25"
    {...rest}
>
    <slot />
</button>
