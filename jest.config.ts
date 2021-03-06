module.exports = {
  displayName: 'update-cors-cloud',
  setupFiles: ['./test/setup-env.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: './coverage/lib/update-cors-cloud',
};
