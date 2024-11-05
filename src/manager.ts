import type { Construct } from 'constructs'
import type { IMyStackProps } from './types'
import { S3Backend, TerraformStack } from 'cdktf'
import * as githubResources from './resources/github'

export class ManagerStack extends TerraformStack {
  private readonly organization: string

  constructor(scope: Construct, id: string, props: IMyStackProps) {
    super(scope, id)
    this.organization = props.organization

    new S3Backend(this, {
      bucket: props.stateBucketName,
      key: `${this.organization}/terraform.tfstate`,
      region: props.region,
      dynamodbTable: props.dynamoDbTableName,
      encrypt: true,
    })

    this.init()
    if (this.organization !== 'pgollucci') {
      this.setupTeams()
    }
    this.setupRepositories()
  }

  private init() {
    githubResources.createGithubProvider(this, this.organization)
  }

  private setupTeams() {
    githubResources.createTeams(this)
  }

  private setupRepositories() {
    githubResources.createRepositories(this, this.organization)
  }
}
