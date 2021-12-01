<script>
    import { onMount } from 'svelte';
    import { Checkbox, Col, Select, Chip, Subheader, AppBar, TextField, Menu, ListItem, List } from 'svelte-materialify/src';
    import Wapper from "./Wrapper.svelte";
    import PlaceSelector from './PlaceSelector.svelte';
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
    let reloadWidget = true;
    let old_state = {...state};
    let shadowHeader = "elevation-0";
    let lastScrollTop = 0;
    let optionContainer;

    // Variables
    let search_showOptions = true;

    onMount(() => {

        if(state === null){
            state = {};
            configuration.forEach(section => {
                section.options.forEach(element => {
                    state[element.key] = null;
                });
            });
        }

        if(state && typeof(state) === "object" && !state.hasOwnProperty("_timer_refresh"))
            state._timer_refresh = -1;

    })

    function reload(reloadOptions = true) {
        
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
            reloadWidget = false;
            setTimeout(() => {
                reloadWidget = true;
            }, 0);
        }, 0);

        // Reload widget options
        if(!reloadOptions)
            return;
        setTimeout(() => {
            reloadWidgetOptions = false;
            setTimeout(() => {
                reloadWidgetOptions = true;
                setTimeout(() => {
                    console.log(lastScrollTop);
                    optionContainer.scrollTop = lastScrollTop;
                    console.log(optionContainer);
                }, 0);
            }, 0);
        }, 0);
    }

    function saveState() {
        console.log(state);
        dispatch("saveState", state);
    }

    function getParams() {
        let params = new FormData();
        if(apikey)
            params.append("apikey", apikey);
        else
            params.append("token", token);
        return params;
    }

    async function getAsyncSelect(url, map) {
        let params = getParams();
        let result = await (await (fetch(url, {method: "POST", body: params}))).json();
        if(map && typeof(map) === "function")
            return result.result.map(map);
        return result.result;
    }

    function isDisabled(option) {
        if(option.hasOwnProperty("disabled") && typeof(option.disabled) === "function")
            return option.disabled(state);
        return false;
    }
    
    function updateShadow(e) {
        let scrollTop = e.target.scrollTop;
        lastScrollTop = scrollTop !== 0 ? scrollTop : lastScrollTop;
        if(scrollTop === 0)
            shadowHeader = "elevation-0"
        else
            shadowHeader = "elevation-1"
    }

</script>

