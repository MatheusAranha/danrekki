export default {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@danrekki/shared$': '<rootDir>/../../libs/shared/src/index.ts',
    '^@danrekki/shared/(.*)$': '<rootDir>/../../libs/shared/src/$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/apps/api',
};
