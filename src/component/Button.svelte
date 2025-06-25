<script lang="ts">
    const { children, class: classNames, ...rest } = $props();
</script>

<button
    class="cursor-pointer rounded bg-neutral-900 px-3 py-1 font-bold text-purple-200 outline-2 outline-purple-900 transition-all hover:bg-neutral-800 {classNames}"
    {...rest}
>
    {@render children?.()}
</button>