<main on:click={(e) => {
    
    if(e.target.nodeName === "MAIN")
        dispatch("close");
    
}}>

    <div class="container" style={widget === null ? "width: 100% !important; height: 100% !important; border-radius: 0" : ""}>

        {#if widget !== null}

            <div class="preview">

                <div class="title">

                    <span class="title-text">
                        {name}
                    </span>

                </div>

                <div class="widget">

                    <div class="widget-container" style={`background: ${background}`}>

                        {#if reloadWidget}
                        
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

            <AppBar class={shadowHeader} style="background-color: #eeeeee; height: fit-content; flex: 0">
                <span slot="title">
                    {#if widget === null}
                        {name}
                    {/if}
                </span>
                <div style="flex-grow:1" />
                <Chip class="blue white-text" on:click={saveState} link>
                    Save
                </Chip>
            </AppBar>

            <div class="options" bind:this={optionContainer} on:scroll={updateShadow}>

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

                                                    <Select disabled={isDisabled(option)} items={option.options} bind:value={state[option.key]} on:change={reload}>
                                                    </Select>

                                                {:else if option.type === "checkbox"}

                                                    <Checkbox disabled={isDisabled(option)} color="accent" checked={state[option.key]} on:change={(e) => {
                                                        state[option.key] = e.target.checked;
                                                        reload();
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
                                                            state[option.key] = e.target.valueAsNumber ? e.target.valueAsNumber : null;
                                                            reload();
                                                        }} 
                                                    />

                                                {:else if option.type === "select_async"}

                                                    <div class="text-subtitle-1 grey-text text-darken-1">
                                                        {option.name}
                                                    </div>

                                                    {#await getAsyncSelect(option.url, option.map)}
                                                        ...
                                                    {:then options} 

                                                        <Select disabled={isDisabled(option)} items={options} bind:value={state[option.key]} on:change={reload}>
                                                        </Select>

                                                    {/await}

                                                {:else if option.type === "select_multiple"}
                                                
                                                    <div class="text-subtitle-1 grey-text text-darken-1">
                                                        {option.name}
                                                    </div>

                                                    <Select disabled={isDisabled(option)} multiple items={option.options} bind:value={state[option.key]} on:change={reload}>
                                                    </Select>

                                                {:else if option.type === "place"}
                                                
                                                    <div class="text-subtitle-1 grey-text text-darken-1">
                                                        {option.name}
                                                    </div>

                                                    <div class="map-widget-options rounded">
                                                        <PlaceSelector
                                                            bind:placeSelected={state[option.key]}
                                                            params={getParams()} 
                                                            on:change={() => reload(false)}
                                                        />
                                                    </div>

                                                
                                                {:else if option.type === "text"}
                                                
                                                    <div class="text-subtitle-1 grey-text text-darken-1">
                                                        {option.name}
                                                    </div>

                                                    <TextField 
                                                        filled 
                                                        bind:value={state[option.key]}
                                                        {...option.options}
                                                    />

                                                {:else if option.type === "search"}
                                                
                                                    <div class="text-subtitle-1 grey-text text-darken-1">
                                                        {option.name}
                                                    </div>

                                                    <div style="width: 100%">
                                                        <Menu style="width: 100%">
                                                            <div slot="activator" style="width: 100%">
                                                                <TextField 
                                                                    filled 
                                                                    bind:value={state[option.key].key}
                                                                    {...option.options}
                                                                    on:keydown={() => {
                                                                        search_showOptions = false;
                                                                        setTimeout(() => {
                                                                            search_showOptions = true;
                                                                        }, 0);
                                                                    }}
                                                                    on:focus={() => {
                                                                        search_showOptions = false;
                                                                        setTimeout(() => {
                                                                            search_showOptions = true;
                                                                        }, 0);
                                                                    }}
                                                                />
                                                            </div>
                                                            <List>

                                                                {#if state[option.key] && search_showOptions}
            
                                                                    {#await option.getOptions(state[option.key].key, getParams())}
                                                                        <ListItem>
                                                                            ...
                                                                        </ListItem>
                                                                    {:then result} 
                                                                    
                                                                        {#if result.length === 0}
                                                                            <ListItem>
                                                                                Nessun risultato
                                                                            </ListItem>
                                                                        {/if}
                                                    
                                                                        {#each result as o}
                                                                        
                                                                            <ListItem on:click={() => {
                                                                                state[option.key] = o;
                                                                                reload();
                                                                            }}>
                                                                                {o.key}
                                                                            </ListItem>
                                                    
                                                                        {/each}
                                                    
                                                                        <slot />
                                                                    
                                                                    {:catch e}
                                                    
                                                                        <ListItem>
                                                                            Ops! Sembra esserci un problema
                                                                        </ListItem>
                                                    
                                                                    {/await}
                                                    
                                                                {/if}
                                                                
                                                            </List>
                                                        </Menu>
                                                    </div>

                                                {/if}

                                            </div>

                                        {/if}

                                    {/each}
                                
                                </div>

                            </div>

                        {/each}

                        <div class="section-options">

                            <Subheader>
                                Opzioni aggiuntive
                            </Subheader>

                            <div class="options-container">

                                {#if state.hasOwnProperty("_timer_refresh")}
                                
                                    <div class="option-list-element">

                                        <div class="text-subtitle-1 grey-text text-darken-1">
                                            Refresh automatico
                                        </div>

                                        <Select items={[
                                            {name: "Disablitato", value: -1},
                                            {name: "Ogni minuto", value: 60 * 1000 * 1},
                                            {name: "Ogni 5 min", value: 60 * 1000 * 5},
                                            {name: "Ogni 10 min", value: 60 * 1000 * 10},
                                            {name: "Ogni 15 min", value: 60 * 1000 * 15},
                                        ]} bind:value={state._timer_refresh} on:change={reload}>
                                        </Select>

                                    </div>

                                {/if}

                            </div>

                        </div>

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
        width: 80% !important;
        height: 80% !important;
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
        flex: 2.5;
        background-color: #eeeeee;
        display: flex;
        flex-direction: column;
        border-radius:  0 16px 16px 0;
    }

    main > .container > .options > .options {
        flex: 1;
        overflow-y: auto;
        padding: 0 6px;
        flex-basis: 0;
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

    .option-list-element > .map-widget-options {
        background-color: #eeeeee;
        height: 300px !important;
    }

    :global(.s-menu__wrapper) {
        width: 100%;
    }

</style>