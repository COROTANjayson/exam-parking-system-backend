import { IncomingMessage,  ServerResponse } from "http";
import { getJSONDataFromRequestStream, getPathParams, getQueryParams } from "../utils/generateParams";
import { Response } from "../response/response";
import { generateParkingMap } from "../services/parkingLot";
import { calculatePayment } from "../services/calculatePayment";
import { selectDB } from "../lib/database/database";
import { constants } from '../utils/constants';
import _ from 'lodash'

export const CalculatePaymentRequest = async (req: IncomingMessage)=> {
    const response = new Response()
    switch (req.method) {
        case 'GET':
            try {
                const pathParam = getPathParams(req.url as string, '/calculate-payment/:ticketId')
                const ticket= await selectDB(constants.table.Ticket, `id='${pathParam.ticketId}'`)

                if(_.isEmpty(ticket)){
                    const result = {message: 'ticket id does not exist'}
                    return response.errorResponse(404, result )
                } else {
                    const ticketResult = await calculatePayment(pathParam.ticketId)
                    return response.successResponse(200, ticketResult.data )

                }
                
            } catch (error) {
                console.log(error)
                let message = ''
                if (error instanceof Error) message = error.message
                const result = {message: message}
                return response.errorResponse(500, result )
            }  
    }

}