const AWS = require("aws-sdk");
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");
const helpers = require("./utils/helpers");
const validator = require("./utils/token-validator");

const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AuthenticationDetails = AmazonCognitoIdentity.AuthenticationDetails;
const CognitoUser = AmazonCognitoIdentity.CognitoUser;

AWS.config.update({ region: "us-east-1" });

module.exports.login = async (event, context, callback) => {
  const { data: payload } = event.body ? JSON.parse(event.body) : {};

  const poolData = {
    UserPoolId: "us-east-1_aXGME4ZDy",
    ClientId: "6kn1nj8ml3tajdc06pfj34sm65",
  };
  const userPool = new CognitoUserPool(poolData);

  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: "us-east-1_aXGME4ZDy",
  });

  const authenticationData = {
    Username: payload.email,
    Password: payload.password,
  };
  const authenticationDetails = new AuthenticationDetails(authenticationData);

  const userData = {
    Username: payload.email,
    Pool: userPool,
  };

  const cognitoUser = new CognitoUser(userData);

  try {
    const result = await helpers.cognitoAuthenticate(
      cognitoUser,
      authenticationDetails
    );

    return callback(null, {
      statusCode: 200,
      headers: helpers.defaultHeaders,
      body: JSON.stringify({
        message: "Success",
        data: {
          token: result.getAccessToken().getJwtToken(),
        },
      }),
    });
  } catch (error) {
    console.log(error);
    return callback(null, {
      statusCode: 400,
      headers: helpers.defaultHeaders,
      body: JSON.stringify({
        message: "Failed",
        data: {},
      }),
    });
  }
};

module.exports.addStudent = async (event, context, callback) => {
  const isTokenValid = await validator.tokenValidator(
    event.headers.Authorization
  );

  if (!isTokenValid) {
    return callback(null, {
      statusCode: 400,
      headers: helpers.defaultHeaders,
      body: JSON.stringify({
        message: "Failed, Token Invalid",
        data: {},
      }),
    });
  }

  const { data: payload } = event.body ? JSON.parse(event.body) : {};

  return docClient
    .put({
      TableName: process.env.STUDENTS_TABLE,
      Item: {
        id: payload.student_id,
        first_name: payload.first_name,
        last_name: payload.last_name,
        DOB: payload.DOB,
      },
    })
    .promise()
    .then(() => {
      return callback(null, {
        statusCode: 200,
        headers: helpers.defaultHeaders,
        body: JSON.stringify({
          message: "Success",
          data: {
            ...payload,
          },
        }),
      });
    })
    .catch((error) => {
      console.log(error);
      return callback(null, {
        statusCode: 400,
        headers: helpers.defaultHeaders,
        body: JSON.stringify({
          message: "Failed",
          data: {},
        }),
      });
    });
};

module.exports.getStudents = async (event, context, callback) => {
  const isTokenValid = await validator.tokenValidator(
    event.headers.Authorization
  );

  if (!isTokenValid) {
    return callback(null, {
      statusCode: 400,
      headers: helpers.defaultHeaders,
      body: JSON.stringify({
        message: "Failed",
        data: {},
      }),
    });
  }

  return docClient
    .scan({
      TableName: process.env.STUDENTS_TABLE,
    })
    .promise()
    .then((result) => {
      return callback(null, {
        statusCode: 200,
        headers: helpers.defaultHeaders,
        body: JSON.stringify({
          message: "Success",
          data: result.Items,
        }),
      });
    })
    .catch(() => {
      return callback(null, {
        statusCode: 400,
        headers: helpers.defaultHeaders,
        body: JSON.stringify({
          message: "Failed",
          data: {},
        }),
      });
    });
};

module.exports.removeStudent = async (event, context, callback) => {
  console.log(event.body);
  const isTokenValid = await validator.tokenValidator(
    event.headers.Authorization
  );

  if (!isTokenValid) {
    return callback(null, {
      statusCode: 400,
      headers: helpers.defaultHeaders,
      body: JSON.stringify({
        message: "Failed",
        data: {},
      }),
    });
  }

  const { data: payload } = event.body ? JSON.parse(event.body) : {};

  return docClient
    .delete({
      TableName: process.env.STUDENTS_TABLE,
      Key: {
        id: payload.student_id,
      },
    })
    .promise()
    .then(() => {
      return callback(null, {
        statusCode: 200,
        headers: helpers.defaultHeaders,
        body: JSON.stringify({
          message: "Success",
          data: {
            ...payload,
          },
        }),
      });
    })
    .catch((error) => {
      console.log(error);
      return callback(null, {
        statusCode: 400,
        headers: helpers.defaultHeaders,
        body: JSON.stringify({
          message: "Failed",
          data: {},
        }),
      });
    });
};

module.exports.create = async (event, context, callback) => {
  const params = {
    TableName: process.env.TEACHERS_TABLE,
    Item: {
      email: "japeth@gmail.com",
      password: "Password4$",
      createdAt: Date.now(),
    },
  };

  docClient.put(params, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      message: "Success",
      data: {},
    }),
  });
};
