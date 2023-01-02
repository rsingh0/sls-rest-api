"use strict";
const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({
  region: "us-east-2",
  maxRetries: 3,
  httpOptions: {
    timeout: 5000,
  },
});
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME; // From !Ref notesTable

const send = (statusCode, data) => ({
  statusCode: statusCode,
  body: JSON.stringify(data),
});

module.exports.createNote = async (event, context, callBack) => {
  context.callbackWaitsForEmptyEventLoop = false; // callback function will not wait events processing in event loop already
  const data = JSON.parse(event.body);
  try {
    const param = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body,
      },
      ConditionExpression: "attribute_not_exists(notesId)", // verifies if id is not already available in Table.
    };
    await documentClient.put(param).promise();
    callBack(null, send(201, data));
  } catch (err) {
    callBack(null, send(500, err.message));
  }
};

module.exports.updateNote = async (event, context, callBack) => {
  context.callbackWaitsForEmptyEventLoop = false; // callback function will not wait events processing in event loop already
  const notesId = event.pathParameters.id;
  const data = JSON.parse(event.body);
  try {
    const param = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      UpdateExpression: "set #title = :title, #body = :body",
      ExpressionAttributeNames: {
        "#title": "title",
        "#body": "body",
      },
      ExpressionAttributeValues: {
        ":title": data.title,
        ":body": data.body,
      },
      ConditionExpression: "attribute_exists(notesId)", // verifies if id should already be available in Table.
    };

    await documentClient.update(param).promise();
    callBack(null, send(200, data));
  } catch (err) {
    callBack(null, send(500, err.message));
  }
};

module.exports.deleteNote = async (event, context, callBack) => {
  context.callbackWaitsForEmptyEventLoop = false; // callback function will not wait events processing in event loop already
  const notesId = event.pathParameters.id;
  try {
    const param = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      ConditionExpression: "attribute_exists(notesId)", // verifies if id should already be available in Table.
    };

    await documentClient.delete(param).promise();
    callBack(null, send(200, notesId));
  } catch (err) {
    callBack(null, send(500, err.message));
  }
};

module.exports.getAllNotes = async (event, context, callBack) => {
  context.callbackWaitsForEmptyEventLoop = false; // callback function will not wait events processing in event loop already
  console.log(JSON.stringify(event));
  try {
    const param = {
      TableName: NOTES_TABLE_NAME,
    };

    const notes = await documentClient.scan(param).promise();
    callBack(null, send(200, notes));
  } catch (err) {
    callBack(null, send(500, err.message));
  }
};
