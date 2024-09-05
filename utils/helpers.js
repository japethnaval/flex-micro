module.exports.cognitoAuthenticate = async (
  cognitoUser,
  cognitoAuthenticationDetails
) => {
  return new Promise(function (resolve, reject) {
    cognitoUser.authenticateUser(cognitoAuthenticationDetails, {
      onSuccess: resolve,
      onFailure: reject,
      newPasswordRequired: resolve,
    });
  });
};

module.exports.defaultHeaders = {
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
};
