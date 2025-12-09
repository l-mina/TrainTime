
const toISO = (epoch) => {
    if (!epoch) return null;
    return new Date(epoch * 1000).toISOString();
};

const getDirection = (stopId) => {
    if (!stopId) return null;
    return stopId.endsWith('N') ? "U" : "D";
};

export const mtaFormatter = {

    formatStationResponse: (stationId, arrivals, vehicles, stationInfo = null) => {
        return {
            stationId,
            stationName: stationInfo?.name || null,
            arrivals: arrivals.map(a =>({
                tripId: a.tripId,
                line: a.routeId,
                arrivalTime: toISO(a.arrivalTime),
                departureTime: toISO(a.departureTime),
                direction: getDirection(a.stopId),
                stopId: a.stopId
            })),
            vehicles: vehicles.map(v => ({
                tripId: v.tripId,
                line: v.routeId,
                lat: v.latitude,
                lon: v.longitude,
                bearing: v.bearing,
                speed: v.speed,
                timestamp: toISO(v.timestamp),
                direction: getDirection(v.currentStopId)
            }))
        };
    }
};