import { IncomingMessage} from "http";
import { getJSONDataFromRequestStream, getPathParams, getQueryParams } from "../utils/generateParams";
import { Response } from "../response/response";
import { generateParkingMap } from "../services/parkingLot";
import { allocateSpotService, parkOnleaveCar } from "../services/allocateSpot";
export const AllocateSpotRequest = async (req: IncomingMessage)=> {
    const response = new Response()
    switch (req.method) {
        case 'POST':
            try {
                const requestData = await getJSONDataFromRequestStream(req) as {carSize: 0|1|2, licenseNumber: string, entryValue: string, ticketId: string}

                const res = allocateSpotService(requestData)
                return res
            } catch (error) {
                let message = ''
                if (error instanceof Error) message = error.message
                const result = {message: message}
                return response.errorResponse(500, result )
            }
        case'PUT':
            try {
                const pathParam = getPathParams(req.url as string, '/allocate-spot/:ticketId')
                const res = await parkOnleaveCar(pathParam.ticketId)
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