import {v4 as uuidv4} from 'uuid'
import { values, keys, map} from 'lodash'

import { constants } from '../utils/constants';
interface vehicle {
    id?: string
    licenseNumber: string
    carDesc: 'S'|'M'|'L'
    carSize: 0|1|2
    
  }
export class Vehicle {
    data: vehicle = {
        licenseNumber: '',
        carDesc: 'S',
        carSize: 0
      };
    id: string = uuidv4()
    private readonly __TABLE__ = constants.table.Vehicle


    constructor(
        params: string | vehicle
        ) {
            if (typeof params === 'string') {
                this.id = params
              } else {
                if(params.id === undefined){
                  params.id = this.id
                }
                this.data = {...this.data, ...params}
              }
        }
    public getTable(): string{
        return this.__TABLE__
    }
}