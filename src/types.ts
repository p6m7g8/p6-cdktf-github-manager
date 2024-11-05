import type { RepositoryConfig } from '@cdktf/provider-github/lib/repository'
import type { TeamConfig } from '@cdktf/provider-github/lib/team'

export interface IOrganizationConfig {
  repositories: RepositoryConfig[]
}

export interface IOrgTeamConfig {
  teams: TeamConfig[]
}

export interface IOrgs {
  orgs: string[]
}

export interface IMyStackProps {
  organization: string
  stateBucketName: string
  dynamoDbTableName?: string
  region: string
}
