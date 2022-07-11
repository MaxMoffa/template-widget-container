<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==" crossorigin="" />
</svelte:head>

<script>
  import * as properties from "./widgets/widget/Constants";
  import Wrapper from "./components/Wrapper/Wrapper.svelte";
  import WidgetOptions from './components/widgetOptions.svelte';
  import Grid from "svelte-grid";
  import gridHelp from "svelte-grid/build/helper/index.mjs";
  import { MaterialApp, Button, Icon } from "svelte-materialify/src";
  import { onMount } from 'svelte';
  import { mdiContentSave, mdiDelete, mdiPencil, mdiCog } from "@mdi/js";
  import Card from './components/WidgetCard.svelte';
  import dictionary from "./widgets/widget/lang/it.json";

  // Get APIKEY
  const url = new URL(window.location.href);
  const APIKEY = url.searchParams.get("apikey");

  // Options visibility
  let isReloading = false;
  let isOptionsVisible = null;
  let optionsState = null;
  let optionsDataItem = null;

  let isResizable = false;

  const id = () => "_" + Math.random().toString(36).substr(2, 9);
  const COLS = 10;

  let items = [];

  const cols = [
    [ 3200, COLS ],
  ];

  onMount(() => {
    if(!localStorage.getItem("widget-state-save"))
      localStorage.setItem("widget-state-save", JSON.stringify(properties.DEFAULT_CONFIGURATION));
    if(!localStorage.getItem("widget-position-save"))
      localStorage.setItem("widget-position-save", JSON.stringify({
        x: 0,
        y: 0,
        w: properties.WIDGET_DEFAULT_DIMENSION.w,
        h: properties.WIDGET_DEFAULT_DIMENSION.h,
        max: properties.WIDGET_MAX_DIMENSION,
        min: properties.WIDGET_MIN_DIMENSION,
      }));
    addWidget()
    .then(() => console.log("widget loaded"));

  });

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

  async function checkToken() {
		let params = new FormData();
    params.append("apikey", APIKEY)
		let response = await fetch("https://sqd.sensesquare.eu:5002/check_token", {
			body: params,
			method: "POST"
		});
		let result = await response.json();
		return result;
	}

  function reload() {
    isReloading = true;
    setTimeout(() => {
      isReloading = false;
    }, 100);
  }

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
    reload();
  }

  function reset() {
    localStorage.clear();
    window.location.reload();
  }

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

  <div class=demo-container>

    {#await checkToken()}

      ...

    {:then result} 
    
      {#if result.response_code === 200}
          
        {#if !isReloading}

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

                <Wrapper 
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
                  widgetId={null}
                  {dictionary}
                />  

              {/if}
            
            </Card>
          
          </Grid>

        {/if}

        {#if isOptionsVisible !== null}

          <WidgetOptions 
              name={properties.WIDGET_NAME}
              widget={isOptionsVisible} 
              apikey={APIKEY} 
              state={optionsState} 
              configuration={properties.CONFIGURATION}
              background={properties.BACKGROUND}
              {properties}
              on:saveState={(e) => {
                  optionsDataItem.state = e.detail;
                  isOptionsVisible = null;
                  optionsDataItem = null;
                  optionsState = null;
                  localStorage.setItem("widget-state-save", JSON.stringify(e.detail));
                  reload();
              }}
              on:close={() => {
                  isOptionsVisible = null;
                  optionsDataItem = null;
                  optionsState = null;
              }}
          />

        {/if}

      {:else}

      Errore nella checkToken

      {/if}

    {:catch e}

      Errore nella checkToken

    {/await}

  </div>
  

  <Button on:click={reset} fab style="position: fixed; bottom: 12px; right: 12px">
    <Icon path={mdiDelete} />
  </Button>

  {#if isResizable}

    <Button on:click={changeMode} fab class="blue" style="position: fixed; top: 12px; right: 12px">
      <Icon path={mdiContentSave} />
    </Button>

  {:else}
  
    <Button on:click={changeMode} fab class="green" style="position: fixed; top: 12px; right: 12px">
      <Icon path={mdiPencil} />
    </Button>

  {/if}

</MaterialApp>

<style>
  
  :global(body){
    background-color: #f1f1f1;
  }

  :global(.s-app){
    background-color: rgba(0,0,0,0) !important;
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

  .demo-container {
    max-width: 3200px;
    width: 100%;
    margin: 0 auto;
  }
</style>