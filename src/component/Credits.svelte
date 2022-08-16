<script lang="ts">

    import Link from "./Link.svelte";
</script>

<div class="credits">
    <img src="zelos_ant_3x.png" alt="Zelo's Ant Logo"/>
    <p class="credit">zelo's ant 1.0.0</p>
    <p class="credit">Made by Zelo101</p>
    <p>Libraries used:</p>
    <ul>
        <li><Link href="https://ramdajs.com/">Ramda</Link></li>
        <li><Link href="https://developers.google.com/blockly">Blockly</Link></li>
        <li><Link href="https://www.assemblyscript.org/">AssemblyScript</Link></li>
        <li><Link href="https://kit.svelte.dev/">SvelteKit</Link></li>
    </ul>
</div>

<style>
    li, .credit {
        font-weight: bold;
    }
</style>