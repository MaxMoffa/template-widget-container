<script>
    import { onMount } from "svelte";
    import Map from "../utils/map_utils";
    import { Chip, Icon, Button, Tooltip } from 'svelte-materialify/src';
    import { mdiClose, mdiMagnify, mdiCrosshairsGps } from '@mdi/js';
    import { createEventDispatcher } from 'svelte';
    import { teal } from 'svelte-materialify/src/utils/colors';
    import SearchBar from './SearchBar.svelte';
    import NetworkUtils from '../utils/network_utils';
    const dispatch = createEventDispatcher();

    export let params = new FormData();
    export let placeSelected = null;
    export let selectSquare = false;
    export let defaultZoom = 3;
    export let classMap = "rounded elevation-1";
    export let selectPoint = false;

    let map;
    let mapRef = null;
    let isSearchActive = false;
    let mapGeolevelClick = null;
    let disableAutoUpdate = false;
    let marker = null;

    const updateMap = (e) => {
        
        console.log(disableAutoUpdate);
        if(selectSquare && disableAutoUpdate)
            return;

        mapGeolevelClick = map.getGeoLevel();
        console.log(mapGeolevelClick);

        map.updateGeojson(config);
    };

    const clickPoint = async e => {

        // Point selected
        let point = e.latlng;

        await updatePoint(point);

    }

    const click = async (feature, layer, e) => {
        
        if(selectSquare && map.getGeoLevel() < 4){

            disableAutoUpdate = true;

            // Move map to new location
            map.getMapObject().flyToBounds(layer.getBounds());

            if(mapGeolevelClick === null)
                mapGeolevelClick = map.getGeoLevel();

            // Get center of the feature
            let center = (layer.getBounds()).getCenter();

            // Map force update to location and geolevel
            let geodecode = await NetworkUtils.geodecode(center.lat, center.lng, mapGeolevelClick, params);
            await map.updateGeojson(config, true, {path: geodecode, zoom: Map._getZoomFromGeolevel(++mapGeolevelClick)});

            setTimeout(() => {
                disableAutoUpdate = false;
            }, 1000);

            return;

        }

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
            style.color = teal.base;
            style.fillColor = teal.base;
        }
        return style;
    };

    function getGpsPosition() {
        navigator.geolocation.getCurrentPosition(pos => {
            if(selectPoint)
                updatePoint({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
            else
                map.getMapObject().flyTo({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                }, Map._getZoomFromGeolevel(4));
        });
    }

    async function updatePoint(point) {
        let geodecode = await NetworkUtils.geodecode(point.lat, point.lng, 4, params);

        if(geodecode.hasOwnProperty("error")){
            dispatch("error");
            return;
        }

        map.clearMarker();

        map.showMarker(point, {
            title: geodecode.squareID
        });

        map.getMapObject().flyTo(point, Map._getZoomFromGeolevel(4));

        placeSelected = {
            name: geodecode.squareID,
            path: {
                ...geodecode,
            },
            zoom: map.getZoom(),
            center: map.getCenter(),
            geolevel: map.getGeoLevel(),
            bounds: null
        };
    }

    let config = {};

    onMount(() => {
        
        // Load config if geojson is required
        if(!selectPoint)
            config = {
                moveend: updateMap,
                zoomend: updateMap,
                click: click,
                getColors: getColors
            };

        // Create map instance
        if(placeSelected !== null && placeSelected.hasOwnProperty("center") && placeSelected.hasOwnProperty("zoom"))
            map = new Map(params, mapRef, {center: placeSelected.center, zoom: placeSelected.zoom});
        else
            map = new Map(params, mapRef, {zoom: defaultZoom});

        // Load Tiles
        map.applyTiles();

        if(selectPoint){
            map.getMapObject().on("click", clickPoint)
        }

        // Load geojson if required
        if(!selectPoint)
            map.loadGeojson(config);

    });

    function removeSelection() {
        placeSelected = null;
        map.updateGeojsonConfiguration(config);
        map.clearMarker();
        setTimeout(() => {
            dispatch("change");
        }, 0);
    }

    // Set bound for the map
    function viewPosition(e) {
        let info = e.detail.value;
        let bounds = [];
        bounds.push([parseFloat(info[0]), info[2]]);
        bounds.push([parseFloat(info[1]), info[3]]);
        map.getMapObject().flyToBounds(bounds, {duration: 1});
    }

</script>

<main class="{classMap}">
    
    <div class="map-place-selector" bind:this={mapRef} />

    {#if placeSelected}
    
        <div class="info">
            <div>
                <Chip class="primary-color white-text" close>
                    <div slot="close-icon" on:click={removeSelection}>
                        <Icon class="white-text" path={mdiClose} />
                    </div>
                    <span>{placeSelected.name}</span>
                </Chip>
            </div>
        </div>

    {/if}

    <div class="buttons pa-2">
        <Tooltip top>
            <Button fab size={"small"} on:click={() => isSearchActive = true}>
                <Icon path={mdiMagnify} />
            </Button>
            <span slot="tip">Cerca un luogo</span>
        </Tooltip>
        <Tooltip bottom>
            <Button class="mt-2" fab size={"small"} on:click={getGpsPosition}>
                <Icon path={mdiCrosshairsGps} />
            </Button>
            <span slot="tip">Trova la mia posizione</span>
        </Tooltip>
    </div>

    <!-- Searchbar, place -->
    <SearchBar 
        bind:active={isSearchActive}
        getOptions={async (s) => {
            let result = await NetworkUtils.getNominatim("search", {
                format: "json",
                q: s
            })
            return result.map(o => {
                return {key: o.display_name, value: o.boundingbox};
            });
        }}
        on:select={viewPosition}
    />

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

    main > .buttons {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        flex-direction: column;
    }

</style>