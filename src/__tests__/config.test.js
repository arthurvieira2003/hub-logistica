const configPath = require.resolve("../../public/javascripts/config.js");

beforeAll(() => {
  require(configPath);
});

describe("APP_CONFIG", () => {
  test("deve definir APP_CONFIG com API_BASE_URL", () => {
    expect(window.APP_CONFIG).toBeDefined();
    expect(window.APP_CONFIG.API_BASE_URL).toBe(
      "https://logistica.copapel.com.br/api"
    );
  });
});
