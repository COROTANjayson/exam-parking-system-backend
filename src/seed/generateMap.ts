import _ from 'lodash'
import { DataQuery } from "../lib/database/databaseQuery";
import { ParkingSpot } from '../modules/parkingSpot';
import {EntryPoint} from '../modules/entryPoint'


const saveToDb = async() => {
    const parkingMap = generateParkingMap()
    _.forEach(parkingMap, async(value) =>{
        if(value.entryValue !== undefined){
            const entryPointModel = new EntryPoint({
                slot: value.slot,
                entryValue: value.entryValue,
            })
            const dataQuery = new DataQuery(entryPointModel.getTable(), entryPointModel.data)
            await dataQuery.insert()
        } else {
            const parkingSpotModel = new ParkingSpot({
                slot: value.slot,
                status: value.status, 
                slotSize: value.slotSize,
                slotDesc: value.slotDesc
            })
            const dataQuery = new DataQuery(parkingSpotModel.getTable(), parkingSpotModel.data)
            await dataQuery.insert()
            
        }
    })
}

const generateParkingMap =() => {
    const entryPoint = [{entryPoint: 'A',slot:5},{entryPoint: 'B',slot:11}, {entryPoint: 'C',slot:16}]
    interface parkingMap{
        id?: string
        slot?: number
        status?: "available"|"occupied"|"onleave", 
        slotSize?: 0|1|2,
        slotDesc?: "SP"|"MP"|"LP",
        entryValue?: string, 
      }
    const initialMap = new Array(20).fill(0).map( (_, index) => {
        const parkingSpot: parkingMap ={
            status: "available", 
            slot: index+1,
           
        }
        return parkingSpot
        
    })
    let map = initialMap.map((value, index)=> {
        for (const element of entryPoint) {
            if(element.slot === index+1){
                value.entryValue= element.entryPoint
                delete value.status;
            }
          }
          if(!value.entryValue){
            const size = getRandomSize()
            value.slotSize = size.value
            value.slotDesc = size.desc
          }
          
          return value
    })
    console.log(map)
    return map
}

function getRandomSize() {
    const max = 2
    const min = 0
    const descriptors = ['SP', 'MP', 'LP']
    const size = Math.round(Math.random() * (max - min) + min)
    const desc = descriptors[size]
    return  {
        value: size as 0|1|2,
        desc: desc as "SP"|"MP"|"LP"
    }
}


const run = async () => {
    try {
        saveToDb()
        // console.log(generateParkingMap())
   
    } catch (err) {
      console.log("Error", err);
    }
  };

  run();