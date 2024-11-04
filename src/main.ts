import type { IOrgs } from './manager'
import * as fs from 'node:fs'
import * as process from 'node:process'
import { DynamodbTable } from '@cdktf/provider-aws/lib/dynamodb-table'
import { S3Bucket } from '@cdktf/provider-aws/lib/s3-bucket'
import { App, S3Backend } from 'cdktf'
import * as yaml from 'js-yaml'
import { MyStack } from './manager'

const region = process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION || 'us-east-1'

const app = new App()

const stateBucket = new S3Bucket(app, 'TerraformStateBucket', {
  bucket: `p6-cdktf-terraform-state-${region}`,
  acl: 'private',
  versioning: {
    enabled: true,
  },
})

new DynamodbTable(app, 'TerraformLocksTable', {
  name: `p6-cdktf-terraform-locks-${region}`,
  billingMode: 'PAY_PER_REQUEST',
  hashKey: 'LockID',
  attribute: [
    {
      name: 'LockID',
      type: 'S',
    },
  ],
})

const fileContents = fs.readFileSync(`conf/orgs.yml`, 'utf8')
const data = yaml.load(fileContents) as IOrgs
data.orgs.forEach((org: string) => {
  new S3Backend(app, {
    bucket: stateBucket.bucket,
    key: `${org}/terraform.tfstate`,
    region,
    dynamodbTable: 'terraform-locks',
    encrypt: true,
  })

  new MyStack(app, `p6-cdktf-github-manager-${org}`, {
    organization: org,
  })
})
app.synth()
