<script>

    import { Icon, Dialog, Button, Row, Col, ProgressCircular } from 'svelte-materialify/src';
    import { mdiDownload, mdiContentCopy } from '@mdi/js';

    export let image = null;
    export let active = false;
    export let name = "screenshot.jpg";

    function saveImage() {
        let a = document.createElement("a");
        a.href = image;
        a.setAttribute("download", name);
        a.click();
    }

    function copyImage() {
        navigator.clipboard.write([new ClipboardItem({'image/png' : dataURItoBlob(image)})]);
    }

    function dataURItoBlob(dataURI) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        var byteString = atob(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);

        // create a view into the buffer
        var ia = new Uint8Array(ab);

        // set the bytes of the buffer to the correct values
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        // write the ArrayBuffer to a blob, and you're done
        var blob = new Blob([ab], {type: mimeString});
        return blob;

    }

    function close() {
        image = null;
        active = false;
    }

    function isCopySupported(name) {
        if(name.includes("gif"))
            return false;
        return true;
    }

</script>

<main isVisible={active}>

    <Dialog bind:active width={500} class="pa-3" on:outroend={close}>

        {#if image}
            <img src={image} alt="image to copy" />
        {:else}
            <div class="loading pt-16 pb-16">
                <ProgressCircular indeterminate color="accent" />
            </div>
        {/if}
    
        <Row>
            <Col>
                <Button disabled={!image} depressed block class="green white-text" on:click={saveImage}>
                    <Icon path={mdiDownload} class="mr-3" />
                    Scarica
                </Button>
            </Col>
            {#if typeof(ClipboardItem) === "function" && isCopySupported(name)}
                <Col>
                    <Button disabled={!image} depressed block class="primary-color white-text" on:click={copyImage}>
                        <Icon path={mdiContentCopy} class="mr-3" />
                        Copia
                    </Button>
                </Col>
            {/if}
        </Row>
        <Button depressed outlined block class="red-text" on:click={close}>
            Chiudi
        </Button>
    </Dialog>

</main>

<style>

    main {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 1006;
    }

    main[isVisible=false] {
        pointer-events: none;
    }

    img {
        width: 100%;
        height: auto;
    }

    .loading {
        display: grid;
        place-items: center;
    }

</style>