import type { RepositoryConfig } from '@cdktf/provider-github/lib/repository'
import type { TeamConfig } from '@cdktf/provider-github/lib/team'
import type { Construct } from 'constructs'
import * as fs from 'node:fs'
import * as process from 'node:process'
import { provider } from '@cdktf/provider-github'
import { BranchDefault } from '@cdktf/provider-github/lib/branch-default'
import { Repository } from '@cdktf/provider-github/lib/repository'
import { RepositoryRuleset } from '@cdktf/provider-github/lib/repository-ruleset'
import { Team } from '@cdktf/provider-github/lib/team'
import { TerraformStack } from 'cdktf'
import * as yaml from 'js-yaml'

interface IOrganizationConfig {
  repositories: RepositoryConfig[]
}

interface IOrgTeamConfig {
  teams: TeamConfig[]
}

export interface IOrgs {
  orgs: string[]
}

export interface IMyStackProps {
  organization: string
}

export class MyStack extends TerraformStack {
  private readonly organization: string

  constructor(scope: Construct, id: string, props: IMyStackProps) {
    super(scope, id)
    this.organization = props.organization

    this.init()
    if (this.organization !== 'pgollucci') {
      this.teams()
    }
    this.repositories()
  }

  private init(this: MyStack) {
    new provider.GithubProvider(this, 'Github', {
      token: process.env.GH_TOKEN,
      owner: this.organization,
    })
  }

  private teams() {
    const fileContents = fs.readFileSync('conf/teams.yml', 'utf8')
    const data = yaml.load(fileContents) as IOrgTeamConfig

    data.teams.forEach((team: TeamConfig) => {
      new Team(this, team.name, {
        ...team,
      })
    })
  }

  private repositories() {
    const fileContents = fs.readFileSync(`conf/repositories/${this.organization}.yml`, 'utf8')
    const data = yaml.load(fileContents) as IOrganizationConfig
    data.repositories.forEach((repo: RepositoryConfig) => {
      new Repository(this, repo.name, {
        allowAutoMerge: true,
        allowMergeCommit: false,
        allowRebaseMerge: false,
        allowSquashMerge: true,
        allowUpdateBranch: true,
        archiveOnDestroy: true,
        deleteBranchOnMerge: true,
        hasDiscussions: true,
        hasIssues: true,
        hasProjects: true,
        hasWiki: true,
        licenseTemplate: 'apache-2.0',
        squashMergeCommitTitle: 'PR_TITLE',
        vulnerabilityAlerts: false,
        ...repo,
      })

      const saneName = repo.name.replace(/\./g, '')
      const branchName = `default_branch_${saneName}`
      const branchDefault = new BranchDefault(this, branchName, {
        branch: 'main',
        repository: repo.name,
      })
      branchDefault.dependsOn = [`github_repository.${saneName}`]

      const rulesetName = `ruleset_${saneName}`
      const repositoryRuleset = new RepositoryRuleset(this, rulesetName, {
        name: 'default',
        enforcement: 'active',
        repository: repo.name,
        target: 'branch',
        conditions: {
          refName: {
            exclude: [],
            include: ['~DEFAULT_BRANCH'],
          },
        },
        rules: {
          requiredSignatures: true,
          requiredLinearHistory: true,
          nonFastForward: true,
          pullRequest: {
            requiredApprovingReviewCount: 1,
          },
          requiredStatusChecks: {
            strictRequiredStatusChecksPolicy: true,
            requiredCheck: [
              {
                context: 'build',
              },
            ],
          },
        },
      })
      repositoryRuleset.dependsOn = [`github_repository.${saneName}`]
    })
  }
}
