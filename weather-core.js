(function(root, factory){
  const api = factory();
  if(typeof module === 'object' && module.exports) module.exports = api;
  root.VesperWeatherCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';

  function codeToBaseState(code){
    const n = Number(code);
    if(n === 0 || (n >= 1 && n <= 3) || (n >= 45 && n <= 48)) return 'clear';
    if((n >= 51 && n <= 67) || (n >= 80 && n <= 82)) return 'rainy';
    if((n >= 71 && n <= 77) || (n >= 85 && n <= 86)) return 'snowy';
    if(n >= 95 && n <= 99) return 'stormy';
    return 'clear';
  }

  function resolveVesperState({ weatherCode, isDay, windKmh }){
    const base = codeToBaseState(weatherCode);
    if(base === 'stormy' || base === 'snowy' || base === 'rainy') return base;
    if(Number(windKmh) >= 25) return 'windy';
    if(Number(isDay) === 0 && base === 'clear') return 'night';
    return base;
  }

  function resolveVesperAppearance({ weatherCode, isDay, windKmh }){
    const resolved = resolveVesperState({ weatherCode, isDay, windKmh });
    return {
      state: resolved === 'night' ? 'clear' : resolved,
      isNight: Number(isDay) === 0
    };
  }

  function formatPlace(result){
    const parts = [result && result.name];
    if(result && result.admin1 && result.admin1 !== result.name) parts.push(result.admin1);
    if(result && result.country_code && result.country_code !== 'US' && result.country) parts.push(result.country);
    return parts.filter(Boolean).join(', ');
  }

  function buildForecastUrl(lat, lon, temperatureUnit){
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lon));
    url.searchParams.set('current', 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day');
    url.searchParams.set('temperature_unit', temperatureUnit === 'celsius' ? 'celsius' : 'fahrenheit');
    url.searchParams.set('wind_speed_unit', 'kmh');
    url.searchParams.set('timezone', 'auto');
    return url.toString();
  }

  function buildDiscoveryPoints(){
    return [
      ['Anchorage, Alaska',61.218,-149.900],['Fairbanks, Alaska',64.838,-147.716],['Honolulu, Hawaii',21.307,-157.858],
      ['Seattle, Washington',47.606,-122.332],['San Francisco, California',37.775,-122.419],['Los Angeles, California',34.052,-118.244],
      ['Denver, Colorado',39.739,-104.990],['Dallas, Texas',32.777,-96.797],['Chicago, Illinois',41.878,-87.630],
      ['Miami, Florida',25.762,-80.192],['New York, New York',40.713,-74.006],['Portland, Maine',43.657,-70.259],
      ['Mexico City, Mexico',19.433,-99.133],['San José, Costa Rica',9.928,-84.091],['Panama City, Panama',8.983,-79.520],
      ['Bogotá, Colombia',4.711,-74.072],['Quito, Ecuador',-0.181,-78.468],['Lima, Peru',-12.046,-77.043],
      ['La Paz, Bolivia',-16.489,-68.119],['Santiago, Chile',-33.449,-70.669],['Buenos Aires, Argentina',-34.604,-58.382],
      ['Reykjavik, Iceland',64.147,-21.943],['Dublin, Ireland',53.350,-6.260],['London, United Kingdom',51.507,-0.128],
      ['Lisbon, Portugal',38.722,-9.139],['Paris, France',48.857,2.352],['Berlin, Germany',52.520,13.405],
      ['Oslo, Norway',59.914,10.752],['Helsinki, Finland',60.170,24.938],['Rome, Italy',41.903,12.496],
      ['Athens, Greece',37.984,23.728],['Cairo, Egypt',30.044,31.236],['Cape Town, South Africa',-33.925,18.424],
      ['Nairobi, Kenya',-1.292,36.822],['Lagos, Nigeria',6.524,3.379],['Dubai, UAE',25.204,55.271],
      ['Delhi, India',28.614,77.209],['Mumbai, India',19.076,72.878],['Bangkok, Thailand',13.756,100.502],
      ['Singapore',1.352,103.820],['Hong Kong',22.319,114.169],['Tokyo, Japan',35.676,139.650],
      ['Seoul, South Korea',37.566,126.978],['Sapporo, Japan',43.062,141.354],['Ulaanbaatar, Mongolia',47.918,106.918],
      ['Perth, Australia',-31.952,115.861],['Sydney, Australia',-33.869,151.209],['Wellington, New Zealand',-41.286,174.776],
      ['Stanley, Falkland Islands',-51.698,-57.852],['Cape Horn, Chile',-55.983,-67.267],['Tórshavn, Faroe Islands',62.008,-6.790],
      ['Shetland, Scotland',60.155,-1.145],['Kerguelen Islands',-49.350,70.217],['Adak, Alaska',51.880,-176.660],
      ['Amarillo, Texas',35.222,-101.831],['Mount Washington, New Hampshire',44.271,-71.303],['Reykjanes, Iceland',63.850,-22.680],
      ['Barrow, Alaska',71.291,-156.789],['Longyearbyen, Svalbard',78.223,15.647],['Yellowknife, Canada',62.454,-114.372],
      ['Iqaluit, Canada',63.747,-68.517],['Rovaniemi, Finland',66.503,25.729],['Yakutsk, Russia',62.036,129.675],
      ['Punta Arenas, Chile',-53.164,-70.917],['Ushuaia, Argentina',-54.802,-68.303],['Outer Hebrides, Scotland',57.760,-7.020],
      ['Darwin, Australia',-12.464,130.846],['Manila, Philippines',14.600,120.984],['Havana, Cuba',23.113,-82.367],
      ['Southern Ocean, 60°S 0°E',-60.000,0.000],['Antarctic Coast, 70°S 160°E',-70.000,160.000],['Arctic Ocean, 80°N 20°E',80.000,20.000]
    ].map(([label,lat,lon]) => ({ label, lat, lon }));
  }

  function discoveryScore(state, point){
    if(state === 'windy') return Number(point.windKmh) || 0;
    if(state === 'stormy') return (Number(point.weatherCode) || 0) * 10 + (Number(point.windKmh) || 0);
    if(state === 'snowy') return (Number(point.weatherCode) || 0) * 10 - (Number(point.temperature) || 0);
    if(state === 'rainy') return (Number(point.weatherCode) || 0) * 10 + (Number(point.windKmh) || 0);
    if(state === 'night') return -(Number(point.windKmh) || 0);
    return (Number(point.isDay) === 1 ? 1000 : 0) - (Number(point.windKmh) || 0);
  }

  function chooseLiveExamples(points){
    const chosen = {};
    for(const point of points){
      const state = resolveVesperState(point);
      if(!chosen[state] || discoveryScore(state, point) > discoveryScore(state, chosen[state])) chosen[state] = point;
    }
    return chosen;
  }

  function selectMotionProfile(state, isNight){
    return state === 'clear' && Boolean(isNight) ? 'night' : state;
  }

  function createLatestGate(){
    let sequence = 0;
    return {
      begin(){ sequence += 1; return sequence; },
      isLatest(token){ return token === sequence; },
      invalidate(){ sequence += 1; }
    };
  }

  return { codeToBaseState, resolveVesperState, resolveVesperAppearance, formatPlace, buildForecastUrl, buildDiscoveryPoints, chooseLiveExamples, selectMotionProfile, createLatestGate };
});
