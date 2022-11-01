import { IncomingMessage,  ServerResponse } from "http";
import { getJSONDataFromRequestStream, getPathParams, getQueryParams } from "../utils/generateParams";
import { Response } from "../response/response";
import { generateParkingMap } from "../services/parkingLot";

export const ParkingMapRequest = async (req: IncomingMessage)=> {
    const response = new Response()
    switch (req.method) {
        case 'GET':
            try {
                const queryParams = getQueryParams(req) as {status: string}
                const res = await generateParkingMap(queryParams)
                return res
                
            } catch (error) {
                console.log(error)
                let message = ''
                if (error instanceof Error) message = error.message
                const result = {message: message}
                return response.errorResponse(500, result )
            }  
    }

}