
import { mtaService } from "./mtaService";

const CACHE_REFRESH_INTERVAL = 15000;

// Initial cache
let gtfsCache = { entities: [] };
let vehicleCache = { vehicles: [] };

// Refresh function
const refreshCache = async() => {
    try {
        gtfsCache = await mtaService.fetchGtfsRealtimeFeed();
        vehicleCache = await mtaService.fetchVehiclePositions();
        console.log("MTA cache refreshed: ", new Date().toISOString());
    } catch (error) {
        console.error("Error refreshing MTA cache: ", error);
    }
};

setInterval(refreshCache, CACHE_REFRESH_INTERVAL);

// Initial load
refreshCache();

export const getCachedData = (stationId = null, routeId = null) => {

    const arrivals = stationId
        ? gtfsCache.entities.filter( entity =>
            entity.stopId === stationId ||
            entity.stopId?.startsWith(stationId))
        : gtfsCache.entities;
    
    const vehicles = routeId
        ? vehicleCache.vehicles.filter( v => v.routeId === routeId)
        : vehicleCache.vehicles;
    
        return { arrivals, vehicles };
};