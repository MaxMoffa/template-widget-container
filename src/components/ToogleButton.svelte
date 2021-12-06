<script>
    import { Ripple } from 'svelte-materialify/src'
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let options = [
        {
            name: "Pippo",
            value: "pippo"
        },
        {
            name: "Pluto",
            value: "pluto"
        }
    ];
    export let selected = options[0].key;
    export let style = "";
    export let background = null;

    function click(value) {
        selected = value;
        dispatch("change", value);
    }

</script>

<main style={background !== null ? `border: 1px solid ${background} !important; ${style}` : `${style}`} use:Ripple>

    {#each options as option}
    
        <div 
            style={selected === option.value ? `background: ${background} !important` : ""} 
            class={`option ${selected === option.value ? "selected" : `${background}-text`}`} on:click={() => click(option.value)}
        >
            {option.name}
        </div>

    {/each}

</main>

<style>

    main {
        width: auto;
        height: auto;
        border-radius: 32px;
        border: 1px solid #000;
        padding: 0;
        display: flex;
        flex-direction: row;
        background-color: #fff;
    }

    main > .option {
        flex: 1;
        padding: 5px 32px;
        border-radius: 32px;
        cursor: pointer;
        display: grid;
        place-items: center;
    }

    main > .selected {
        background-color: #000;
        color: #fff;
    }

    @media screen and (max-width: 1800px) {

        main {
            padding: 1px;
        }

        main > .option {
            padding: 2px 8px;
        }
                
    }

    @media screen and (max-width: 1280px) {

        main {
            padding: 1px;
        }

        main > .option {
            padding: 2px 4px;
        }
            
    }

</style>