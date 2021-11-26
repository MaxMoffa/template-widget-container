<script>

    export let background = "#fff";

</script>

<main class="rounded" style={`background: ${background} !important`}>

    <slot />

</main>

<style>

    main {
        height: 100%;
        width: 100%;
        background-color: #fff;
        /* border-radius: 16px; */
        padding: 8px;
        overflow: auto;
    }

</style>