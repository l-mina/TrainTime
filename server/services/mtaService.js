import axios from "axios";
import protobuf from "protobufjs";
import path from "path";

const GTFS_FEED_URL = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace";
const VEHICLE_FEED_URL = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fvehicle-ace";

// Load proto file once
const protoPath = path.join(__dirname, "../../gtfs-realtime.proto");
const root = protobuf.loadSync(protoPath);
const FeedMessage = root.lookupType('transit_realtime.FeedMessage');

export const mtaService = {

    fetchGtfsRealtimeFeed: async(stationId = null) => {
        try {
            const response = await axios.get(GTFS_FEED_URL, {
                responseType: 'arraybuffer',
            });
        
            const buffer = response.data;
            const message = FeedMessage.decode(new Uint8Array(buffer));
            const object = FeedMessage.toObject(message, {
                longs: String,
                enums: String,
                bytes: String,
            });

            if (!stationId) return object;

            const filteredEntities = object.entity
                .filter(entity =>
                    entity.tripUpdate &&
                    entity.tripUpdate.stopTimeUpdate &&
                    entity.tripUpdate.stopTimeUpdate.some(stop => stop.stopId === stationId)
                    ).map(entity => {
                        const stopUpdate = entity.tripUpdate.stopTimeUpdate.find(stop => stop.stopId === stationId);
                        return {
                            tripId: entity.tripUpdate.trip.tripId,
                            routeId: entity.tripUpdate.trip.routeId,
                            arrivalTime: stopUpdate.arrival ? parseInt(stopUpdate.arrival.time) : null,
                            departureTime: stopUpdate.departure ? parseInt(stopUpdate.departure.time) : null,
                            stopId: stopUpdate.stopId,
                        }
                    });
            return { entities: filteredEntities };
        } catch (error) {
            console.error("Error fetching GTFS feed ", error);
            throw error;
        }
    },

    fetchVehiclePositions: async(routeId = null) => {
        try {
            const response = await axios.get(VEHICLE_FEED_URL, {
                responseType: 'arraybuffer',
            });

            const buffer = response.data;
            const message = FeedMessage.decode(new Uint8Array(buffer));
            const object = FeedMessage.toObject(message, {
                longs: String,
                enums: String,
                bytes: String,
            });

            let vehicleEntities = object.entity
                .filter(entity => entity.vehicle)
                .map(entity => ({
                    tripId: entity.vehicle.trip?.tripId || null,
                    routeId: entity.vehicle.trip?.routeId || null,
                    latitude: entity.vehicle.position?.latitude,
                    longitude: entity.vehicle.position?.longitude,
                    bearing: entity.vehicle.position?.bearing || null,
                    currentStopId: entity.vehicle.stopId || null,
                    timestamp: entity.vehicle.timestamp ? parseInt(entity.vehicle.timestamp): null,
                    speed: entity.vehicle.position?.speed || null
            }));
            
            if (routeId) vehicleEntities = vehicleEntities.filter(v => v.routeId === routeId);

            return { vehicles: vehicleEntities };
        } catch (error) {
            console.error("Error fetching vehicle positions: ",error);
            throw error;
        }
    }

}