<script>
    import { AppBar, Button, Icon, Chip, SlideGroup, SlideItem } from 'svelte-materialify/src';
    import { mdiClose } from '@mdi/js';
    import WidgetElement from '../components/widgetElement.svelte';
    import { createEventDispatcher } from 'svelte';
    import NetworkUtils from '../utils/network_utils';
    const dispatch = createEventDispatcher();
    import { theme, getBackground } from '../store/theme';
    import { onDestroy } from "svelte";
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

    let _theme = "light";
    let unsubscribeTheme = theme.subscribe(val => _theme = val);
    
    export let isVisible = false;
    export let isContentVisible = false;
    export let token;
    export let dictionary =  new LangUtils("en", {}); 

    let topics = ["Tutti", "Analitico", "Georeferenziato", "Smart", "Admin"]
    let headerClass = "elevation-0";
    let category = 0;
    let widgets = null;

    $: {
        if(isVisible)
            showMenu();
    }

    onDestroy(() => {
        unsubscribeTheme();
    });

    function updateShadow(e) {
        let scrollTop = e.target.scrollTop;
        if(scrollTop === 0)
            headerClass = "elevation-0"
        else
            headerClass = "elevation-1"
    }

    function closeMenuBackground(e) {
        if(e.target.classList.contains("side-menu-container"))
            closeMenu();
    }

    function closeMenu() {
        if(!isVisible)
            return;
        isContentVisible = false;
        setTimeout(() => {
            isVisible = false;
        }, 500);
    }

    function showMenu() {
        console.log("test");
        if(!isVisible)
            return;
        setTimeout(() => {
            isContentVisible = true;
        }, 0);
    }

    async function elenco_widget() {

        if(widgets !== null && Array.isArray(widgets))
            return widgets;

        let p = new FormData();
        p.append("token", token);
        try {
            let data = await NetworkUtils.getServerUtenti("lista_widget", {
                method: "POST",
                body: p
            });
            if(data.response_code === 200){
                widgets = data.result
                return data.result;
            }
            widgets = [];
            return [];
        } catch (error) {
            console.log(error);
            return [];
        }
    }

</script>

{#if isVisible}

    <main class="side-menu-container" {isContentVisible} on:click={closeMenuBackground}>

        {#if isContentVisible}
        
            <div class="side-menu elevation-3 {getBackground(_theme)}" on:scroll={updateShadow} transition:fly="{{delay: 0, duration: 300, x: 350, y: 0, opacity: 0.5, easing: quintOut}}">

                <div class={`header ${headerClass}`}>

                    <AppBar class="elevation-0 {getBackground(_theme)}" style="background-color: transparent">
                        <span slot="title">{dictionary.getString("myWidgets")}</span>
                        <div style="flex-grow:1" />
                        <Button icon on:click={closeMenu}>
                            <Icon path={mdiClose} />
                        </Button>
                    </AppBar>
            
                    <div class="topics {getBackground(_theme)}">

                        <SlideGroup mandatory bind:value={category}>
                        
                            {#each topics as topic}
                            
                                <SlideItem let:active>
                                    <Chip outlined={!active} class="ma-2" link>{dictionary.getString(topic)}</Chip>
                                </SlideItem>

                            {/each}

                        </SlideGroup>
            
                    </div>

                </div>

                <div class="widget-list">

                    {#await elenco_widget()}

                    {:then widgets}
                    
                        {#each widgets as widget}

                            {#if category === 0 || widget.famiglia === topics[category]}
                            
                                <div class="widget-container">

                                    <WidgetElement 
                                        icon={widget.icon}
                                        title={widget.nome}
                                        background={widget.color}
                                        maxDimension
                                        on:click={() => {
                                            dispatch("addWidget", widget.widget_id);
                                            closeMenu();
                                        }}
                                    />
                                    
                                </div>

                            {/if}
                            
                        {/each}

                        <!-- <div class="widget-container">

                            <WidgetElement 
                                icon={"mdiBeta"}
                                title={"Widget Risk ß"}
                                background={"#ABCDEF"}
                                maxDimension
                                on:click={() => {
                                    dispatch("addWidget", "widget_geomap_risk");
                                    closeMenu();
                                }}
                            />
                            
                        </div> -->

                    {/await}                    
                    
                </div>

            </div>

        {/if}

    </main>

{/if}

<style>

    main {
        position: fixed;
        top: 0;
        right: 0;
        width: 100vw;
        height: 100vh;
        z-index: 10;    
        transition: 0.3s background ease;
    }

    main[isContentVisible = true] {
        background: rgba(0, 0, 0, 0.3);
    }

    main > .side-menu {
        position: fixed;
        top: 0;
        right: 0;
        width: 350px;
        height: 100vh;
        overflow-y: auto;
        padding-bottom: 64px;
    }

    main > .side-menu > .header {
        position: sticky;
        top: 0;
        width: 100%;
        height: auto;
        background-color: #fff;
        z-index: 1;
    }

    main > .side-menu > .header > .topics {
        width: 100%;
        height: auto;
        padding: 6px;
    }

    main > .side-menu > .widget-list {
        width: 100%;
        height: auto;
        padding: 3px;
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        grid-auto-rows: 200px;
        column-gap: 6px;
        row-gap: 6px;
    }

    main > .side-menu > .widget-list > .widget-container {
        display: grid;
        place-items: center;
    }

</style>