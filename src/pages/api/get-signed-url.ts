import { NextApiRequest, NextApiResponse } from 'next'
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts"

const stsClient = new STSClient({
  region: process.env.AWS_REGION,
})

async function getTemporaryCredentials() {
  const command = new AssumeRoleCommand({
    RoleArn: process.env.AWS_ROLE_ARN,
    RoleSessionName: 'S3AccessSession',
    DurationSeconds: 900, // 15 minutes
  })

  const response = await stsClient.send(command)
  return {
    accessKeyId: response.Credentials!.AccessKeyId!,
    secretAccessKey: response.Credentials!.SecretAccessKey!,
    sessionToken: response.Credentials!.SessionToken!,
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key } = req.query

  if (!key || typeof key !== 'string') {
    return res.status(400).json({ error: 'Invalid image key' })
  }

  try {
    const tempCredentials = await getTemporaryCredentials()

    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: tempCredentials,
    })

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // URL expires in 1 hour

    res.status(200).json({ signedUrl })
  } catch (error) {
    console.error('Error generating signed URL:', error)
    res.status(500).json({ error: 'Error generating signed URL' })
  }
}
