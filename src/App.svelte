<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==" crossorigin="" />
</svelte:head>

<script>
  import * as properties from "./widgets/widget/Constants";
  import Wrapper from "./components/Wrapper/Wrapper.svelte";
  import WidgetOptions from './components/widgetOptions.svelte';
  import Configurator from './components/Configurator/Configurator.svelte';
  import Grid from "svelte-grid";
  import gridHelp from "svelte-grid/build/helper/index.mjs";
  import { MaterialApp, Button, Icon, ProgressCircular, AppBar } from "svelte-materialify/src";
  import { onMount } from 'svelte';
  import { mdiContentSave, mdiDelete, mdiPencil, mdiCog, mdiAlertCircle } from "@mdi/js";
  import Card from './components/WidgetCard.svelte';
  import dictionary from "./widgets/widget/lang/it.json";
  import LangUtils from "./utils/lang_utils";

  // Get APIKEY
  const url = new URL(window.location.href);
  const APIKEY = url.searchParams.get("apikey");

  // Options visibility
  let isReloading = false;
  let isOptionsVisible = null;
  let optionsState = null;
  let optionsDataItem = null;

  // Control the widget resize mode
  let isResizable = false;

  // Grid constants
  const id = () => "_" + Math.random().toString(36).substr(2, 9);
  const COLS = 10;
  const cols = [
    [ 3200, COLS ],
  ];

  // Grid list (only one widget)
  let items = [];

  // On page mount
  onMount(() => {

    // Check if there is a widget state saved
    if(!localStorage.getItem("widget-state-save"))
      localStorage.setItem("widget-state-save", JSON.stringify(properties.DEFAULT_CONFIGURATION));

    // Check if there is a widget position info saved
    if(!localStorage.getItem("widget-position-save"))
      localStorage.setItem("widget-position-save", JSON.stringify({
        x: 2,
        y: 2,
        w: properties.WIDGET_DEFAULT_DIMENSION.w,
        h: properties.WIDGET_DEFAULT_DIMENSION.h,
        max: properties.WIDGET_MAX_DIMENSION,
        min: properties.WIDGET_MIN_DIMENSION,
      }));

  });

  // Load the widget on the grid
  async function addWidget() {
    items.push({
      [COLS]: gridHelp.item({ 
        ...JSON.parse(localStorage.getItem("widget-position-save")),
        fixed: !isResizable
      }),
      id: id(),
      widgetId: properties.WIDGET_ID,
      BACKGROUND: properties.BACKGROUND,
      name: properties.WIDGET_NAME,
      state: JSON.parse(localStorage.getItem("widget-state-save")),
      widget: (await import("./widgets/widget/Widget.svelte")).default
    });
  }

  // Verify the apikey used to test the widget
  async function checkToken() {
		let params = new FormData();
    params.append("apikey", APIKEY)
		let response = await fetch("https://sqd.sensesquare.eu:5002/check_token", {
			body: params,
			method: "POST"
		});
		let result = await response.json();

    if(result.response_code !== 200)
      throw Error(result.message);

    // Add widget to the grid
    await addWidget();

		return result.response_code === 200;
	}

  // Toogle for modify mode
  function changeMode() {
    isResizable = !isResizable;
    if(!isResizable)
      updatePosition();
    items = items.map((item) => {
      item = {
          ...item,
          [COLS]: {
              ...item[COLS],
              fixed: !isResizable,
              draggable: isResizable,
              resizable: isResizable
          }
      }
      return item;
    });
  }

  // Reset all the saves
  function reset() {
    localStorage.clear();
    window.location.reload();
  }

  // Update the widget position saves
  function updatePosition() {
    console.log("resize");
    localStorage.setItem("widget-position-save", JSON.stringify({
        x: items[0][COLS].x,
        y: items[0][COLS].y,
        w: items[0][COLS].w,
        h: items[0][COLS].h,
        max: properties.WIDGET_MAX_DIMENSION,
        min: properties.WIDGET_MIN_DIMENSION,
    }));
  }

  // Check if widget is cutomizable
  function isCustomizable(state) {
    return state && typeof(state) === "object";
  }

</script>

<MaterialApp>
  <main>

      <!-- Check apikey validity -->
    {#await checkToken()}

      <!-- Loading container -->
      <div class="generic-container">
        <ProgressCircular size={96} color="primary-color" indeterminate />
      </div>
      
    {:then result} 

      <!-- Result -->
      {#if result}

        <!-- Appbar -->
        <div class="appbar">
          <AppBar collapsed class="white">

            <!-- Delete widget state and position -->
            <Button class="white red-text" fab depressed on:click={reset}>
              <Icon path={mdiDelete} />
            </Button>

            <!-- Toogle modify mode -->
            <Button class="white" fab depressed on:click={changeMode}>
              <Icon path={isResizable ? mdiContentSave : mdiPencil} />
            </Button>

          </AppBar>
        </div>

        <!-- Grid -->
        <Grid bind:items={items} rowHeight={70} let:item let:dataItem {cols}>
          <Card>

            {#if isResizable}

              <!-- Modify mode content -->
              <div class="modify white">
                <div>
                    <span style="text-align: center;" class="mb-6">
                        {properties.WIDGET_NAME}
                    </span>
                    {#if isCustomizable(dataItem.state)}
                        <Button outlined class="yellow-text darken-3 text-darken-3 mb-1" on:click={() => {
                          isOptionsVisible = dataItem.widget;
                          optionsState = dataItem.state;
                          optionsDataItem = dataItem;
                        }}>
                            <Icon path={mdiCog} class="mr-3" />
                            Modifica
                        </Button>
                    {/if}
                </div>
              </div>
            
            {:else}

              {#key optionsDataItem}
                <Wrapper 
                  widgetId={"widget"}
                  {dictionary}
                  {properties}
                  widget={dataItem.widget}
                  apikey={APIKEY}
                  state={dataItem.state}
                  showOptions={false}
                  on:changeOptions={(e) => {
                    isOptionsVisible = e.detail.widget;
                    optionsState = e.detail.state;
                    optionsDataItem = dataItem;
                  }}  
                  on:saveState={(e) => {                    
                      dataItem.state = e.detail;
                      localStorage.setItem("widget-state-save", JSON.stringify(e.detail));
                  }}
                  lang="it"
                />  
              {/key}

            {/if}
          
          </Card>
        </Grid>

        <Configurator 
          active={isOptionsVisible !== null}
          widgetId={"widget"}
          widgetName={"Prototipo"}
          widget={isOptionsVisible} 
          apikey={APIKEY} 
          state={optionsState} 
          dict={new LangUtils("it", dictionary)}
          {properties}
          on:saveState={(e) => {
            optionsDataItem.state = e.detail;
            isOptionsVisible = null;
            optionsDataItem = null;
            optionsState = null;
            localStorage.setItem("widget-state-save", JSON.stringify(e.detail));
          }}
        />

      {/if}

    {:catch e}

      <!-- Error container -->
      <div class="generic-container">
        <div>
          <div class="d-flex align-center justify-center">
            <Icon size={96} path={mdiAlertCircle} />
          </div>
          <div class="pt-6">
            {e.message}
          </div>
        </div>
      </div>    
      
    {/await}

  </main>
</MaterialApp>

<style>
  
  :global(body){
    background-color: #f1f1f1;
  }

  :global(.s-app){
    background-color: rgba(0,0,0,0) !important;
  }


  /* Main container */
  main {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  /* Generic container */
  .generic-container {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
  }

  /* Modify mode content */
  .modify {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
  }

  /* Appbar */
  .appbar {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1005;
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

</style>