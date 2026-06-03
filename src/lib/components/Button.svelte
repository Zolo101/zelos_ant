<script lang="ts">
    const { children, class: classNames = "", hotkey = "", ...rest } = $props();
</script>

<button
    class="relative cursor-pointer rounded bg-violet-950/20 px-6 py-2 font-medium text-violet-200 outline-2 outline-violet-900 transition-all hover:bg-violet-950/50 {classNames}"
    {...rest}
>
    {@render children?.()}
    <span class="absolute right-0.75 bottom-0 text-xs text-white opacity-60">{hotkey}</span>
</button>
