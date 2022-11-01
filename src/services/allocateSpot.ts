import _ from 'lodash'
import { DataQuery } from "../lib/database/databaseQuery";
import { selectDB } from '../lib/database/database';
import { constants } from '../utils/constants';
import { Response } from "../response/response";
import {Ticket} from '../modules/ticket';
import {ParkingSpot} from '../modules/parkingSpot'
import {Vehicle} from '../modules/vehicle'
import { calculatePayment } from './calculatePayment';
interface entry {
    id?: string
    slot?: number
    entryValue?: string, 
  }
interface car {
    carDesc: 'S'|'M'|'L'
    carSize: 0|1|2
}
export const allocateSpotService = async(requestData:{carSize: 0|1|2, licenseNumber: string, entryValue: string, ticketId:string}) =>{
    const response = new Response()
    const {entryValue, carSize, licenseNumber, ticketId} = requestData
    //query all parking spot
    const parkingSpots = await selectDB(constants.table.ParkingSpot)
    
    //filter the parking without the entrypoints
    const parkingSpotsFilter = _.filter(parkingSpots, value => value.status != 'entrypoint')
    
    //query all entrypoints
    const entryPoints = await selectDB(constants.table.EntryPoint)
    // car description and size value
    const carTypes:Array<car>  = [{carDesc: 'S', carSize: 0}, {carDesc: 'M', carSize: 1},{carDesc: 'L', carSize: 2},]

    // get the entrypoint value base on request
    const entryPointValue: entry| undefined = _.find(entryPoints, {entryValue: entryValue})
    
    const parkingLot = _.orderBy(parkingSpotsFilter,['slot'], ['asc'])
    // filter all available parking slot
    const filterParkingSlot = _.filter(parkingLot, {status: 'available'})
    
    // filter sizes base on the request
    const filterSize:Array<any> = _.filter(filterParkingSlot, value=> {
        if(carSize<=value.slotSize){
            return value
        }
    })

    if(_.isEmpty(filterParkingSlot)){
        const result = {message: 'No available parkin spot'}
        return response.errorResponse(404, result )
    } else if(_.isEmpty(entryPointValue)){
        const result = {message: 'Entry Point does not exist'}
        return response.errorResponse(404, result )
    } else if(_.isEmpty(filterSize)){
        const result = {message: 'No available parking spot for that car size'}
        return response.errorResponse(404, result )
    } else {
        // find closest parking slot using reduce
        const closestParkingSpot = filterSize.reduce((prevVal, curtVal) => {
            if(entryPointValue.slot !== undefined){
                let prevDiff = Math.abs(prevVal.slot - entryPointValue.slot);
                let curDiff = Math.abs(curtVal.slot - entryPointValue.slot);
                        return curDiff<prevDiff ? curtVal : prevVal;
            }
            
        });

        if(closestParkingSpot !== undefined){
            const carType = _.find(carTypes, {carSize: carSize})
            if(carType!==undefined){
                const vehicleModel = new Vehicle(
                    {
                        licenseNumber: licenseNumber,
                        carDesc: carType.carDesc,
                        carSize: carType.carSize
                    }
                )
                const ticketModel = new Ticket(
                    {
                        id: ticketId,
                        parkingSpotId: closestParkingSpot.id as string,
                        vehicleId: vehicleModel.id,
                        entryTime: new Date().toString()
                    }
                )
                const updateModel = new ParkingSpot(closestParkingSpot.id)
                const conditionAttribute= await updateModel.getData()
                // update parking spot item
                const parkingSpotQuery = new DataQuery(updateModel.getTable(), {status: 'occupied'}, conditionAttribute)
                await parkingSpotQuery.update()
                // add vehicle to database
                const vehicleQuery = new DataQuery(vehicleModel.getTable(), vehicleModel.data)
                await vehicleQuery.insert()
                // add a ticket to database
                const ticketQuery = new DataQuery(ticketModel.getTable(), ticketModel.data)
                await ticketQuery.insert()
                return response.successResponse(200,{closestParkingSpot, ticket:ticketModel.data})

            } else {
                const result = {message: 'No available parking spot'}
                return response.errorResponse(404, result )
            }
           
        } else {
            const result = {message: 'No available parking spot'}
            return response.errorResponse(404, result )
        }
       
    } 
}

export const parkOnleaveCar = async(ticketId: string) =>{
    interface parkStatus {
        parkingStatus: string
        exitTime?: string 
        totalPayment?: number
    }
    const response = new Response()
    
    const ticket = await selectDB(constants.table.Ticket, `id='${ticketId}'`)
    const parkingSpot = await selectDB(constants.table.ParkingSpot,`id='${ticket[0].parkingSpotId}'`)
   

    if(_.isEmpty(ticket)){
        const result = {message: 'parking does not exist'}
        return response.errorResponse(404, result )
    } else if(_.isEmpty(parkingSpot)){
        const result = {message: 'ticket id does not match with parkingSpotId or does not exist'}
        return response.errorResponse(404, result )
    } else if(ticket[0].parkingStatus !== 'onleave' ) {
        const result = {message: 'unable to park a car with status of unparked or parking'}
        return response.errorResponse(409, result )
    } else {
        let status={status: 'occupied'}
        let parkStatus:parkStatus= {parkingStatus: 'parking', exitTime: ''}
    
        const calculatePaymentModel = await calculatePayment(ticketId)
        // gett the total hours consumed while on leave
        const onleaveTotalHours = calculatePaymentModel.getOnleaveTotalHours()
        
        let result = {message: 'succefully parked car'}
        if(onleaveTotalHours > 1 ) {
            const totalPayment = ticket[0].totalPayment as number
            // add additional 40 pesos charge if exceeded 1 hour on leave
            parkStatus= {parkingStatus: 'unparked',  totalPayment: totalPayment+40}
            status={status: 'available'}
            
            result = {message: 'the car exceeded 1 hour on leave, please book a ticket again'}
         
        } 
       
        const parkingSpotModel = new ParkingSpot(parkingSpot[0].id as string)
        const conditionAttrParkingSpot= await parkingSpotModel.getData()
        // update parking spot table
    
        const parkingSpotQuery = new DataQuery(parkingSpotModel.getTable(), status, conditionAttrParkingSpot)
        await parkingSpotQuery.update()
        
        // update ticket
        const ticketModel = new Ticket(ticketId)
        const conditionAttrTicket= await ticketModel.getData()
        const ticketQuery = new DataQuery(ticketModel.getTable(), parkStatus, conditionAttrTicket)
        await ticketQuery.update()
      
  
      return response.successResponse(200,result)
    }
}

