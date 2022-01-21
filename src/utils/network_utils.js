/* 
    'network_utils.js' By Massimo Moffa
    - Questa pagina contiene le funzioni da usare per le comunicazioni
      col server ed altro riguardo i collegamenti in rete
*/

export default class NetworkUtils {

    static server = "square.sensesquare.eu";
    static nominatim = "http://193.205.184.32";
    static server_lettura = `https://${this.server}:5001/`;
    static server_utenti = `https://${this.server}:5002/`;

    static cloneFormdata(formData) {
      if(!formData || !(formData instanceof FormData))
        return null;
      let form = new FormData();
      for(const [key, value] of formData.entries()) {
        form.append(key, value);
      }
      return form;
    }

    static checkToken(params){
      return new Promise((resolve, reject) => {
        fetch(this.server_utenti + "check_token", {
          method: "POST",
          body: params
        })
        .then(this.fetchHandler)
        .then(result => {
          if(result.response_code === 200)
            resolve(result.result);
          else
            reject(result.message);
        })
        .catch(e => reject(e));
      });
    }

    static getGeoUrl(geo_level){
        switch (geo_level) {
          case 0:
            return this.server_lettura + "/worldjson";
          case 1:
            return this.server_lettura + "/regionjson";
          case 2:
            return this.server_lettura + "/provincejson";
          case 3:
            return this.server_lettura + "/municipalityjson";
          case 4:
            return this.server_lettura + "/squarejson";
        }
    }
  
    //Types: "D": Daily, "H": Hourly, "I": Last 5 minutes, "P": Past
    static getDataUrl(geo_level, type="D", isObtained=false){
        if(type === "P") 
          return this.server_lettura + "/onDateRequest";
        switch (geo_level) {
          case 0:
            return this.server_lettura + "/world" + type + "Request";
          case 1:
            return this.server_lettura + "/region" + type + "Request";
          case 2:
            return this.server_lettura + "/province" + type + "Request" + (isObtained ? "Obtained" : "");
          case 3:
            return this.server_lettura + "/municipality" + type + "Request" + (isObtained ? "Obtained" : "");
          case 4:
            return this.server_lettura + "/square" + type + "Request" + (isObtained ? "Obtained" : "");
        }
    }
  
    static fetchHandler(response){
        if(!response.ok){
          throw Error(response);
        }
        return response.json();
    }

    static geodecode(lat, lon, geo_level, params){
      return new Promise((resolve, reject) => {
        // Parametro per il geodecoder
        params = this.cloneFormdata(params);
        params.append("lat", lat);
        params.append("lon", lon);
        params.append("zoom", geo_level);

        // Esecuzione del geodecoder
        fetch(this.server_lettura + "geodecode", {
          method: "POST",
          body: params
        })
        .then(this.fetchHandler)
        .then(result => {

          // Risultato del geodecoder
          resolve(result);

        })
        .catch(e => {

          // Errore del geodecoder
          console.log("Errore: Sembra esserci un problema con il geodecoder");
          reject(e);

        });
      });
    }

    static getGeoPromise(place, geo_level, params){
      // Parametri
      params = this.cloneFormdata(params);
      Object.keys(place).forEach(key => params.append(key, place[key]));

      // Return della promise
      return fetch(this.getGeoUrl(geo_level), {
        method: "POST",
        body: params
      }).then(this.fetchHandler);
    }

    static getDataPromise(place, geo_level, type, params, fonte=null, isObtained=false){
      // Parametri
      params = this.cloneFormdata(params);
      if(fonte && fonte !== "all")
        params.append("fonte", fonte);
      Object.keys(place).forEach(key => params.append(key, place[key]));

      // Return della promise
      return fetch(this.getDataUrl(geo_level, type, isObtained), {
        method: "POST",
        body: params
      }).then(this.fetchHandler);
    }

    static async getGeoDataInfo(lat, lon, geo_level, type, params, lastPlace, forceDownload=false, fonte=null, isObtained=false){

      // Getting info about the new position
      let place = {};
      let newPlace = "";
      if(geo_level > 0){
        
        place = await this.geodecode(lat, lon, geo_level-1, params);

        if(place.hasOwnProperty("error"))
          return null;
          
      }

      // Check if download is required
      if(!forceDownload)
        if(JSON.stringify(place) === JSON.stringify(lastPlace))
          return null;
          
      // Download dei dati
      let DOWNLOAD = [ this.getGeoPromise(place, geo_level, params) ];
      if(type)
        DOWNLOAD.push( this.getDataPromise(place, geo_level, type, params, fonte, isObtained) );
      let result = await Promise.all(DOWNLOAD)

      // Aggiunta dell'ultimo luogo
      result.push(place);

      // Risultato
      return result;
    }

    static async getSquareNumber(place, params) {

      if(!place)
        return 0;

      if(place.hasOwnProperty("comune"))
        return 1;
      
      let p = "";
      Object.keys(place).forEach(key => {
        if(p === "")
          p += place[key];
        else
          p += `.${place[key]}`;
      });

      params = this.cloneFormdata(params);
      params.append("chiave", p);

      let result = await (await fetch(this.server_lettura + "numero_squares", {
        method: "POST",
        body: params
      })).json();

      console.log(result);

      if(result.response_code === 200)
        return result.result;
      return 0;
      
    }

    static async getServerUtenti(route, options, getResponse=false){
      if(getResponse)
        return await fetch(`${this.server_utenti}/${route}`, options);
      return await (await fetch(`${this.server_utenti}/${route}`, options) ).json();
    }

    static async getServerLettura(route, options, getResponse=false){
      if(getResponse)
        return await fetch(`${this.server_lettura}/${route}`, options);
      return await (await fetch(`${this.server_lettura}/${route}`, options) ).json();
    }

    static async getNominatim(route, params={}, options={}, getResponse=false){
      let p = "";
      Object.entries(params).forEach(([key, val]) => {
        p += `${key}=${val}&`;
      })
      p = p.substring(0, p.length);
      if(getResponse)
        return await fetch(`${this.nominatim}/${route}?${p}`, options);
      return await (await fetch(`${this.nominatim}/${route}?${p}`, options)).json()
    }

}