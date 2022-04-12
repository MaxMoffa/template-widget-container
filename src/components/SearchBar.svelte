<svelte:window on:keyup={handleKeydown}/>

<script>
    import { Dialog, TextField, Icon, List, ListGroup, ListItem } from 'svelte-materialify/src';
    import { mdiMagnify } from '@mdi/js';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let active = true;
    export let placeholder = "Cerca";
    export let getOptions = async () => [];
    export let showOptions = false;
    export let showList = false;
    export let dense = false;

    let textField;
    let value = "";
    let timeout = null;

    function handleKeydown(e) {
        if(e.key === "Escape")
            exit();
    }

    function focusInput() {
        if(textField)
            textField.focus();
    }

    function updateOptions() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            showOptions = false;
            setTimeout(() => {
                showOptions = true;
            }, 100);
        }, 1000);
    }
    
    function send(s) {
        value = "";
        active = false;
        dispatch("select", s);
    }

    function exit() {
        value = "";
        active = false;
    }

</script>

<main>

    <Dialog class="pa-4 text-center" bind:active on:introend={focusInput} on:outroend={exit}>

        <TextField bind:inputElement={textField} bind:value solo {placeholder} on:keypress={updateOptions} on:keypre>
            <div slot="append">
              <Icon path={mdiMagnify} />
            </div>
        </TextField>

        <List {dense} class="elevation-0" style="width: 100%; height: 300px; overflow-y: auto">
            
            {#if showOptions && (showList || value !== "")}
            
                {#await getOptions(value)}
                    <ListItem>
                        ...
                    </ListItem>
                {:then result} 
                
                    {#if result.length === 0}
                        <ListItem>
                            Nessun risultato
                        </ListItem>
                    {/if}

                    {#each result as option}
                    
                        <ListItem on:click={() => send(option)}>
                            {option.key}
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
    </Dialog>

</main>

<style>

    main {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        pointer-events: none;
    }

</style>