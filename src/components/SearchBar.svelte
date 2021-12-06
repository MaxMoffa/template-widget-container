<script>
    import { Dialog, TextField, Icon, List, ListGroup, ListItem } from 'svelte-materialify/src';
    import { mdiMagnify } from '@mdi/js';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let active = true;
    export let placeholder = "Cerca";
    export let getOptions = async () => [];
    export let showOptions = false;

    let value = "";

    function updateOptions() {
        showOptions = false;
        setTimeout(() => {
            showOptions = true;
        }, 100);
    }
    
    function send(s) {
        active = false;
        dispatch("select", s);
    }

</script>

<main>

    <Dialog class="pa-4 text-center" bind:active>

        <TextField bind:value solo {placeholder} on:keypress={updateOptions}>
            <div slot="append">
              <Icon path={mdiMagnify} />
            </div>
        </TextField>

        <List class="elevation-0" style="width: 100%; height: 300px; overflow-y: auto">
            
            {#if showOptions}
            
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

</style>