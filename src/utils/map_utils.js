// Map Utils
import L from 'leaflet';
import NetworUtils from './network_utils';
import * as provider from '../components/leaflet-providers';

export default class Map {

    // Map attributes
    _map = null;
    _mapRef = null;
    _layerGroup = null;
    _config = null;
    _place = null;
    _params = null;
    _lastPlace = null;
    _lastGeoLevel = null;
    _data = null;
    _geojson = null;
    _tileLayer = null;
    _popup = null;

    // Map constructor
    constructor(_params, _mapRef, _config={}) {

        let defaultConfig = {center: [41.880458, 12.470133], zoom: 5, info: { zoomControl: true }};

        // Map reference
        this._mapRef = _mapRef;

        // Map configuration
        this._config = {
            ...defaultConfig,
            ..._config
        };

        // Params
        this._params = _params;

        // Map object
        this._map = L.map(_mapRef, {
            renderer: L.canvas(),
            center: this._config.center,
            zoom: this._config.zoom,
            zoomControl: this._config.info.zoomControl
        });

        // Create layerGroup
        this._layerGroup = new L.LayerGroup();
        this._layerGroup.addTo(this._map);

    }

    // Load tiles on the map
    applyTiles(name='OpenStreetMap.Mapnik') {
        if(this._tileLayer !== null)
            this._tileLayer.remove();
        this._tileLayer = L.tileLayer.provider(name).addTo(this._map);
    }

    // Get map geolevel
    getGeoLevel(){
        let zoom = this._map.getZoom();
        return Map._getGeoLevel(zoom)
    }

    // Get geolevel
    static _getGeoLevel(zoom) {
        if(zoom < 6)
            return 0;
        if(zoom < 9)
            return 1;
        if(zoom < 11)
            return 2;
        if(zoom < 14)
            return 3;
        return 4;
    }

    // Get zoom from geolevel
    static _getZoomFromGeolevel(geolevel) {
        if(geolevel === 0)
            return 5;
        if(geolevel === 1)
            return 8;
        if(geolevel === 2)
            return 10;
        if(geolevel === 3)
            return 13;
        return 14;
    }

    // Get zoom base from geolevel
    getZoomFromGeoLevel(){
        let geolevel = this.getGeoLevel();
        if(geolevel === 0)
            return 0;
        if(geolevel === 1)
            return 6;
        if(geolevel === 2)
            return 9;
        if(geolevel === 3)
            return 11;
        return 14;
    }

    // Load geojson on the map
    async loadGeojson(config={}, path=null) {
        let geodecode;
        if(path !== null){
            geodecode = path.path;
            this.setCenter(path.center);
            this.setZoom(path.zoom);
        }else{
            geodecode = await this.getGeodecodedPosition();
        }
        if(config.hasOwnProperty("moveend"))
            this._map.on("moveend", config.moveend);

        if(config.hasOwnProperty("zoomend"))
            this._map.on("zoomend", config.zoomend);
        if(geodecode === null)
            return;
        this._lastPlace = geodecode;
        this._lastGeoLevel = this.getGeoLevel();
        if(config.hasOwnProperty("updatePlace"))
                config.updatePlace(geodecode);
        if(config.hasOwnProperty("getData"))
            this._data = await config.getData(geodecode);
        this._geojson = await NetworUtils.getGeoPromise(geodecode, this.getGeoLevel(), this._params);
        this.updateGeojsonConfiguration(config)
    }

