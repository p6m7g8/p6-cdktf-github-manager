import type { RepositoryConfig } from '@cdktf/provider-github/lib/repository'
import type { Construct } from 'constructs'
import * as fs from 'node:fs'
import * as process from 'node:process'
import { provider } from '@cdktf/provider-github'
import { BranchDefault } from '@cdktf/provider-github/lib/branch-default'
import { Repository } from '@cdktf/provider-github/lib/repository'
import { RepositoryRuleset } from '@cdktf/provider-github/lib/repository-ruleset'
import { App, TerraformStack } from 'cdktf'
import * as yaml from 'js-yaml'

interface IOrganizationConfig {
  repositories: RepositoryConfig[]
}

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    new provider.GithubProvider(this, 'Github', {
      token: process.env.GH_TOKEN,
      owner: 'p6m7g8-actions',
    })

    const fileContents = fs.readFileSync('conf/repositories.yml', 'utf8')
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

const app = new App()
new MyStack(app, 'p6-cdktf-github-p6m7g8-actions')
app.synth()
