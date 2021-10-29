<script>
    import { onMount } from 'svelte';
    import { Checkbox, Col, Select, Chip, Subheader } from 'svelte-materialify/src';
    import Wapper from "./Wrapper.svelte";

    import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

    export let widget = null;
    export let name = "Widget Name";
    export let state = null
    export let configuration = [];
    export let token = null;
    export let apikey = null;
    export let background = "#ffffff";

    let reloadWidgetOptions = true;
    let old_state = {...state};
    
    onMount(() => {

        if(state === null){
            state = {};
            configuration.forEach(section => {
                section.options.forEach(element => {
                    state[element.key] = null;
                });
            });
            console.log(state);
        }

    })

    function reloadWidget() {
        
        // Verify changes
        let isChanged = false;
        Object.keys(old_state).forEach(key => {
            isChanged = isChanged || old_state[key] !== state[key];
        });
        if(!isChanged)
            return;
        else
            old_state = {...state};
        
        // Reload widget
        setTimeout(() => {
            reloadWidgetOptions = false;
            setTimeout(() => {
                reloadWidgetOptions = true;
            }, 0);
        }, 0);
    }

    function saveState() {
        console.log(state);
        dispatch("saveState", state);
    }

    async function getAsyncSelect(url) {
        let params = new FormData();
        if(apikey)
            params.append("apikey", apikey);
        else
            params.append("token", token);
        let result = await (await (fetch(url, {method: "POST", body: params}))).json();
        return result.result;
    }

    function isDisabled(option) {
        if(option.hasOwnProperty("disabled") && typeof(option.disabled) === "function")
            return option.disabled(state);
        return false;
    }

</script>

<main on:click={(e) => {
    
    if(e.target.nodeName === "MAIN")
        dispatch("close");
    
}}>

    <div class="container" style={widget === null ? "width: 100%; height: 100%; border-radius: 0" : ""}>

        {#if widget !== null}

            <div class="preview">

                <div class="title">

                    <span class="title-text">
                        {name}
                    </span>

                </div>

                <div class="widget">

                    <div class="widget-container" style={`background: ${background}`}>

                        {#if reloadWidgetOptions}
                        
                            <Wapper 
                                {widget}
                                state={JSON.parse(JSON.stringify(state))}
                                {apikey}
                                {token}
                                showOptions={false}
                            />

                        {/if}

                    </div>

                </div>

            </div>
        
        {/if}

        <div class="options" style={widget === null ? "border-radius: 0" : ""}>

            <div class="header" style={widget === null ? "padding: 0 16px" : ""}>

                {#if widget === null}

                    <div class="title">

                        <span class="title-text">
                            {name}
                        </span>

                    </div>
                
                {/if}

                <Chip class="blue white-text" on:click={saveState}>
                    Save
                </Chip>

            </div>

            <div class="options">

                <Col>

                    {#if reloadWidgetOptions}
                        
                        {#each configuration as section}

                            <div class="section-options">

                                <Subheader>
                                    {section.name}
                                </Subheader>

                                <div class="options-container">
                        
                                    {#each section.options as option}
                                                        
                                        {#if state !== null && Object.hasOwnProperty.bind(state)(option.key)}

                                            <div class="option-list-element">
                                        
                                                {#if option.type === "select"}
                                                
                                                    <div class="text-subtitle-1 grey-text text-darken-1">
                                                        {option.name}
                                                    </div>

                                                    <Select disabled={isDisabled(option)} items={option.options} bind:value={state[option.key]} on:change={reloadWidget}>
                                                    </Select>

                                                {:else if option.type === "checkbox"}

                                                    <Checkbox disabled={isDisabled(option)} color="accent" checked={state[option.key]} on:change={(e) => {
                                                        state[option.key] = e.target.checked;
                                                        reloadWidget();
                                                    }}>
                                                        {option.name}
                                                    </Checkbox>

                                                {:else if option.type === "date"}

                                                    <div class="text-subtitle-1 grey-text text-darken-1">
                                                        {option.name}
                                                    </div>

                                                    <input 
                                                        disabled={isDisabled(option)}
                                                        type="date" 
                                                        value={state[option.key] ? new Date(state[option.key]).toISOString().split("T")[0] : null}
                                                        on:change={(e) => {                                                               
                                                            state[option.key] = e.target.valueAsNumber;
                                                            reloadWidget();
                                                        }} 
                                                    />

                                                {:else if option.type === "select_async"}

                                                    <div class="text-subtitle-1 grey-text text-darken-1">
                                                        {option.name}
                                                    </div>

                                                    {#await getAsyncSelect(option.url)}
                                                        ...
                                                    {:then options} 

                                                        <Select disabled={isDisabled(option)} items={options} bind:value={state[option.key]} on:change={reloadWidget}>
                                                        </Select>

                                                    {/await}

                                                {:else if option.type === "select_multiple"}
                                                
                                                    <div class="text-subtitle-1 grey-text text-darken-1">
                                                        {option.name}
                                                    </div>

                                                    <Select disabled={isDisabled(option)} multiple items={option.options} bind:value={state[option.key]} on:change={reloadWidget}>
                                                    </Select>

                                                {/if}

                                            </div>

                                        {/if}

                                    {/each}
                                
                                </div>

                            </div>

                        {/each}

                    {/if}
    
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
        z-index: 1006;
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
        padding: 0 6px;
        border-radius:  0 16px 16px 0;
    }

    main > .container > .options > .header {
        flex: 1;
        display: grid;
        align-items: center;
        justify-items: right;
        grid-auto-flow: column;
    }

    main > .container > .options > .header > .title {
        justify-self: left !important;
    }

    main > .container > .options > .options {
        flex: 9;
        overflow-y: auto;
    }

    .widget-container {
        height: 500px;
        width: 600px;
        border-radius: 16px !important;
        background-color: #fff;
        padding: 8px;
        overflow: auto;
        border: 1px solid grey;
        transform: translateZ(0);
    }

    .section-options {
        width: 100%;
        height: auto;
        padding: 6px 4px;
        background-color: #fff;
        border-radius: 12px;
        margin-bottom: 16px;
    }

    .section-options > .options-container {
        padding: 16px 20px;
    }

    .option-list-element {
        padding: 12px 0;
    }

    .option-list-element > * {
        width: 100%;
    }

    .option-list-element > input[type=date] {
        border-bottom-color: var(--theme-text-fields-border);
        border-bottom-style: solid;
        border-bottom-width: 1px;
    }

</style>