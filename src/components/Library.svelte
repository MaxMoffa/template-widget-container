<script>

    import { Overlay, AppBar, Button, List, ListItem, ProgressCircular, Icon, ClickOutside } from 'svelte-materialify/src';
    import { mdiClose, mdiAlert } from '@mdi/js';
    import NetworkUtils from '../utils/network_utils';
    import { onDestroy, onMount, createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let token = null;
    export let active = false;
    export let isDownloading = false;
    
    let flat = true;
    let _list = null;
    let _interval;

    $: active, startupActivation();
    $: isDownloading, mountInterval();

    onMount(() => {

        mountInterval();

    });

    onDestroy(() => {
        clearInterval(_interval);
    });

    function mountInterval() {
        clearInterval(_interval);
        if(isDownloading){
            _interval = setInterval(startSyncMode, 45000);
        }
    }

    function startupActivation() {
        
        if(!active)
            return;

        getLibraryList()
        .then(result => {

            if(result.response_code === 200)
                _list = result.result;
            else
                _list = result.message;

        })
        .catch(e => {
            _list = e.message;
        })

    }

    async function startSyncMode() {
        
        let list = await getLibraryList();

        if(list.response_code === 200)
            _list = list.result;
        else
            _list = list.message;

    }

    // Get library list
    async function getLibraryList() {

        let params = new FormData();
        params.append("token", token);
        let result = await NetworkUtils.getServerLettura("pending_downloads", { method: "POST", body: params });

        if(result.response_code === 200){
            for(const key of Object.keys(result.result)) {
                if(result.result[key].status === "pending"){
                    isDownloading = true;
                    return result;
                }
            }

            if(isDownloading)
                dispatch("downloadEnded");

            isDownloading = false;
        }

        return result;

    }

    // Download file from library
    function downloadFile(file_name, obj_id) {

        let params = new FormData();
        params.append("token", token);
        params.append("obj_id", obj_id);

        NetworkUtils.getServerLettura("download_posposto", {
            method: "POST",
            body: params
        }, true)
        .then(response => response.blob())
        .then(blob => {
            let a = document.createElement('a');
            a.href = window.URL.createObjectURL(blob);
            a.download = file_name;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
        });

    }

    function getFrequencyString(f) {
        switch(f) {
            case "daily":
                return "Medie giornaliere"
            case "hourly":
                return "Medie orarie"
            case "instant":
                return "Medie al minuto"
            case "raw":
                return "Dati raw"
        }
    }

    function scroll(e) {
        if(e.target.scrollTop === 0)
            flat = true;
        else
            flat = false;
    }

</script>

<Overlay style="z-index: 2000" bind:active={active} class="rounded-lg">

    <div class="download-dialog rounded-lg white" use:ClickOutside on:clickOutside={() => active = false} on:scroll={scroll}>

        <AppBar style="position: sticky; top: 0" {flat} class="white">
            <span slot="icon">
                <Button icon on:click={() => active = false}>
                    <Icon path={mdiClose} />
                </Button>
            </span>
            <span slot="title">
                Downloads
            </span>
        </AppBar>

        <List>

            {#if _list === null}

                <div class="d-flex align-center justify-center pt-6 pb-6">
                    <ProgressCircular indeterminate color="primary-color" />
                </div>
                
            {:else if _list && Array.isArray(_list)} 

                {#each _list as d}
                
                    <ListItem>
                        {d.name}
                        <span slot="subtitle">
                            {getFrequencyString(d.frequency)} dal {new Date(d.from).toLocaleDateString()} al {new Date(d.to).toLocaleDateString()}
                        </span>
                        <span slot="append">
                            {#if d.status === "pending"}
                                <ProgressCircular color="primary-color" indeterminate />
                            {:else if d.status === "ready"}
                                <Button class="primary-color white-text" depressed rounded size="small" on:click={() => downloadFile(d.nome_file, d.obj_id)}>
                                    Scarica
                                </Button>
                            {:else}
                                <Icon path={mdiAlert} />
                            {/if}
                        </span>
                    </ListItem>

                {/each}

            {:else}

                <ListItem disabled class="text-center">
                    {_list}
                </ListItem>
                
            {/if}

        </List>

    </div>

</Overlay>

<style>

    /* Download dialog */
    
    .download-dialog {
        width: 500px;
        height: auto;
        max-height: 50vh;
        overflow-y: auto;
    }

</style>