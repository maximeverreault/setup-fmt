import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as glob from '@actions/glob'
import * as io from '@actions/io'
import * as tc from '@actions/tool-cache'

async function run(): Promise<void> {
  try {
    const directory: string =
      core.getInput('directory') || `${process.env['RUNNER_TEMP']}/fmt`
    try {
      await io.mkdirP(directory)
    } catch (e) {
      core.error('Failed to create FMT working directory')
    }
    const version: string = core.getInput('version') || 'latest'
    core.info(`Fetching FMT version: ${version} ...`)
    core.debug(`FMT working directory: ${directory}`)
    if (version === 'latest') {
      const ret = await exec.exec(
        'gh',
        [
          'release',
          'download',
          '-R',
          'fmtlib/fmt',
          '--clobber',
          '--pattern',
          'fmt*.zip'
        ],
        {
          cwd: directory
        }
      )
      if (ret !== 0) {
        core.setFailed(`Could not download the ${version} release for FMT`)
      }
    } else {
      const ret = await exec.exec(
        'gh',
        ['release', 'download', version, '--clobber', '-R', 'fmtlib/fmt'],
        {
          cwd: directory
        }
      )
      if (ret !== 0) {
        core.setFailed(`Could not download the ${version} release for FMT`)
      }
    }
    const fmtZipPattern = await glob.create(`${directory}/*.zip`, {
      followSymbolicLinks: false,
      matchDirectories: false
    })
    const zipFile = await fmtZipPattern.glob()
    const fileSavePath = await tc.extractZip(zipFile[0], directory)
    core.debug(`Extracted FMT to ${fileSavePath}`)

    const fmtFolderPattern = await glob.create(`${directory}/fmt*/`, {
      followSymbolicLinks: false,
      matchDirectories: true,
      implicitDescendants: false
    })
    const fmtFolderList = await fmtFolderPattern.glob()
    const fmtFolder = fmtFolderList[0]
    core.debug(`FMT extracted folder path: ${fmtFolder}`)
    const toolset: string = core.getInput('toolset')
    // const platform: string = core.getInput('platform')

    await io.mkdirP(`${fmtFolder}/build`)
    await exec.exec('cmake', ['..', '-G', toolset], {
      cwd: `${fmtFolder}/build`
    })
    await exec.exec('cmake', ['--build', 'build', '--target', 'install'], {
      cwd: fmtFolder
    })

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
