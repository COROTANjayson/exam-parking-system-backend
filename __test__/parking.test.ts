// import _ from 'lodash'
import { Ticket } from '../src/modules/ticket'
import {addNewEntryPointService, RemoveEntryPointService} from '../src/services/entryPoint'
import {allocateSpotService, parkOnleaveCar} from '../src/services/allocateSpot'
import {calculatePayment} from '../src/services/calculatePayment'
import {deleteTicket, unParkService} from '../src/services/unpark'
import { selectDB } from '../src/lib/database/database';
import { constants } from '../src/utils/constants';


const ticketId = 'ticket'
const parkingSpotId = '67abcd04-3b3d-42ed-9191-8518fd6747c1'
const request = {
    carSize: 0 as 0|1|2, 
    licenseNumber: 'LO90J', 
    entryValue: 'A', 
    ticketId:ticketId
}
describe('parking test functions',()=>{
    test('parking', async() =>{
        const res = await allocateSpotService(request)
        expect(res.code).toBe(200)

    })   

    test('calculatepayment', async() =>{
        const res = await calculatePayment(ticketId)
        
        const {data} = res
        expect(data.exceedingHours).toBe(0)
        expect(data.exceedingFee).toBe(0)
        expect(data.totalHours).toBe(0)
        expect(data.totalPayment).toBeGreaterThanOrEqual(40)
        expect(data.parkingStatus).toBe('parking')

    }) 
    test('set parking on leave', async() =>{
        const request = {
            ticketId: ticketId,
            parkingSpotId: parkingSpotId,
            parkingStatus: "onleave"
        }

        const res = await unParkService(request)
        const ticket = await selectDB(constants.table.Ticket, `id='${ticketId}'`)
  
        expect(res.code).toBe(200)
        expect(ticket[0].parkingStatus).toBe('onleave')
        
    }) 

    test('set parking on leave', async() =>{
        const request = {
            ticketId: ticketId,
            parkingSpotId: parkingSpotId,
            parkingStatus: "onleave"
        }

        const res = await unParkService(request)
        const ticket = await selectDB(constants.table.Ticket, `id='${ticketId}'`)
        const parkingSpot = await selectDB(constants.table.ParkingSpot, `id='${parkingSpotId}'`)
        
   
        expect(res.code).toBe(200)
        expect(ticket[0].parkingStatus).toBe('onleave')
        expect(parkingSpot[0].status).toBe('onleave')
        // expect(ticket[0].exitTime).toBe('onleave')
        
    }) 

    test('park on leave cars', async() =>{
        const res = await parkOnleaveCar(ticketId)
        const ticket = await selectDB(constants.table.Ticket, `id='${ticketId}'`)
        const parkingSpot = await selectDB(constants.table.ParkingSpot, `id='${parkingSpotId}'`)

  
        expect(res.code).toBe(200)
        expect(ticket[0].parkingStatus).toBe('parking')
        expect(parkingSpot[0].status).toBe('occupied')

    }) 

    test('unpark a car', async() =>{
        const request = {
            ticketId: ticketId,
            parkingSpotId: parkingSpotId,
            parkingStatus: "unparked"
        }

        const res = await unParkService(request)
        const ticket = await selectDB(constants.table.Ticket, `id='${ticketId}'`)
        const parkingSpot = await selectDB(constants.table.ParkingSpot, `id='${parkingSpotId}'`)
     
        expect(res.code).toBe(200)
        expect(ticket[0].parkingStatus).toBe('unparked')
        expect(parkingSpot[0].status).toBe('available')
    }) 

    test('delete ticket', async() =>{
        
        const res = await deleteTicket(ticketId)
        expect(res.code).toBe(200)

    })   
})  

interface entryPoint{
    entryValue: string,
    slot: number,
    id: string
  }
  const slot = 20
describe('add entry point functions',()=>{
    test('add new entry point', async() =>{
        const res = await addNewEntryPointService(slot)
        const parkingSpot = await selectDB(constants.table.ParkingSpot, `slot=${slot}`)

        const  result= res.result as entryPoint
        expect(res.code).toBe(200)
        expect(result.entryValue).toBe('D')
        expect(result.slot).toBe(20)
        expect(parkingSpot[0].status).toBe('entrypoint')


    })   
    test('remove entry point', async() =>{
        const res = await RemoveEntryPointService(slot)
        const parkingSpot = await selectDB(constants.table.ParkingSpot, `slot=${slot}`)

        const  result= res.result as entryPoint
        expect(res.code).toBe(200)
        expect(parkingSpot[0].status).toBe('available')
    })  

})
