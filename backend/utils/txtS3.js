const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("./s3Config");

const uploadUserData = async (userId, data) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `users/${userId}/data.txt`,
    Body: JSON.stringify(data, null, 2),
    ContentType: "text/plain",
  });

  await s3.send(command);
};

const downloadUserData = async (userId, data) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `users/${userId}/data.txt`,
  });

  const response = await s3.send(command);
};

module.exports = { uploadUserData, downloadUserData };
