import { S3Backend } from 'cdktf'

export function createS3Backend(app: any, bucketName: string, region: string, org: string) {
  new S3Backend(app, {
    bucket: bucketName,
    key: `${org}/terraform.tfstate`,
    region,
    dynamodbTable: `terraform-locks`,
    encrypt: true,
  })
}
