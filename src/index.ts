import { createServer, IncomingMessage, ServerResponse } from "http";
import { ParkingMapRequest } from "./api/parkingMap";
import { EntryPointRequest } from "./api/entryPoint";
import { AllocateSpotRequest } from "./api/allocateSpot";
import { UnparkRequest } from "./api/unpark";
import { CalculatePaymentRequest } from "./api/calculatePayment";
import { TicketRequest } from "./api/ticket";
import { UnparkOnleaveRequest } from "./api/unparkOnleave";

// import { Response } from "./response/response";
const listener = async(req: IncomingMessage, res: ServerResponse) => {
    interface result{
        code: number
        result: object
    }
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PUT, DELETE",
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",
        "Content-Type": "application/json"
    }
    try {
       
        let result: undefined|result
        if(req.method === "OPTIONS") {
            res.writeHead(204, headers);
            res.end();
            return;
        }
        
        if ((req.url as string).match('/parking-map(.*?)')) {
                result = await ParkingMapRequest(req) as result | undefined
        }
        if ((req.url as string).match('/entry-point(.*?)')) {
            result = await EntryPointRequest(req) as result | undefined
        }
        if ((req.url as string).match('/allocate-spot(.*?)')) {
            result = await AllocateSpotRequest(req) as result | undefined
        }
        if ((req.url as string).match('/unpark(.*?)')) {
            result = await UnparkRequest(req) as result | undefined
        }
        if ((req.url as string).match('/unpark-onleave(.*?)')) {
            result = await UnparkOnleaveRequest(req) as result | undefined
        }
        if ((req.url as string).match('/calculate-payment(.*?)')) {
            result = await CalculatePaymentRequest(req) as result | undefined
        }
        if ((req.url as string).match('/ticket(.*?)')) {
            result = await TicketRequest(req) as result | undefined
        }
        
        if(result !== undefined){
            res.writeHead(result.code, headers);
            res.end(JSON.stringify(result.result));
        } else {
            throw new Error('Bad Request')
        }
    } catch (error) {
        let message = ''
        if (error instanceof Error) message = error.message
        res.writeHead(400, headers);
        res.end(JSON.stringify(message));
    }
}

const server = createServer(listener)
server.listen(8080)