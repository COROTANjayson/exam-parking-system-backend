import _ from 'lodash'
import { DataQuery } from "../lib/database/databaseQuery";
import { selectDB } from '../lib/database/database';
import { constants } from '../utils/constants';
import { Response } from "../response/response";
import {ParkingSpot} from '../modules/parkingSpot'
import {EntryPoint} from '../modules/entryPoint'

export const addNewEntryPointService = async(slot: number) =>{
    interface parkStatus {
        parkingStatus: string
        exitTime?: string 
        totalPayment?: number
    }
    const response = new Response()
    const alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    
    const checkAvailableParkingSpot = await selectDB(constants.table.ParkingSpot, `status='onleave' OR status='occupied'`)
    const parkingSpot = await selectDB(constants.table.ParkingSpot, `slot=${slot}`)
    const entryPoint = await selectDB(constants.table.EntryPoint)
    
    if(!_.isEmpty(checkAvailableParkingSpot)){
        const result = {message: 'cannot add new entry point if their are occupied slots'}
        return response.errorResponse(409, result )
    } else if(_.isEmpty(parkingSpot)){
        const result = {message: 'slot number does not exist'}
        return response.errorResponse(404, result )
    }else {
        const letter = _.find(alphabet, (value)=>{
            const alpExist = _.find(entryPoint, {entryValue: value})
            if(!alpExist){
                return value
            }
        })
        let status={status: 'entrypoint'}
        
       
        const parkingSpotModel = new ParkingSpot(parkingSpot[0].id as string)
        const conditionAttrParkingSpot= await parkingSpotModel.getData()
        // update parking spot table
        const parkingSpotQuery = new DataQuery(parkingSpotModel.getTable(), status, conditionAttrParkingSpot)
        await parkingSpotQuery.update()
        
        // add new entry point
        const entryPointModel = new EntryPoint({
            slot: parkingSpot[0].slot as number,
            entryValue: letter as string,
        })
        const dataQuery = new DataQuery(entryPointModel.getTable(), entryPointModel.data)
        await dataQuery.insert()
        return response.successResponse(200,entryPointModel.data)
    }   
        
}

export const RemoveEntryPointService = async(slot: number) =>{
    interface parkStatus {
        parkingStatus: string
        exitTime?: string 
        totalPayment?: number
    }
    const response = new Response()
   
    const checkAvailableParkingSpot = await selectDB(constants.table.ParkingSpot, `status='onleave' OR status='occupied'`)
    const parkingSpot = await selectDB(constants.table.ParkingSpot, `slot=${slot}`)
    const entryPoint = await selectDB(constants.table.EntryPoint, `slot=${slot}`)
  
    if(!_.isEmpty(checkAvailableParkingSpot)){
        const result = {message: 'cannot remove entry point if their are occupied slots'}
        return response.errorResponse(409, result )
    } else if(_.isEmpty(parkingSpot)){
        const result = {message: 'slot number does not exist or a defualt is a default entry pont'}
        return response.errorResponse(404, result )
    } else if(_.isEmpty(entryPoint)){
        const result = {message: 'entry point does not exist'}
        return response.errorResponse(404, result )
    } else {
       
        let status={status: 'available'}
        
       
        const parkingSpotModel = new ParkingSpot(parkingSpot[0].id as string)
        const conditionAttrParkingSpot= await parkingSpotModel.getData()
        
        // update parking spot status to available
        const parkingSpotQuery = new DataQuery(parkingSpotModel.getTable(), status, conditionAttrParkingSpot)
        await parkingSpotQuery.update()
      

        const entryPointModel = new EntryPoint(entryPoint[0].id as string)
        const conditionAttrEntrPoint = await entryPointModel.getData()
        // remove entrypoint from table
        const dataQuery = new DataQuery(entryPointModel.getTable(),entryPointModel.data ,conditionAttrEntrPoint)
        await dataQuery.delete()
        
        const result = {message: 'succefully remove entry point'}
 
        return response.successResponse(200,result)
    
    }   
}

