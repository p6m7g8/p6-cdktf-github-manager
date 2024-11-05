import type { Construct } from 'constructs'
import { DynamodbTable } from '@cdktf/provider-aws/lib/dynamodb-table'
import { AwsProvider } from '@cdktf/provider-aws/lib/provider'
import { S3Bucket } from '@cdktf/provider-aws/lib/s3-bucket'
import { TerraformStack } from 'cdktf'

export class StateManagementStack extends TerraformStack {
  public readonly stateBucketName: string
  public readonly dynamoDbTableName: string

  constructor(scope: Construct, id: string, region: string) {
    super(scope, id)

    new AwsProvider(this, 'Aws', {
      region,
    })

    const stateBucket = new S3Bucket(this, 'TerraformStateBucket', {
      bucket: `p6-cdktf-terraform-state-${region}`,
      acl: 'private',
      versioning: { enabled: true },
    })
    this.stateBucketName = stateBucket.bucket

    const dynamoDbTable = new DynamodbTable(this, 'TerraformLocksTable', {
      name: `p6-cdktf-terraform-locks`,
      billingMode: 'PAY_PER_REQUEST',
      hashKey: 'LockID',
      attribute: [{ name: 'LockID', type: 'S' }],
    })
    this.dynamoDbTableName = dynamoDbTable.name
  }
}
