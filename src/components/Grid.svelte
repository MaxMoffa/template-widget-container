<script>

    import { Icon, Chip, Button, SlideGroup, SlideItem } from 'svelte-materialify/src';
    import { mdiShare, mdiReload, mdiPencil, mdiPlus, mdiCog, mdiFileOutline, mdiContentSave, mdiDelete } from '@mdi/js';
    import * as WidgetIndex from "../widgets/index";
    import { onMount } from "svelte";
    import Grid from "svelte-grid";
    import Card from './WidgetCard.svelte';
    import Wrapper from './Wrapper.svelte';
    import WidgetOptions from './widgetOptions.svelte';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let token = null;
    export let apikey = null;
    export let items = [];
    export let rowHeight = 70;
    export let cols = 10;
    export let fastStart = true;
    export let modifyMode = false;
    export let width = "80%";
    export let isContentVisible = false;
    export let parent = null;
    export let itemsId = null;

    let oldModifyMode = modifyMode;
    let oldItemsId = itemsId;
    let oldItemsLength = items.length;

    $: {
        if(itemsId !== null && itemsId !== oldItemsId){
            oldItemsId = itemsId;
            initGrid();
        }else if(modifyMode !== oldModifyMode){
            oldModifyMode = modifyMode;
            updateGridState();
        }else if(oldItemsLength < items.length){
            oldItemsLength = items.length;
            prepareWidget(items[0])
            .then(result => {
                _items = [...[result], ..._items];
            });
        }
    }

    // Grid variables
    const id = () => "_" + Math.random().toString(36).substr(2, 9);
    const COLS = [
        [ 3200, cols ],
    ];
    let container;
    let _items = [];

    // Content variables
    let optionsDataItem = null;

    // Widget params default
    let params;
    
    onMount(() => {

        updateGridRowHeight();

        // Load widget params
        params = {
            showOptions: false,
            parent: getContainer(),
        };
        if(token !== null)
            params.token = token;
        else
            params.apikey = apikey;

        if(items.length > 0){

            // Load grid
            initGrid();

            window.onresize = () => {
                updateGridRowHeight();
                reloadGrid();
            }

        }

    });

    // Init the grid
    function initGrid() {
        console.log(itemsId);
        prepareGrid(items)
        .then(result => {
            _items = result;
        })
        .catch(e => {
            console.log(e);
            _items = [];
        })
        .finally(() => reloadGrid());
    }

    // Update the grid state
    function updateGridState() {
        _items = _items.map(w => {
            w[cols].fixed = !modifyMode;
            w[cols].resizable = modifyMode;
            w[cols].draggable = modifyMode;
            return w;
        })
    }

    // Dispatch the update event
    function updateGrid() {

        let cloneItems = JSON.parse(JSON.stringify(_items));
        let items = cloneItems.map(item => {
            delete item.widget;
            return item;
        })

        dispatch("update", items);
    }

    // Reload grid
    function reloadGrid() {
        isContentVisible = false;
        setTimeout(() => {
            // Set new session id
            window._gridSessionID = id();
            isContentVisible = true;
        }, 0);
    }

    // Check if widget is cutomizable
    function isCustomizable(state) {
        return state && typeof(state) === "object";
    }

    // Load widget inside the grid
    async function prepareGrid(rawGrid) {

        // Transform string into json
        let items = typeof(rawGrid) === "object" ? rawGrid : JSON.parse(rawGrid);

        let result = [];

        // Add the widget class
        for(let item of items){

            result.push(await prepareWidget(item));

        }

        return result;
    }

    // Remove widget from grid
    function removeWidget(item) {
        _items = _items.filter((value) => value.id !== item.id);
        updateGrid();
    }

    // Update rows height
    function updateGridRowHeight() {
        let newValue = getContainer().clientHeight/8;
        rowHeight = newValue > 70 ? 70 : newValue;
    }

    function getContainer() {
        return parent ? parent : container;
    }

    async function prepareWidget(item) {
        let widgetInfo = await WidgetIndex.getWidgetInfo(item.propreties.WIDGET_ID);
        item = {
            ...item,
            [cols]: {
                ...item[cols],
                fixed: !modifyMode,
                resizable: modifyMode,
                draggable: modifyMode,
                max: widgetInfo.propreties.WIDGET_MAX_DIMENSION,
                min: widgetInfo.propreties.WIDGET_MIN_DIMENSION,
            },
            state: item.hasOwnProperty("state") ? item.state : widgetInfo.propreties.DEFAULT_CONFIGURATION,
            widget: widgetInfo.widget,
            propreties: widgetInfo.propreties
        };

        if(item.hasOwnProperty("state") && items.state && !item.state.hasOwnProperty("_timer_refresh"))
            item.state._timer_refresh = -1;
        return item;
    }

