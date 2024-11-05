import type { Construct } from 'constructs'
import * as process from 'node:process'
import { provider } from '@cdktf/provider-github'
import { BranchDefault } from '@cdktf/provider-github/lib/branch-default'
import { Repository } from '@cdktf/provider-github/lib/repository'
import { RepositoryRuleset } from '@cdktf/provider-github/lib/repository-ruleset'
import { Team } from '@cdktf/provider-github/lib/team'
import * as config from '../config'

export function createGithubProvider(stack: Construct, organization: string) {
  return new provider.GithubProvider(stack, 'Github', {
    token: process.env.GH_TOKEN,
    owner: organization,
  })
}

export function createTeams(stack: Construct) {
  const teamConfig = config.loadTeamsConfig()
  teamConfig.teams.forEach((team) => {
    new Team(stack, team.name, { ...team })
  })
}

export function createRepositories(stack: Construct, organization: string) {
  const repoConfig = config.loadRepositoriesConfig(organization)
  repoConfig.repositories.forEach((repo) => {
    new Repository(stack, repo.name, {
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
    const branchDefault = new BranchDefault(stack, `default_branch_${saneName}`, {
      branch: 'main',
      repository: repo.name,
    })
    branchDefault.dependsOn = [`github_repository.${saneName}`]

    const repositoryRuleset = new RepositoryRuleset(stack, `ruleset_${saneName}`, {
      name: 'default',
      enforcement: 'active',
      repository: repo.name,
      target: 'branch',
      conditions: {
        refName: { exclude: [], include: ['~DEFAULT_BRANCH'] },
      },
      rules: {
        requiredSignatures: true,
        requiredLinearHistory: true,
        nonFastForward: true,
        pullRequest: { requiredApprovingReviewCount: 1 },
        requiredStatusChecks: {
          strictRequiredStatusChecksPolicy: true,
          requiredCheck: [{ context: 'build' }],
        },
      },
    })
    repositoryRuleset.dependsOn = [`github_repository.${saneName}`]
  })
}
