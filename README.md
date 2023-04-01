![Build and test status](https://github.com/maximeverreault/setup-fmt/actions/workflows/test.yml/badge.svg)![Analysis status](https://github.com/maximeverreault/setup-fmt/actions/workflows/codeql-analysis.yml/badge.svg)![Packaging status](https://github.com/maximeverreault/setup-fmt/actions/workflows/check-dist.yml/badge.svg)

# Download and install the FMT library

Install FMT in GitHub actions using source code.

## Inputs

### `version`

**Optional** The FMT version to install, e.g. `9.1.0` or `latest`.
By default, the latest version of FMT is used. Otherwise, you can use all versions available on the FMT GitHub.

### `toolset`

**Optional** The CMake generator used to generate the build system. Details about CMake generator can be found
in [the official documentation](https://cmake.org/cmake/help/latest/manual/cmake-generators.7.html). Possible values
are `auto`, `Ninja`, `MinGW Makefiles`, `Visual Studio 17 2022` and more.
By default, `auto` is selected which lets CMake decide the best generator for the OS you're building on.

### `directory`

**Optional** The build directory where to install the FMT library on the runner.
Defaults to `{{ runner.temp }}/fmt`. For more information on the `runner.temp` variable, look at
the [documentation](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables)

## Example usage

### Simple automatic configuration

```yml
- name: Install FMT
  uses: maximeverreault/setup-fmt@v1.0.0
  id: install-fmt
```

### Recommended explicit configuration compatible with all platforms

```yml
- name: Install FMT
  uses: maximeverreault/setup-fmt@v1.0.0
  id: install-fmt
  with:
    version: latest
    toolset: Ninja
```

### Specifying a version with makefiles

```yml
- name: Install FMT
  uses: maximeverreault/setup-fmt@v1.0.0
  id: install-fmt
  with:
    version: 9.1.0
    toolset: MinGW Makefiles
```

### Specifying a directory on a Windows runner

```yml
- name: Install FMT
  uses: maximeverreault/setup-fmt@v1.0.0
  id: install-fmt
  with:
    directory: C:\fmt-install
```

### Specifying a directory on a MacOS/Linux runner

```yml
- name: Install FMT
  uses: maximeverreault/setup-fmt@v1.0.0
  id: install-fmt
  with:
    directory: /usr/bin/fmt
```
