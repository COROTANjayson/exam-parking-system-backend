import _ from 'lodash'
import { DataQuery } from "../lib/database/databaseQuery";
import { selectDB } from '../lib/database/database';
import { constants } from '../utils/constants';
import { Response } from "../response/response";
import {Ticket} from '../modules/ticket';

interface entry {
    id?: string
    slot?: number
    entryValue?: string, 
  }
interface car {
    carDesc: 'S'|'M'|'L'
    carSize: 0|1|2
}
 interface ticket {
            id?: string
            parkingSpotId: string
            vehicleId: string
            entryTime: string
            exitTime?: string
            exceedingHours?: number,
            exceedingFee?: number,
            totalHours?: number,
            totalPayment?: number,
            parkingStatus?: 'unparked'| 'onleave' | 'parking'
          }
export const calculatePayment = async(ticketId: string) =>{
    const response = new Response()
    
    const ticket= await selectDB(constants.table.Ticket, `id='${ticketId}'`)
    
    let exitTime = new Date().toString()
    if(ticket[0].exitTime !== ''){
        exitTime = ticket[0].exitTime as string
    }
    // create ticket model to calculate payments and hours consumed
    const ticketData:ticket = {
        id: ticket[0].id as string,
        parkingSpotId: ticket[0].parkingSpotId as string,
        vehicleId: ticket[0].vehicleId as string,
        entryTime: ticket[0].entryTime as string,
        exitTime: exitTime,
        parkingStatus: ticket[0].parkingStatus as 'unparked'| 'onleave' | 'parking',
    }
    
    const ticketModel = new Ticket(
        ticketData
    ) 
    ticketModel.getExceedingHours()
    ticketModel.getTotalParkFees()
    ticketModel.getTotalHours()
    ticketModel.getExceedingHoursCharge()

    return  ticketModel
    
}


