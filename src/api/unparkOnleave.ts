import { IncomingMessage,  ServerResponse } from "http";
import { getJSONDataFromRequestStream, getPathParams, getQueryParams } from "../utils/generateParams";
import { Response } from "../response/response";
import { generateParkingMap } from "../services/parkingLot";
import { unParkOnleaveService } from "../services/unpark";

export const UnparkOnleaveRequest = async (req: IncomingMessage)=> {
    const response = new Response()
    switch (req.method) {
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