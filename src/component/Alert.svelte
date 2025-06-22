<script lang="ts">
    import Game from "../ant/Game.svelte";

    let show = false;
    let text = $derived(Game.instance.alertText);

    const close = () => {
        show = false;
        Game.instance.alertText = "";
    };
</script>

<div class="background" class:hidden={!show}></div>
<div class="alert" class:hidden={!show}>
    <p class="text">{text}</p>
    <button class="close button" onclick={close}>OK!</button>
</div>

<style>
    .alert {
        position: absolute;
        outline: 1px solid black;
        padding: 10px;
        top: 30%;
        left: 40%;
        width: 20%;
        /*height: 40%;*/
        z-index: 101;

        background-color: rgba(160, 160, 160, 1);
    }

    .background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
        background-color: rgba(0, 0, 0, 0.4);
    }

    .text {
        text-align: center;
        height: 80%;
    }

    .close {
        text-align: center;
        /*width: 100px;*/
    }

    .hidden {
        display: none;
    }
</style>
