import { TerraformStack } from 'cdktf'
import { Testing } from 'cdktf/lib/testing'
import 'cdktf/lib/testing/adapters/jest'

describe('unit testing using snapshots', () => {
  it('tests the snapshot', () => {
    const app = Testing.app()
    const stack = new TerraformStack(app, 'test')

    expect(Testing.synth(stack)).toMatchSnapshot()
  })
})
