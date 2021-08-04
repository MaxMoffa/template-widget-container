<script>
  import { WIDGET_DEFAULT_DIMENSION, WIDGET_MAX_DIMENSION, WIDGET_MIN_DIMENSION, isResizable } from "./Content/Constants";
  import Wrapper from "./Wrapper.svelte";
  import Grid from "svelte-grid";
  import gridHelp from "svelte-grid/build/helper/index.mjs";

  // Get APIKEY
  const url = new URL(window.location.href);
  const APIKEY = url.searchParams.get("apikey");

  const id = () => "_" + Math.random().toString(36).substr(2, 9);

  let items = [
    {
      10: gridHelp.item({ 
        x: 0,
        y: 0,
        w: WIDGET_DEFAULT_DIMENSION.w,
        h: WIDGET_DEFAULT_DIMENSION.h,
        max: WIDGET_MAX_DIMENSION,
        min: WIDGET_MIN_DIMENSION,
        fixed: !isResizable
      }),
      id: id(),
    }
  ];

  const cols = [
    [ 3200, 10 ],
  ];

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

</script>

<div class=demo-container>

  {#await checkToken()}

  {:then result} 
  
    {#if result.response_code === 200}
        
      <Grid bind:items={items} rowHeight={70} let:item let:dataItem {cols}>
        <div class=demo-widget>
            <Wrapper apikey={APIKEY}/>  
        </div>
      </Grid>

    {:else}

    Errore nella checkToken

    {/if}

  {:catch e}

    Errore nella checkToken

  {/await}

</div>

<style>
  :global(body){
      background-color: #f1f1f1;
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