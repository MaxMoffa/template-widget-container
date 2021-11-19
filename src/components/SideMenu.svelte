<script>
    import { AppBar, Button, Icon, Chip, SlideGroup, SlideItem } from 'svelte-materialify';
    import { mdiClose } from '@mdi/js';
    import WidgetElement from '../components/widgetElement.svelte';
    import * as WidgetIndex from "../widgets/index";
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let isVisible = false;
    export let isContentVisible = false;
    let topics = ["Tutti", "Analitici", "Georeferenziati", "Smart", "Admin"]
    let headerClass = "elevation-0";

    $: {
        if(isVisible)
            showMenu();
    }

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

</script>

{#if isVisible}

    <main class="side-menu-container" {isContentVisible} on:click={closeMenuBackground}>

        <div class="side-menu elevation-3" on:scroll={updateShadow} {isContentVisible}>

            <div class={`header ${headerClass}`}>

                <AppBar class="elevation-0" style="background-color: transparent">
                    <span slot="title">I miei widget</span>
                    <div style="flex-grow:1" />
                    <Button icon class="black-text" on:click={closeMenu}>
                        <Icon path={mdiClose} />
                    </Button>
                </AppBar>
        
                <div class="topics">

                    <SlideGroup mandatory value={[0]}>
                    
                        {#each topics as topic}
                        
                            <SlideItem let:active>
                                <Chip outlined={!active} class="ma-2" link>{topic}</Chip>
                            </SlideItem>

                        {/each}

                    </SlideGroup>
        
                </div>

            </div>

            <div class="widget-list">

                                    
                {#each WidgetIndex.widgetsList as widget}

                    <div class="widget-container">

                        <WidgetElement 
                            title={widget.name}
                            background={"#abcdef"}
                            maxDimension
                            on:click={() => {
                                dispatch("addWidget", widget.id);
                                closeMenu();
                            }}
                        />
                        
                    </div>
                    
                {/each}

            </div>

        </div>

    </main>

{/if}

<style>

    main {
        position: absolute;
        top: 0;
        right: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0);
        z-index: 10;    
        transition: 0.3s background ease;
    }

    main[isContentVisible = true] {
        background: rgba(0, 0, 0, 0.3);
    }

    main > .side-menu {
        position: fixed;
        top: 0;
        right: -350px;
        width: 350px;
        height: 100vh;
        background-color: #fff;    
        overflow-y: auto;
        padding-bottom: 64px;
        transition: 0.5s right ease;
    }

    main > .side-menu[isContentVisible = true] {
        right: 0;
    }

    main > .side-menu > .header {
        position: sticky;
        top: 0;
        width: 100%;
        height: auto;
        background-color: #fff;
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