const {CognitoJwtVerifier} = require("aws-jwt-verify")
const COGNITO_USERPOOL_ID = process.env.COGNITO_USERPOOL_ID
const COGNITO_WEB_CLIENT_ID = process.env.COGNITO_WEB_CLIENT_ID

const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: COGNITO_USERPOOL_ID, //'us-east-2_Y8bbwrF4O',
    tokenUse: 'id',
    clientId: COGNITO_WEB_CLIENT_ID //'us-east-2_Y8bbwrF4O'
})

const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};

  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: effect,
          Resource: resource,
          Action: "execute-api:Invoke",
        },
      ],
    };
    authResponse.policyDocument = policyDocument;
  }
  authResponse.context = {
    foo: "bar",
  };
  console.log(JSON.stringify(authResponse));
  return authResponse;
};

exports.handler = async (event, context, callback) => {
  // Get auth token from header
  // const token = event.authorizationToken; // accepted value - "allow" or "deny"
  //   switch (token) {
  //     case "allow":
  //       callback(null, generatePolicy("userEmail", "Allow", event.methodArn));
  //       break;
  //     case "deny":
  //       callback(null, generatePolicy("userEmail", "Deny", event.methodArn));
  //       break;
  //     default:
  //       callback("Error: Invalid token");
  //   }

  const token = event.authorizationToken;
  console.log(token);

  // Validate token
  try {
    const payload = await jwtVerifier.verify(token);
    console.log(JSON.stringify(payload));
    callback(null, generatePolicy("user", "Allow", event.methodArn));
  } catch (err) {
    callback("Error: Invalid token");
  }
};
