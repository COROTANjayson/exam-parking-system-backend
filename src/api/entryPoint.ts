import { IncomingMessage,  ServerResponse } from "http";
import { getJSONDataFromRequestStream, getPathParams, getQueryParams } from "../utils/generateParams";
import { Response } from "../response/response";
import {queryEntryPoint } from "../services/parkingLot";
import { addNewEntryPointService, RemoveEntryPointService } from "../services/entryPoint";
export const EntryPointRequest = async (req: IncomingMessage)=> {
    const response = new Response()
    switch (req.method) {
        case 'GET':
            try {
                const res = await queryEntryPoint()
                return res
                
            } catch (error) {
                console.log(error)
                let message = ''
                if (error instanceof Error) message = error.message
                const result = {message: message}
                return response.errorResponse(500, result )
            }  
        case 'POST':
            try {
                const requestData = await getJSONDataFromRequestStream(req) as {slot: number}

                const res = await addNewEntryPointService(requestData.slot)
                return res
                
            } catch (error) {
                console.log(error)
                let message = ''
                if (error instanceof Error) message = error.message
                const result = {message: message}
                return response.errorResponse(500, result )
            }  
        case 'PUT':
            try {
                const requestData = await getJSONDataFromRequestStream(req) as {slot: number}

                const res = await RemoveEntryPointService(requestData.slot)
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