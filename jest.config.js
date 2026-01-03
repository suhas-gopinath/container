module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testMatch: ["**/?(*.)+(test|spec).ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/src/SetupTests.ts"],
};
