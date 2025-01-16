#!/opt/homebrew/opt/node/bin/node
import * as cdk from "aws-cdk-lib";
import { DatabaseStack } from "../stacks/database-stack";
import { ComputeStack } from "../stacks/compute-stack";
import { AuthStack } from "../stacks/auth-stack";
import { AppsyncStack } from "../stacks/appsync-stack";

const app = new cdk.App();
const databaseStack = new DatabaseStack(app, "DatabaseStack");
const computeStack = new ComputeStack(app, "ComputeStack", {
  usersTable: databaseStack.usersTable,
  todosTable: databaseStack.todosTable,
});

const authStack = new AuthStack(app, "AuthStack", {
  addUserPostConfimration: computeStack.addUserToTableFunc,
});

const appsyncStack = new AppsyncStack(app, "Appsyncstack", {
  userPool: authStack.todoUserPool,
  createTodoFunc: computeStack.createTodoFunc,
  listTodoFunc: computeStack.listTodoFunc
});