    // Update geojson data
    async updateGeojson(config, forceDownload=false){

        try {
            
            if(this._lock)
                return;
    
            this._lock = true;
    
            // Check geolevel
            let checkGeoLevel = this._lastGeoLevel !== this.getGeoLevel();
    
            // Check place
            let geodecode = await this.getGeodecodedPosition();
            if(geodecode === null){
                this._lock = false;
                return;
            }
            let checkPlace = JSON.stringify(this._lastPlace) !== JSON.stringify(geodecode);
    
            // Update attributes
            this._lastPlace = geodecode;
            this._lastGeoLevel = this.getGeoLevel();

            if(config.hasOwnProperty("updatePlace"))
                config.updatePlace(geodecode);

            // Exit if not required
            if(!forceDownload){
                if(!checkGeoLevel && !checkPlace){
                    this._lock = false;
                    return;
                }
            }
    
            if(config.hasOwnProperty("getData"))
                this._data = await config.getData(geodecode);
            else
                this._data = null;
            this._geojson = await NetworUtils.getGeoPromise(geodecode, this.getGeoLevel(), this._params);
            this.updateGeojsonConfiguration(config)
            this._lock = false;

        } catch (error) {
            
            this._lock = false;
            throw error;

        }

    }

    // Update geojson configuration 
    updateGeojsonConfiguration(config) {

        // Remove all the layers from the map
        this._layerGroup.clearLayers();

        let layer = L.geoJSON(this._geojson, this.getConfiguration(this._data, config));
        this._layerGroup.addLayer(layer);
    }

    // Get map configuration
    getConfiguration(data=null, config) {
        return {
            style: feature => {
                return this.getColors(feature, data, config);
            },
            onEachFeature: (feature, layer) => {
                layer.on({
                    click: (e) => {
                        if(config.hasOwnProperty("click"))
                            config.click(feature, layer, e, data);
                    },
                    mouseover: (e) => {
                        if(config.hasOwnProperty("mouseover"))
                            config.mouseover(layer);
                        else
                            layer.setStyle({ weight: 3});
                    },
                    mouseout: () => {
                        if(config.hasOwnProperty("mouseout"))
                            config.mouseout(layer);
                        else
                            layer.setStyle({ weight: 1});
                    }
                });
            }
        }
    }

    // Get features colors
    getColors(feature, data=null, config) {
        
        //Default style
        let style = {
            fillColor: "#000",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.3
        }

        // Check if there is data
        if(config.hasOwnProperty("getColors"))
            style = config.getColors(config.info, feature, data, style);

        return style;

    }

    // Get center geodecode
    async getGeodecodedPosition(){
        let center = this.getCenter();
        let result = await NetworUtils.geodecode(center.lat, center.lng, this.getGeoLevel(), this._params);
        if(result.hasOwnProperty("error"))
            return null;
        return result;
    }

    // Get center map
    getCenter() {
        return this._map.getCenter();
    }

    // Set center 
    setCenter(center){
        this._map.flyTo(center);
    }

    // Get last place
    getPosition() {
        return this._lastPlace;
    }

    // Set zoom 
    setZoom(zoom){
        this._map.flyTo(this.getCenter(), zoom);
    }

    // Get zoom
    getZoom(){
        return this._map.getZoom();
    }

    // Get last place
    getLastPlace() {
        return this._lastPlace;
    }

    // Get leaflet map object
    getMapObject() {
        return this._map;
    }

    // Show a popup
    showPopup(latlng, content, options={}) {
        this._popup = L.popup(options)
            .setLatLng(latlng)
            .setContent(content)
            .openOn(this._map);
    }

    // Clear popup
    clearPopup() {
        if(this._popup !== null)
            this._popup.remove();
    }

    // Get bounding box
    static getBoundingBox(f) {
        let result = [];
        let bounds = L.geoJson(f).getBounds();
        result.push(bounds.getNorthEast());
        result.push(bounds.getSouthWest());
        return result;
    }

    // Get map types
    static getMapTypes() {
        return ["Standard", "OpenTopoMap", "OPNVKarte", "CyclOSM", "Stamen.Toner", "Stamen.TerrainBackground", "Esri.DeLorme", "Esri.WorldTopoMap", "Esri.WorldImagery", "Esri.WorldShadedRelief", "MtbMap", "NASAGIBS.ViirsEarthAtNight2012"];
    }

}