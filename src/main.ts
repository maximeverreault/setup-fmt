import * as core from '@actions/core'
import * as fs from 'fs'
import * as httpm from '@actions/http-client'
import path from 'path'

async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version') || '9.1.0'
    // const toolset: string = core.getInput('toolset')
    // const platform: string = core.getInput('platform')
    const directory: string =
      core.getInput('directory') || `${process.env['RUNNER_TEMP']}/fmt`
    const sampleFilePath: string = path.join(directory, 'fmt-9.1.0.zip')
    core.debug(`Fetching FMT v${version} ...`)
    const file = fs.createWriteStream(sampleFilePath)
    const client = new httpm.HttpClient()
    const {message} = await client.get(
      `https://github.com/fmtlib/fmt/releases/download/${version}/fmt-${version}.zip`
    )
    message.pipe(file)

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
