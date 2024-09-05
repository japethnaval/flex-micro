const AwsJwtVerify = require("aws-jwt-verify");

module.exports.tokenValidator = async (token) => {
  // Verifier that expects valid access tokens:
  const verifier = AwsJwtVerify.CognitoJwtVerifier.create({
    userPoolId: process.env.USER_POOL_ID,
    clientId: process.env.CLIENT_ID,
    tokenUse: "access",
  });

  try {
    const payload = await verifier.verify(token);
    console.log("Token is valid. Payload:", payload);
    return true;
  } catch {
    console.log("Token not valid!");
    return false;
  }
};
