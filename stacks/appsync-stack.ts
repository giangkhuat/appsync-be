import * as cdk from "aws-cdk-lib";
import * as awsAppsync from "aws-cdk-lib/aws-appsync";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

interface AppsyncStackProps extends cdk.StackProps {
  userPool: UserPool;
  createTodoFunc: NodejsFunction;
  listTodoFunc: NodejsFunction;
  deleteTodoFunc: NodejsFunction;
  updateTodoFunc: NodejsFunction;
  listAllTodoFunc: NodejsFunction;
}

export class AppsyncStack extends cdk.Stack {
  public readonly api: awsAppsync.GraphqlApi;
  constructor(scope: Construct, id: string, props: AppsyncStackProps) {
    super(scope, id, props);
    this.api = this.createAppsyncApi(props);
    this.createTodoResolver(scope, props, this.api);
    this.listTodoResolver(scope, props, this.api);
    this.deleteTodoResolver(scope, props, this.api);
    this.updateTodoResolver(scope, props, this.api);
    this.listAllTodoResolver(scope, props, this.api);
  }

  createAppsyncApi(props: AppsyncStackProps) {
    const api = new awsAppsync.GraphqlApi(this, "TodoAppsyncApi", {
      name: "TodoAppsyncApi",
      schema: awsAppsync.SchemaFile.fromAsset(
        path.join(__dirname, "../graphql/schema.graphql")
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: awsAppsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: props.userPool,
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: awsAppsync.AuthorizationType.API_KEY,
          },
        ],
      },
      logConfig: {
        fieldLogLevel: awsAppsync.FieldLogLevel.ALL,
      },
    });
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    });
    return api;
  }

  createTodoResolver(
    scope: Construct,
    props: AppsyncStackProps,
    api: awsAppsync.GraphqlApi
  ) {
    const createToDoResolve = api
      .addLambdaDataSource("CreateTodoDataSource", props.createTodoFunc)
      .createResolver("CreateTodoMutation", {
        typeName: "Mutation",
        fieldName: "createTodo",
      });
  }

  listTodoResolver(
    scope: Construct,
    props: AppsyncStackProps,
    api: awsAppsync.GraphqlApi
  ) {
    const listToDoResolve = api
      .addLambdaDataSource("ListTodoDataSource", props.listTodoFunc)
      .createResolver("ListTodoMutation", {
        typeName: "Query",
        fieldName: "listTodos",
      });
  }

  listAllTodoResolver(
    scope: Construct,
    props: AppsyncStackProps,
    api: awsAppsync.GraphqlApi
  ) {
    const listAllToDoResolve = api
      .addLambdaDataSource("ListAllTodoDataSource", props.listAllTodoFunc)
      .createResolver("ListAllTodoMutation", {
        typeName: "Query",
        fieldName: "listAllTodos",
      });
  }

  deleteTodoResolver(
    scope: Construct,
    props: AppsyncStackProps,
    api: awsAppsync.GraphqlApi
  ) {
    const deleteToDoResolve = api
      .addLambdaDataSource("DeleteTodoDataSource", props.deleteTodoFunc)
      .createResolver("DeleteTodoMutation", {
        typeName: "Mutation",
        fieldName: "deleteTodo",
      });
  }

  updateTodoResolver(
    scope: Construct,
    props: AppsyncStackProps,
    api: awsAppsync.GraphqlApi
  ) {
    const updateToDoResolve = api
      .addLambdaDataSource("UpdateTodoDataSource", props.updateTodoFunc)
      .createResolver("UpdateTodoMutation", {
        typeName: "Mutation",
        fieldName: "updateTodo",
      });
  }
}
