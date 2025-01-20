import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandInput,
} from "@aws-sdk/client-dynamodb";

import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AppSyncResolverEvent } from "aws-lambda";

const client = new DynamoDBClient({
  region: "us-east-1",
});
const TABLE_NAME = "Todos";

export const handler = async (event: AppSyncResolverEvent<any>) => {
  try {
    const params: ScanCommandInput = {
      TableName: TABLE_NAME,
    };

    const command = new ScanCommand(params);
    const data = await client.send(command);
    const items = data.Items?.map((item) => unmarshall(item));
    return items;
  } catch (error) {
    console.log("Error occurred: ", error);
    throw error;
  }
};
