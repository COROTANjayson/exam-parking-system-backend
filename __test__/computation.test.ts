// import _ from 'lodash'
import { Ticket } from '../src/modules/ticket'
const ticket1 = {
    id: '1',
    parkingSpotId: '1',
    vehicleId: '1',
    entryTime: 'Sat Oct 29 2022 13:00:00 GMT+0800 (Philippine Standard Time)',
    exitTime: 'Sat Oct 29 2022 22:00:00 GMT+0800 (Philippine Standard Time)',
}
const ticket2 = {
    id: '2',
    parkingSpotId: '2',
    vehicleId: '2',
    entryTime: 'Sat Oct 29 2022 4:00:00 GMT+0800 (Philippine Standard Time)',
    exitTime: 'Sat Oct 29 2022 7:00:00 GMT+0800 (Philippine Standard Time)',
}
const ticket3 = {
    id: '2',
    parkingSpotId: '2',
    vehicleId: '2',
    entryTime: 'Sat Oct 29 2022 4:00:00 GMT+0800 (Philippine Standard Time)',
    exitTime: 'Sat Oct 30 2022 4:00:00 GMT+0800 (Philippine Standard Time)',
}

const ticket4 = {
    id: '2',
    parkingSpotId: '2',
    vehicleId: '2',
    entryTime: 'Sat Oct 29 2022 4:00:00 GMT+0800 (Philippine Standard Time)',
    exitTime: 'Sat Oct 30 2022 11:00:00 GMT+0800 (Philippine Standard Time)',
}
const slot = { 
    slotSize: 0 as 0|1|2,
    slotDesc: "SP" as "SP" | "MP" | "LP"
}
const carSize = {
    carDesc: 'S' as "S" | "M" | "L", 
    carSize: 0 as 0|1|2
}
describe('parking test functions',()=>{
    test('calculate total payment with less than 3 hours consumed for parking', () =>{
        const ticketModel2 = new Ticket(
            ticket2,
            slot,
            carSize
            
        )
        ticketModel2.getExceedingHours()
        ticketModel2.getTotalParkFees()
        ticketModel2.getTotalHours()
        ticketModel2.getExceedingHoursCharge()
        const data = ticketModel2.data

        
        expect(data.exceedingHours).toBe(0)
        expect(data.exceedingFee).toBe(0)
        expect(data.totalHours).toBe(3)
        expect(data.totalPayment).toBe(40)
        expect(data.parkingStatus).toBe('parking')


    })  

    test('calculate total payment with greater than 3 hours consumed for parking', () =>{
        const ticketModel1 = new Ticket(
            ticket1,
            slot,
            carSize
            
        )
    
        ticketModel1.getExceedingHours()
        ticketModel1.getTotalParkFees()
        ticketModel1.getTotalHours()
        ticketModel1.getExceedingHoursCharge()
        const data = ticketModel1.data


        expect(data.exceedingHours).toBe(6)
        expect(data.exceedingFee).toBe(120)
        expect(data.totalHours).toBe(9)
        expect(data.totalPayment).toBe(160)
        expect(data.parkingStatus).toBe('parking')


    }) 

    test('calculate total payment with 24 hours consumed for parking', () =>{
        const ticketModel2 = new Ticket(
            ticket3,
            slot,
            carSize
            
        )
        ticketModel2.getExceedingHours()
        ticketModel2.getTotalParkFees()
        ticketModel2.getTotalHours()
        ticketModel2.getExceedingHoursCharge()
        const data = ticketModel2.data

        
        expect(data.exceedingHours).toBe(21)
        expect(data.exceedingFee).toBe(5000)
        expect(data.totalHours).toBe(24)
        expect(data.totalPayment).toBe(5000)
        expect(data.parkingStatus).toBe('parking')


    })  

    test('calculate total payment more than 24 hours consumed for parking', () =>{
        const ticketModel2 = new Ticket(
            ticket4,
            slot,
            carSize
            
        )
        ticketModel2.getExceedingHours()
        ticketModel2.getTotalParkFees()
        ticketModel2.getTotalHours()
        ticketModel2.getExceedingHoursCharge()
        const data = ticketModel2.data

        
        expect(data.exceedingHours).toBe(28)
        expect(data.exceedingFee).toBe(5140)
        expect(data.totalHours).toBe(31)
        expect(data.totalPayment).toBe(5140)
        expect(data.parkingStatus).toBe('parking')


    }) 
}) 