
module.exports = {
  clearMocks: true,
  preset: "ts-jest",
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.base.json'
    }
  },
  testEnvironment: "node",
  verbose: true,
}
