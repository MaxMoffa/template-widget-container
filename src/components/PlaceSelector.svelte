<script>
    import { onMount } from "svelte";
    import Map from "../utils/map_utils";
    import { Chip, Icon } from 'svelte-materialify/src';
    import { mdiClose } from '@mdi/js';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let params = new FormData();
    export let placeSelected = null;

    let map;
    let mapRef = null;

    const updateMap = () => {
        map.updateGeojson(config);
    };

    const click = async (feature, layer, e) => {
        map.setCenter(e.latlng);
        placeSelected = {
            name: feature.properties.name,
            path: {
                ...map.getLastPlace(),
            },
            zoom: map.getZoom(),
            center: map.getCenter(),
            geolevel: map.getGeoLevel(),
            bounds: Map.getBoundingBox(feature)
        };

        switch (map.getGeoLevel()) {
            case 0:
                placeSelected.path.nazione = feature.properties.name;
                break;
            case 1:
                placeSelected.path.regione = feature.properties.name;
                break;
            case 2:
                placeSelected.path.provincia = feature.properties.name;
                break;
            case 3:
                placeSelected.path.comune = feature.properties.name;
                break;
            case 4:
                placeSelected.path.squareID = feature.properties.name;
                break;
        }

        map.updateGeojsonConfiguration(config);
        setTimeout(() => {
            dispatch("change");
        }, 0);
    };

    const getColors = (info, feature, data, style) => {
        if(!placeSelected)
            return style;
        if(feature.properties.name === placeSelected.name){
            style.color = "#ffeb3b";
            style.fillColor = "#ffeb3b";
        }
        return style;
    };

    let config = {
        moveend: updateMap,
        zoomend: updateMap,
        click: click,
        getColors: getColors
    };

    onMount(() => {
            
        if(placeSelected !== null && placeSelected.hasOwnProperty("center") && placeSelected.hasOwnProperty("zoom"))
            map = new Map(params, mapRef, {center: placeSelected.center, zoom: placeSelected.zoom});
        else
            map = new Map(params, mapRef);
        map.applyTiles();
        map.loadGeojson(config);

    });

    function removeSelection() {
        placeSelected = null;
        map.updateGeojsonConfiguration(config);
        setTimeout(() => {
            dispatch("change");
        }, 0);
    }

</script>

<main>
    
    <div class="map-place-selector" bind:this={mapRef} />

    {#if placeSelected}
    
        <div class="info">
            <div>
                <Chip close>
                    <div slot="close-icon" on:click={removeSelection}>
                        <Icon path={mdiClose} />
                    </div>
                    <span>{placeSelected.name}</span>
                </Chip>
            </div>
        </div>

    {/if}

</main>

<style>

    main {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
    }

    main > .map-place-selector {
        position: absolute !important;
        top: 0;
        left: 0;
        width: 100% !important;
        height: 100% !important;
        z-index: 0 !important;
    }

    main > .info {
        position: absolute;
        width: 100%;
        bottom: 6px;
        display: grid;
        place-items: center;
        z-index: 1002;
        pointer-events: none;
    }

    main > .info > div {
        pointer-events: auto;
    }

</style>