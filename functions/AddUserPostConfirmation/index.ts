import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
// aws lambda trigger event after user signs up
import { PostConfirmationConfirmSignUpTriggerEvent } from "aws-lambda";
import { marshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-1",
});

exports.handler = async function (
  event: PostConfirmationConfirmSignUpTriggerEvent
): Promise<PostConfirmationConfirmSignUpTriggerEvent> {
  console.log(event, "event");
  const date = new Date();
  const isoDate = date.toISOString();
  const params = {
    TableName: "Users",
    Item: marshall({
      UserID: event.request.userAttributes.sub,
      Email: event.request.userAttributes.email,
      Name: event.request.userAttributes.name,
      CreateAt: isoDate,
      __typename: "User",
    }),
  };
  try {
    await client.send(new PutItemCommand(params));
  } catch (error) {
    console.log(error);
  }
  return event;
};
