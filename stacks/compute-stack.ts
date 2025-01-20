import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

interface ComputeStackProps extends cdk.StackProps {
  usersTable: Table;
  todosTable: Table;
}

export class ComputeStack extends cdk.Stack {
  public readonly addUserToTableFunc: NodejsFunction;

  // appsync resolvers
  public readonly createTodoFunc: NodejsFunction;
  public readonly listTodoFunc: NodejsFunction;
  public readonly deleteTodoFunc: NodejsFunction;
  public readonly updateTodoFunc: NodejsFunction;
  public readonly listAllTodoFunc: NodejsFunction;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);
    this.addUserToTableFunc = this.addUserToUsersTable(props);
    this.createTodoFunc = this.createTodoFunction(props);
    this.listTodoFunc = this.listTodoFunction(props);
    this.deleteTodoFunc = this.deleteTodoFunction(props);
    this.updateTodoFunc = this.updateTodoFunction(props);
    this.listAllTodoFunc = this.listAllTodoFunction(props);
  }

  addUserToUsersTable(props: ComputeStackProps) {
    const func = new NodejsFunction(this, "addUserFunc", {
      functionName: "addUserFunc",
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(
        __dirname,
        "../functions/AddUserPostConfirmation/index.ts"
      ),
    });
    func.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:PutItem"],
        resources: [props.usersTable.tableArn as string],
      })
    );
    return func;
  }

  createTodoFunction(props: ComputeStackProps) {
    const func = new NodejsFunction(this, "createTodoFunc", {
      functionName: "createTodoFunc",
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(__dirname, "../AppsyncFunctions/createTodo/index.ts"),
    });
    // this adds permission for lambda to access that resource
    func.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:PutItem"],
        resources: [props.todosTable.tableArn as string],
      })
    );
    return func;
  }

  listTodoFunction(props: ComputeStackProps) {
    const func = new NodejsFunction(this, "listTodoFunc", {
      functionName: "listTodoFunc",
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(__dirname, "../AppsyncFunctions/listTodo/index.ts"),
    });
    // this adds permission for lambda to access that resource
    func.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:Query"],
        resources: [props.todosTable.tableArn as string],
      })
    );
    return func;
  }

  listAllTodoFunction(props: ComputeStackProps) {
    const func = new NodejsFunction(this, "listAllTodoFunc", {
      functionName: "listAllTodoFunc",
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(__dirname, "../AppsyncFunctions/listAllTodo/index.ts"),
    });
    // this adds permission for lambda to access that resource
    func.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:Scan"],
        resources: [props.todosTable.tableArn as string],
      })
    );
    return func;
  }

  deleteTodoFunction(props: ComputeStackProps) {
    const func = new NodejsFunction(this, "deleteTodoFunc", {
      functionName: "deleteTodoFunc",
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(__dirname, "../AppsyncFunctions/deleteTodo/index.ts"),
    });
    // this adds permission for lambda to access that resource
    func.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:Query", "dynamodb:DeleteItem"],
        resources: [
          props.todosTable.tableArn as string,
          props.todosTable.tableArn + "/index/getTodoId",
        ],
      })
    );
    return func;
  }

  updateTodoFunction(props: ComputeStackProps) {
    const func = new NodejsFunction(this, "updateTodoFunc", {
      functionName: "updateTodoFunc",
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: path.join(__dirname, "../AppsyncFunctions/updateTodo/index.ts"),
    });
    // this adds permission for lambda to access that resource
    func.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:Query", "dynamodb:UpdateItem"],
        resources: [
          props.todosTable.tableArn as string,
          props.todosTable.tableArn + "/index/getTodoId",
        ],
      })
    );
    return func;
  }
}
