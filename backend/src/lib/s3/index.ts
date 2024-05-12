import { t } from 'elysia'
import { safeParse } from '../safeParse'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const ConfigSchema = t.Object({
  S3_ACCESS_KEY: t.String(),
  S3_SECRET_KEY: t.String(),
  S3_REGION: t.String(),
  S3_ENDPOINT: t.String(),
  S3_BUCKET: t.String(),
  S3_FOLDER: t.String(),
})

const result = safeParse(ConfigSchema, process.env)
if (!result.success)
  throw "Invalid S3 config"

const {
  S3_ACCESS_KEY,
  S3_SECRET_KEY,
  S3_REGION,
  S3_ENDPOINT,
  S3_BUCKET,
  S3_FOLDER
} = result.data

const s3Client = new S3Client({
  endpoint: S3_ENDPOINT,
  forcePathStyle: false,
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey:S3_SECRET_KEY,
  }
})

export const getPresignedUrl = async (path: string, filename: string, type: string) => {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: `${S3_FOLDER}${path}${filename}`,
    ContentType: type,
    Metadata: {
      'x-amz-acl': 'public-read'
    }
  })
  try {
    const url = await getSignedUrl(s3Client, command)
    return url
  } catch (error) {
    return null
  }
};
