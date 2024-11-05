import * as process from 'node:process'
import { App } from 'cdktf'
import { loadOrgsConfig } from './config'
import { ManagerStack } from './manager'
import { StateManagementStack } from './state_management'

const app = new App()
const region = process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION || 'us-east-1'

// const stateManagementStack = new StateManagementStack(app, 'StateManagementStack', region)
new StateManagementStack(app, 'StateManagementStack', region)

const orgConfig = loadOrgsConfig()
orgConfig.orgs.forEach((organization) => {
  new ManagerStack(app, `p6-cdktf-github-manager-${organization}`, {
    dynamoDbTableName: 'p6-cdktf-terraform-locks',
    organization,
    region,
    stateBucketName: 'p6-cdktf-terraform-state-us-east-1',
  })
})

app.synth()
