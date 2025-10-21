<script lang="ts">
    import Icons from "$lib/assets/Icons.svelte";

    const { icon, class: classNames = "", hotkey = "", ...rest } = $props();
</script>

<button
    class="relative cursor-pointer rounded bg-purple-950/20 px-3 py-2 font-medium text-purple-200 outline outline-purple-900/50 transition-colors hover:bg-purple-950/50 {classNames}"
    {...rest}
>
    <Icons name={icon} width="30" height="30" />
    <span class="absolute right-0.75 bottom-0 text-xs text-white opacity-60">{hotkey}</span>
</button>
