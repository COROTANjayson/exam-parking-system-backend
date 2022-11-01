import { IncomingMessage,  ServerResponse } from "http";
import { getJSONDataFromRequestStream, getPathParams, getQueryParams } from "../utils/generateParams";
import { Response } from "../response/response";
import { generateParkingMap } from "../services/parkingLot";
import { selectDB } from "../lib/database/database";
import { constants } from '../utils/constants';

export const TicketRequest = async (req: IncomingMessage)=> {
    const response = new Response()
    switch (req.method) {
        case 'GET':
            try {
                const queryParams = getQueryParams(req) as {parkingStatus: string}
                let query = ''
                if(queryParams.parkingStatus!==undefined) {
                    query = `parkingStatus='${queryParams.parkingStatus}'`
                }
                const tickets = await selectDB(constants.table.Ticket, query)

                return response.successResponse(200,tickets )
                
            } catch (error) {
                console.log(error)
                let message = ''
                if (error instanceof Error) message = error.message
                const result = {message: message}
                return response.errorResponse(500, result )
            }
    }

}