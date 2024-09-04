const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

const helpers = require("./utils/helpers");
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

module.exports.login = async (event, context, callback) => {
  const data = event.body ? JSON.parse(event.body) : {};

  return docClient
    .get({
      TableName: process.env.TEACHERS_TABLE,
      Key: { email: data.email },
    })
    .promise()
    .then((result) => {
      const userData = result.Item;

      if (userData.password === data.password) {
        // authenticate
        const token = helpers.makeId(12);
        const payload = {
          id: token,
          expiry: Date.now() + 1 * 60 * 60 * 1000, // + 1hr
          createdAt: Date.now(),
        };
        docClient
          .put({
            TableName: process.env.TOKENS_TABLE,
            Item: payload,
          })
          .promise();

        return callback(null, {
          statusCode: 200,
          body: JSON.stringify({
            message: "Login Succeses",
            data: {
              token,
              expiry: payload.expiry,
            },
          }),
        });
      }

      // 401

      return callback(null, {
        statusCode: 401,
        body: JSON.stringify({
          message: "Login failed",
          data: {},
        }),
      });
    })
    .catch((e) => {
      return callback(null, {
        statusCode: 401,
        body: JSON.stringify({
          message: "Login failed",
          data: {},
        }),
      });
    });
};

module.exports.addStudent = async (event, context, callback) => {
  const data = event.body ? JSON.parse(event.body) : {};

  return docClient
    .put({
      TableName: process.env.STUDENTS_TABLE,
      Item: {
        id: data.student_id,
        first_name: data.first_name,
        last_name: data.last_name,
        DOB: data.DOB,
      },
    })
    .promise()
    .then(() => {
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Success",
          data: {
            ...data,
          },
        }),
      });
    })
    .catch(() => {
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          message: "Failed",
          data: {},
        }),
      });
    });
};

module.exports.getStudents = async (event, context, callback) => {
  return docClient
    .scan({
      TableName: process.env.STUDENTS_TABLE,
    })
    .promise()
    .then((result) => {
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Success",
          data: result.Items,
        }),
      });
    })
    .catch(() => {
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          message: "Failed",
          data: {},
        }),
      });
    });
};

module.exports.removeStudent = async (event, context, callback) => {
  const data = event.body ? JSON.parse(event.body) : {};

  return docClient
    .delete({
      TableName: process.env.STUDENTS_TABLE,
      Key: {
        id: data.student_id,
      },
    })
    .promise()
    .then(() => {
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: "Success",
          data: {
            ...data,
          },
        }),
      });
    })
    .catch((error) => {
      console.log(error);
      return callback(null, {
        statusCode: 400,
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
