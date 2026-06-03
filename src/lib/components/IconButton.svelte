<script lang="ts">
    import Icons from "$lib/assets/Icons.svelte";

    const { icon, class: classNames = "", hotkey = "", ...rest } = $props();
</script>

<button
    class="relative cursor-pointer rounded bg-violet-300 px-3 py-2 font-medium text-white outline outline-violet-900/50 transition-colors *:m-auto hover:bg-violet-950/50 dark:bg-violet-950 {classNames}"
    {...rest}
>
    <Icons name={icon} width="60" height="40" />
    <span class="absolute right-0.75 bottom-0">{hotkey}</span>
</button>
