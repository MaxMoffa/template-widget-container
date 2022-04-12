<script>
    export let background = "";
</script>

<main class="rounded-lg elevation-1 {background}">

    <slot />

</main>

<style>
    main {
        height: 100%;
        width: 100%;
        overflow: hidden;
    }
</style>