</script>

<!-- Main -->
<main class:container={parent === null} style={parent === null ? "height: 100% !important" : ""} bind:this={container}>

    <!-- header -->

    {#if parent === null}
        <div style="height: 32px;"></div>
    {/if}

    <!-- Show/Hide content (for reload) -->
    {#if isContentVisible}
    
        <!-- Check if there are items -->
        {#if items.length === 0}

            <!-- No items -->
            <div class="no-data-grid">
                <div>
                    <span>
                        Non ci sono widget
                    </span>
                </div>
            </div>

        {:else}

            <div class="grid-container" style="width: {width}">

                <!-- Grid -->
                <Grid 
                    on:change={updateGrid} 
                    bind:items={_items} 
                    gap={[3, 3]} 
                    rowHeight={rowHeight} 
                    let:dataItem 
                    cols={COLS} 
                    scroller={getContainer()} 
                    {fastStart}
                >

                    <!-- Card -->
                    <Card background={dataItem.propreties.BACKGROUND}>

                        <!-- Check grid mode -->
                        {#if modifyMode}

                                <!-- Modify mode content -->
                                <div class="modify">

                                    <div>

                                        <span style="text-align: center;" class="mb-6">
                                            {dataItem.propreties.WIDGET_NAME}
                                        </span>

                                        {#if isCustomizable(dataItem.state)}

                                            <Button outlined class="yellow yellow-text darken-3 text-darken-3 mb-1" on:click={() => optionsDataItem = dataItem}>
                                                <Icon path={mdiCog} class="mr-3" />
                                                Modifica
                                            </Button>
                                            
                                        {/if}

                                        <Button outlined class="red red-text" on:click={() => removeWidget(dataItem)}>
                                            <Icon path={mdiDelete} class="mr-3" />
                                            Rimuovi
                                        </Button>
                                    </div>

                                </div>
                        
                        {:else}

                            <!-- Widget wrapper -->
                            <Wrapper 
                                sessionID={`${window._gridSessionID}`}
                                widget={dataItem.widget} 
                                state={dataItem.hasOwnProperty("state") ? dataItem.state : null}
                                parent={getContainer()}
                                on:saveState={(e) => {
                                    dataItem.state = e.detail;                                    
                                    updateGrid();
                                }}
                                on:changeOptions={(e) => {
                                    optionsDataItem = dataItem;
                                }}
                                {...params}
                            />

                        {/if}

                    </Card>

                </Grid>

            </div>

        {/if}

    {/if}

    {#if optionsDataItem !== null}

        <WidgetOptions 
            widget={optionsDataItem.widget} 
            {apikey}
            {token} 
            state={optionsDataItem.state} 
            name={optionsDataItem.propreties.WIDGET_NAME}
            background={optionsDataItem.propreties.BACKGROUND}
            configuration={optionsDataItem.propreties.CONFIGURATION}
            on:saveState={(e) => {
                optionsDataItem.state = e.detail;
                updateGrid();
                optionsDataItem = null;
            }}
            on:close={() => {
                optionsDataItem = null;
            }}
        />

    {/if}

</main>

<style>

    main {
        width: 100%;
        height: auto;
        overflow-y: auto;
    }

    /* No items */

    .no-data-grid {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
    }

    .no-data-grid > div {
        width: 100px;
        height: 100px;
        background-color: blue;
    }

    /* Modify mode content */

    .modify {
        width: 100%;
        height: 100%;
        display: grid;
        place-items: center;
    }

    .modify > * {
        flex: 1;
        display: grid;
        justify-content: center;
        align-items: center;
    }

    :global(.s-item-group) {
        min-width: 0;
    }

    /* Grid */

    .grid-container {
        width: 100%;
        margin: 0 auto;
        padding-bottom: 128px;
        background-color: #f1f1f1;
    }

</style>