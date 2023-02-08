import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as glob from '@actions/glob'
import * as io from '@actions/io'
import * as tc from '@actions/tool-cache'
import {major, minor} from 'semver'

async function run(): Promise<void> {
  try {
    const directory: string =
      core.getInput('directory') || `${process.env['RUNNER_TEMP']}/fmt`
    const installDir = `${directory}/install`
    try {
      await io.mkdirP(directory)
    } catch (e) {
      core.setFailed('Failed to create FMT working directory')
    }
    let version: string = core.getInput('version') || 'latest'
    const latest = version === 'latest'
    core.info(`Fetching FMT version: ${version} ...`)
    core.debug(`FMT working directory: ${directory}`)
    if (latest) {
      const md = await exec.getExecOutput('gh', [
        'release',
        'view',
        '-R',
        'fmtlib/fmt'
      ])
      version = md.stdout.slice(
        md.stdout.indexOf('\t') + 1,
        md.stdout.indexOf('\n')
      )
    }
    const paths = [directory]
    const key = `fmt-${version}`
    const restoreKeys = [
      `fmt-${major(version)}.${minor(version)}`,
      `fmt-${major(version)}`,
      'fmt-'
    ]
    const cacheKey = await cache.restoreCache(paths, key, restoreKeys)
    if (!cacheKey) {
      if (latest) {
        const ret2 = await exec.exec(
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
        if (ret2 !== 0) {
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
      const args =
        toolset !== 'auto'
          ? ['..', '-G', toolset, `-DCMAKE_INSTALL_PREFIX:PATH=${installDir}`]
          : ['..', `-DCMAKE_INSTALL_PREFIX:PATH=${installDir}`]
      await exec.exec('cmake', args, {
        cwd: `${fmtFolder}/build`
      })
      await exec.exec('cmake', ['--build', 'build', '--target', 'install'], {
        cwd: fmtFolder
      })
      await cache.saveCache(paths, key)
    }
    core.addPath(installDir)

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
