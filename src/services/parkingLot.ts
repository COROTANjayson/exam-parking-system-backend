import _ from 'lodash'
import { DataQuery } from "../lib/database/databaseQuery";
import { selectDB } from '../lib/database/database';
import { constants } from '../utils/constants';
import { Response } from "../response/response";


export const generateParkingMap = async(query: {status: string}) =>{
    const response = new Response()
    const parkingSpots = await selectDB(constants.table.ParkingSpot)
    const parkingSpotsFilter = _.filter(parkingSpots, value => value.status != 'entrypoint')
    const entryPoints = await selectDB(constants.table.EntryPoint)
    const tickets = await selectDB(constants.table.Ticket, `parkingStatus='parking' OR parkingStatus='onleave'`)

    const parkingLot = _.orderBy([...parkingSpotsFilter, ...entryPoints],['slot'], ['asc'])
    const filterParkingSlot = _.filter(parkingLot, {...query})
    const parkingMap = _.map(filterParkingSlot, (value) => {
        const parking=  _.find(tickets, {parkingStatus: 'parking', parkingSpotId: value.id})
        const onleave=  _.find(tickets, {parkingStatus: 'onleave', parkingSpotId: value.id})
        if(parking !== undefined){
            value.ticketId = parking.id 
        }
        if(onleave !== undefined){
            value.ticketId = onleave.id 
        }
        return value
    })
    return response.successResponse(200,parkingMap )
    
}

export const queryEntryPoint = async() =>{
    const response = new Response()
    const entryPoints = await selectDB(constants.table.EntryPoint)

    return response.successResponse(200,entryPoints )
    
}