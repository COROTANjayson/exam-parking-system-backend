import {v4 as uuidv4} from 'uuid'
import { values, keys, map} from 'lodash'
// import { insertDB, selectDB, updateDB, updateDB2 } from "../lib/database/database";
import { constants } from '../utils/constants';
import { selectDB } from '../lib/database/database';
interface vehicle {
  id?: string
  licenseNumber?: string
  carDesc: 'S'|'M'|'L'
  carSize: 0|1|2
  
}
interface parkingSpot {
  id?: string
  slot?: number
  status?: "available"|"occupied"|"onhold", 
  slotSize?: 0|1|2,
  slotDesc?: "SP"|"MP"|"LP"
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
export class Ticket {
    data: ticket = {
        parkingSpotId: '',
        vehicleId: '',
        entryTime: '',
        exitTime: '',
        exceedingHours: 0,
        exceedingFee: 0,
        totalHours: 0,
        totalPayment: 0,
        parkingStatus: 'parking'
      };
      parkingSpot: parkingSpot=  {
        slotSize: 0,
        slotDesc: "SP"
      }
      vehicle: vehicle={
        carDesc: 'S',
        carSize: 0
      }
    id: string = uuidv4()
    onleaveTotalHours: number = 0
    private readonly __TABLE__ = constants.table.Ticket


    constructor(
        params: string | ticket,
        parkingSpot: parkingSpot=  {
          slotSize: 0,
          slotDesc: "SP"
        },
        vehicle: vehicle={
          carDesc: 'S',
          carSize: 0
        }

        ) {
            if (typeof params === 'string') {
                this.id = params
              } else {
                if(params.id === undefined){
                  params.id = this.id
                }
                this.data = {...this.data, ...params}
              }
            this.parkingSpot = parkingSpot
            this.vehicle = vehicle
        }
    public getTable(): string{
        return this.__TABLE__
    }
    public async getData():Promise<object>{
        try {
            const result = await selectDB(this.__TABLE__, `id = '${this.id}'`)
            if (result.length === 0) throw new Error("Not found");
            else {
            const condtionAttribute:object = {id: result[0].id, parkingSpotId: result[0].parkingSpotId}
           
            return condtionAttribute
            }
        } catch (err){
            console.error(err)
            throw new Error("Unable to update");
        }
      
    }
    
    public computeTotalHours = () =>{
      const {entryTime, exitTime} = this.data
      const currentDate: any = new Date(exitTime as string)
      const entryTimeDate: any = new Date(entryTime)
      const dateDiffInMillSeconds: number = currentDate -  entryTimeDate
   
      const getConvertedHours = this.convertMsToHM(dateDiffInMillSeconds)
      const totalHours = Math.round(getConvertedHours.hours)
    
     return {totalHours: totalHours, getConvertedHours:getConvertedHours}
    }
   
    public computeExceedingHoursCharge = () => {
      const {slotDesc} = this.parkingSpot
      const hours = this.computeTotalHours()
      const totalHours = hours.totalHours
      let exceedingHours = 0
      let charge = 0
      
      let hourlyCharge = 0
      if (slotDesc === 'SP'){
          hourlyCharge = 20 
      }else if  (slotDesc === 'MP'){
          hourlyCharge = 60 
      } else if  (slotDesc === 'LP'){
          hourlyCharge = 100
      }

      let remainigHours = totalHours

      if(totalHours> 3){
          if(totalHours>= 24){
              let numOfdays = Math.floor(totalHours/24)
              remainigHours -= (numOfdays*24)
              charge+= (numOfdays * 5000) + remainigHours*hourlyCharge

          }
          exceedingHours = totalHours - 3

          if(totalHours> 3 && totalHours<24){
              charge+=hourlyCharge*exceedingHours
          }
      }
      return charge
    }

    public getExceedingHoursCharge=() => {
      this.data.exceedingFee = this.computeExceedingHoursCharge()
    } 
    public getTotalParkFees = () => {
      const hours = this.computeTotalHours()
      const totalHours = hours.totalHours
      let totalFee = 0
      if(totalHours>= 24){
          totalFee =  this.computeExceedingHoursCharge()
      } else {
          totalFee =  40 + this.computeExceedingHoursCharge()
      }
      this.data.totalPayment = totalFee
    }
    public getTotalHours = () => {
      this.data.totalHours = this.computeTotalHours().totalHours
    }
    public getExceedingHours = () => {
      let exceedingHours = 0
      const hours = this.computeTotalHours()
      const totalHours = hours.totalHours
      if(totalHours> 3){
          exceedingHours= totalHours-3
      }
        this.data.exceedingHours = exceedingHours
     
    }
    private padTo2Digits = (num:number) => {
      return num.toString().padStart(2, '0');
    }
    private convertMsToHM = (milliseconds: number)=> {
      let seconds = milliseconds / 1000
      let minutes = seconds / 60
      let hours = minutes / 60
    
      minutes = Math.floor(minutes) % 60;
      return {hours: hours, minutes: minutes}
    }
    public getOnleaveTotalHours = () => {
      const {exitTime} = this.data
      const currentDate: any = new Date()
      const entryTimeDate: any = new Date(exitTime as string)
      const dateDiffInMillSeconds: number = currentDate -  entryTimeDate
    
                             //return a rounded converted hours
      const getConvertedHours = this.convertMsToHM(dateDiffInMillSeconds)
      const totalHours = Math.round(getConvertedHours.hours)
      return getConvertedHours.hours
    }
    



}