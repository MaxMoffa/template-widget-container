<script>
  import { WIDGET_DEFAULT_DIMENSION, WIDGET_MAX_DIMENSION, WIDGET_MIN_DIMENSION, BACKGROUND, WIDGET_NAME, WIDGET_ID, CONFIGURATION, DEFAULT_CONFIGURATION } from "./widget/Content/Constants";
  import Wrapper from "./components/Wrapper.svelte";
  import WidgetOptions from './components/widgetOptions.svelte';
  import Grid from "svelte-grid";
  import gridHelp from "svelte-grid/build/helper/index.mjs";
  import { MaterialApp, Button, Icon } from "svelte-materialify/src";
  import { onMount } from 'svelte';
  import { mdiClose, mdiDelete, mdiPencil } from "@mdi/js";

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
      localStorage.setItem("widget-state-save", JSON.stringify(DEFAULT_CONFIGURATION));
    if(!localStorage.getItem("widget-position-save"))
      localStorage.setItem("widget-position-save", JSON.stringify({
        x: 0,
        y: 0,
        w: WIDGET_DEFAULT_DIMENSION.w,
        h: WIDGET_DEFAULT_DIMENSION.h,
        max: WIDGET_MAX_DIMENSION,
        min: WIDGET_MIN_DIMENSION,
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
      widgetId: WIDGET_ID,
      background: BACKGROUND,
      name: WIDGET_NAME,
      state: JSON.parse(localStorage.getItem("widget-state-save")),
      widget: (await import("./widget/Content/Widget.svelte")).default
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
        max: WIDGET_MAX_DIMENSION,
        min: WIDGET_MIN_DIMENSION,
    }));
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

            <div class=demo-widget style={`background: ${dataItem.background} !important`}>
              {#if isResizable}

                <div style="width: 100%; height: 100%; display: grid; place-items: center">
                  {WIDGET_NAME}
                </div>
              
              {:else}

                <Wrapper 
                  widget={dataItem.widget}
                  apikey={APIKEY}
                  state={dataItem.state}
                  on:changeOptions={(e) => {
                    isOptionsVisible = e.detail.widget;
                    optionsState = e.detail.state;
                    optionsDataItem = dataItem;
                  }}  
                  on:saveState={(e) => {                    
                      dataItem.state = e.detail;
                      localStorage.setItem("widget-state-save", JSON.stringify(e.detail));
                  }}
                />  

              {/if}
            </div>
          
          </Grid>

        {/if}

        {#if isOptionsVisible !== null}

          <WidgetOptions 
              name={WIDGET_NAME}
              widget={isOptionsVisible} 
              apikey={APIKEY} 
              state={optionsState} 
              configuration={CONFIGURATION}
              background={BACKGROUND}
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
  

  <Button on:click={reset} fab style="position: absolute; bottom: 12px; right: 12px">
    <Icon path={mdiDelete} />
  </Button>

  {#if isResizable}

    <Button on:click={changeMode} fab class="red" style="position: absolute; top: 12px; right: 12px">
      <Icon path={mdiClose} />
    </Button>

  {:else}
  
    <Button on:click={changeMode} fab class="green" style="position: absolute; top: 12px; right: 12px">
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

  .demo-widget {
    height: 100%;
    width: 100%;
    border-radius: 16px !important;
    background-color: #fff;
    padding: 8px;
    overflow: auto;
  }

  .demo-container {
    max-width: 3200px;
    width: 100%;
    margin: 0 auto;
  }
</style>