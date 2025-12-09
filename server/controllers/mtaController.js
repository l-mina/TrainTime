
import { getCachedData } from "../services/mtaCache.js";
import { mtaFormatter } from "../services/mtaFormatter.js";

// Helper functions
const handleServerError = (res,error,functionName) => {
    console.error(`Error in ${functionName}: `,error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
};

export const getStationData = async(req,res) => {
    try {
        const { stationId, routeId } = req.query;

        const { arrivals, vehicles } = getCachedData(stationId, routeId);

        const stationInfo = null;
        
        const formatted = mtaFormatter.formatStationResponse(
            stationId,
            arrivals,
            vehicles,
            stationInfo
        );
                
        res.status(200).json({ 
            success: true, 
            data: formatted
        });
    } catch (error) {
        handleServerError(res,error,"getStationData");
    }
};