import _ from 'lodash'
import { DataQuery } from "../lib/database/databaseQuery";
import { selectDB } from '../lib/database/database';
import { constants } from '../utils/constants';
import { Response } from "../response/response";
import {Ticket} from '../modules/ticket';
import {ParkingSpot} from '../modules/parkingSpot'
import {calculatePayment} from './calculatePayment'
interface ticket {
    exitTime?: string
    exceedingHours?: number,
    exceedingFee?: number,
    totalHours?: number,
    totalPayment?: number,
    parkingStatus?: 'unparked'| 'onleave' | 'parking'
  }
export const unParkService = async(requestData:{parkingSpotId: string, ticketId: string, parkingStatus: string}) =>{
    const response = new Response()
    const {parkingSpotId, ticketId, parkingStatus} = requestData
    const parkingSpot = await selectDB(constants.table.ParkingSpot,`id='${parkingSpotId}'`)
    const ticket = await selectDB(constants.table.Ticket, `id='${ticketId}' AND parkingSpotId='${parkingSpotId}'`)

    if(_.isEmpty(parkingSpot)){
        const result = {message: 'parking does not exist'}
        return response.errorResponse(404, result )
    } else if(_.isEmpty(ticket)){
        const result = {message: 'ticket id does not match with parkingSpotId or does exist'}
        return response.errorResponse(404, result )
    } else if(parkingStatus !== 'onleave' && parkingStatus !== 'unparked') {
        const result = {message: 'parking status not define as either onleave or unparked'}
        return response.errorResponse(400, result )
    } else {
      let status={status: 'available'}
      let parkStatus: "unparked" | "onleave" | "parking" = 'unparked'
      if(parkingStatus === 'onleave'){
        status={status: 'onleave'}
        parkStatus = parkingStatus
      }
      
      
      const parkingSpotModel = new ParkingSpot(parkingSpotId)
      const conditionAttrParkingSpot= await parkingSpotModel.getData()
      
      // update parking spot status to either available or onleave
      const parkingSpotQuery = new DataQuery(parkingSpotModel.getTable(), status, conditionAttrParkingSpot)
      await parkingSpotQuery.update()
      
      // calculate payments and update the ticket
      const ticket= await calculatePayment(ticketId)
      
      const ticketData: ticket ={
          exitTime: ticket.data.exitTime,
          exceedingHours: ticket.data.exceedingHours,
          exceedingFee: ticket.data.exceedingFee,
          totalHours: ticket.data.totalHours,
          totalPayment: ticket.data.totalPayment,
          parkingStatus:  parkStatus 
        }
      const ticketModel = new Ticket(ticketId)
      const conditionAttrTicket= await ticketModel.getData()
      const ticketQuery = new DataQuery(ticketModel.getTable(), ticketData, conditionAttrTicket)
      await ticketQuery.update()
      return response.successResponse(200,{message:'succefully unparked car'})

            }
}

export const unParkOnleaveService= async() =>{
  const response = new Response()
  const ticket = await selectDB(constants.table.Ticket, `parkingStatus='onleave'`)
  
  // unpark all cars exceeding 1 hour while on leave
  const result = _.filter(ticket, async(value) => {
    const calculatePaymentModel = await calculatePayment(value.id as string)
    const onleaveTotalHours = calculatePaymentModel.getOnleaveTotalHours()
    if(onleaveTotalHours > 1 ) {
      
      const totalPayment = ticket[0].totalPayment as number
      // add additional 40 pesos charge if exceeded 1 hour on leave
      const parkStatus= {parkingStatus: 'unparked',  totalPayment: totalPayment+40}
      const status={status: 'available'}

      const parkingSpotModel = new ParkingSpot(value.parkingSpotId as string)
      const conditionAttrParkingSpot= await parkingSpotModel.getData()
        
      // update parking spot status to available
      const parkingSpotQuery = new DataQuery(parkingSpotModel.getTable(), status, conditionAttrParkingSpot)
      await parkingSpotQuery.update()
      
      // update ticket status to unparked
      const ticketModel = new Ticket(value.id as string)
      const conditionAttrTicket= await ticketModel.getData()
      const ticketQuery = new DataQuery(ticketModel.getTable(), parkStatus, conditionAttrTicket)
      await ticketQuery.update()
        
       
      return value
  } 
  })
  const message = {message: 'unpark all cars exceeded 1 hour on leave'}

  return response.successResponse(200, message)

}

export const deleteTicket = async(ticketId:string) => {
  const response = new Response()

  const ticket = await selectDB(constants.table.Ticket, `id='${ticketId}'`)
  if(!_.isEmpty(ticket)){
      const ticketModel = new Ticket(ticketId)
      const conditionalAttribute= await ticketModel.getData()
      const dataQuery = new DataQuery(ticketModel.getTable(), ticketModel.data, conditionalAttribute)
      await dataQuery.delete()
      const result = {message: 'Successfully deleted Ticket'}
      return response.successResponse(200,result )
  } else {
      const result = {message: 'Eployer Id does not Exist'}
      return response.errorResponse(404, result )
  }
}