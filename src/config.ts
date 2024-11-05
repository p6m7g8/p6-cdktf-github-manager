import type { IOrganizationConfig, IOrgs, IOrgTeamConfig } from './types'
import * as fs from 'node:fs'
import * as yaml from 'js-yaml'

export function loadOrgsConfig(): IOrgs {
  const fileContents = fs.readFileSync('conf/orgs.yml', 'utf8')
  return yaml.load(fileContents) as IOrgs
}

export function loadTeamsConfig(): IOrgTeamConfig {
  const fileContents = fs.readFileSync('conf/teams.yml', 'utf8')
  return yaml.load(fileContents) as IOrgTeamConfig
}

export function loadRepositoriesConfig(organization: string): IOrganizationConfig {
  const fileContents = fs.readFileSync(`conf/repositories/${organization}.yml`, 'utf8')
  return yaml.load(fileContents) as IOrganizationConfig
}
