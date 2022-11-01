import {v4 as uuidv4} from 'uuid'
import { values, keys, map} from 'lodash'
// import { insertDB, selectDB, updateDB, updateDB2 } from "../lib/database/database";
import { constants } from '../utils/constants';
import { selectDB } from '../lib/database/database';
interface entry {
    id?: string
    slot?: number
    entryValue?: string, 
  }
export class EntryPoint {
    data: entry = {
        entryValue: ""
      };
    id: string = uuidv4()
    private readonly __TABLE__ = constants.table.EntryPoint


    constructor(
        params: string | entry
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
    public async getData():Promise<object>{
        try {
            const result = await selectDB(this.__TABLE__, `id = '${this.id}'`)
            if (result.length === 0) throw new Error("Not found");
            else {
            const condtionAttribute:object = {id: result[0].id, slot: result[0].slot} 
            
            return condtionAttribute
            }
        } catch (err){
            console.error(err)
            throw new Error("Unable to update");
        }
    }
}