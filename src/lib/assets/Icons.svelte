<script module lang="ts">
    type Glob = Record<string, { default: string }>;
    const Icons: Glob = import.meta.glob("$lib/assets/icons/*.svg", {
        eager: true,
        query: "?raw"
    });
</script>

<script lang="ts">
    // stolen from 5beam lol

    interface Props {
        // TODO: Make an "unknown" icon
        name: string;
        width: string;
        height: string;
        fill?: string;
    }

    let { name, width, height, fill = "currentColor" }: Props = $props();

    const filename = $derived(`/src/lib/assets/icons/${name.toLowerCase()}.svg`);
    const html = $derived(
        Icons[filename].default.replace(
            "<svg",
            `<svg width="${width}" height="${height}" fill="${fill}"`
        )
    );
</script>

{@html html}
