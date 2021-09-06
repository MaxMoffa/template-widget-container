<script>
    import { onMount } from 'svelte';
    import { Button, Col, Select, Chip, Subheader } from 'svelte-materialify/src';
    import Wapper from "./Wrapper.svelte";

    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

    export let widget = null;
    export let name = "Widget Name";
    export let state = null
    export let options = [];
    export let apikey = null;

    let centraline = ["ITPIETOR33456M", "ITPIETOR23456M", "ITPIETOR13456M"];
    let showWidget = true;
    
    onMount(() => {

        if(state === null){

            state = {
                centralina: null,
                date: null
            };

        }

    })

    function reloadWidget() {
        showWidget = false;
        setTimeout(() => {
            showWidget = true;
        }, 100);
    }

    function saveState() {
        dispatch("saveState", state);
    }

</script>

<main on:click={(e) => {
    
    if(e.target.nodeName === "MAIN")
        dispatch("close");
    
}}>

    <div class="container">

        <div class="preview">

            <div class="title">

                <span class="title-text">
                    Gestione centraline
                </span>

            </div>

            <div class="widget">

                <div class="widget-container">

                    {#if widget !== null && showWidget}
                    
                        <Wapper 
                            {widget}
                            state={JSON.parse(JSON.stringify(state))}
                            {apikey}
                        />

                    {/if}

                </div>

            </div>

        </div>

        <div class="options">

            <div class="header">

                <Chip class="blue white-text" on:click={saveState}>
                    Save
                </Chip>

            </div>

            <div class="options">

                <Col>
    
                    <Select filled items={centraline} bind:value={state.centralina} on:change={reloadWidget}>
                        Centralina
                    </Select>
        
                    <input type="date" id="date-selector-centraline" valueAsDate={state.date} on:change={(e) => state.date = e.target.valueAsDate} on:change={reloadWidget}>
    
                </Col>

            </div>

        </div>

    </div>

</main>

<style>

    main {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-color: rgba(255, 255, 255, 0.6);
        display: grid;
        place-items: center;
    }

    main > .container {
        width: 80%;
        height: 80%;
        background-color: #fff;
        border-radius: 16px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: row;
    }

    main > .container > .preview {
        flex: 3;
        display: flex;
        flex-direction: column;
        padding: 0 32px;
    }

    main > .container > .preview > .title {
        flex: 1;
        display: grid;
        align-items: center;
    }

    main > .container > .preview > .widget {
        flex: 9;
        display: grid;
        place-items: center;
    }

    main > .container > .options {
        flex: 2;
        background-color: #a1e5ab;
        display: flex;
        flex-direction: column;
        padding: 0 32px;
    }

    main > .container > .options > .header {
        flex: 1;
        display: grid;
        align-items: center;
        justify-content: right;
    }

    main > .container > .options > .options {
        flex: 9;
    }

    .widget-container {
        height: 500px;
        width: 600px;
        border-radius: 16px !important;
        background-color: #fff;
        padding: 8px;
        overflow: auto;
        border: 1px solid grey
    }

</style>