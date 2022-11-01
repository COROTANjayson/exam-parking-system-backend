import  {DynamoDBClient} from "@aws-sdk/client-dynamodb"

const REGION = "ap-southeast-1";

const client = new DynamoDBClient({region: REGION, endpoint: 'http://localhost:8000'});

export {client}