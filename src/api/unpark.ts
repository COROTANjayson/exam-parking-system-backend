import { IncomingMessage,  ServerResponse } from "http";
import { getJSONDataFromRequestStream, getPathParams, getQueryParams } from "../utils/generateParams";
import { Response } from "../response/response";
import { generateParkingMap } from "../services/parkingLot";
import { unParkOnleaveService, unParkService } from "../services/unpark";
export const UnparkRequest = async (req: IncomingMessage)=> {
    const response = new Response()
    switch (req.method) {
        case 'PUT':
            try {
                const requestData = await getJSONDataFromRequestStream(req) as {ticketId: string, parkingSpotId: string, parkingStatus: string}

                const res = await unParkService(requestData)
                return res
            } catch (error) {
                console.log(error)
                let message = ''
                if (error instanceof Error) message = error.message
                const result = {message: message}
                return response.errorResponse(500, result )
            }
        case 'GET':
            try {
                const res = await unParkOnleaveService()
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