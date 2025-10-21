<script lang="ts">
    const { children, class: classNames = "", hotkey = "", ...rest } = $props();
</script>

<button
    class="relative cursor-pointer rounded bg-purple-950/20 px-6 py-2 font-medium text-purple-200 outline-2 outline-purple-900 transition-all hover:bg-purple-950/50 {classNames}"
    {...rest}
>
    {@render children?.()}
    <span class="absolute right-0.75 bottom-0 text-xs text-white opacity-60">{hotkey}</span>
</button>
