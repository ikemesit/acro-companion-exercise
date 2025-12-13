import { appConfig } from './app.config';

describe('appConfig', () => {
  it('should define providers', () => {
    expect(appConfig).toBeTruthy();
    expect(appConfig.providers).toBeTruthy();
    expect(Array.isArray(appConfig.providers)).toBeTrue();

    // Current config is expected to provide: browser error listeners, zoneless change detection, router, http client
    expect(appConfig.providers.length).toBe(4);
  });
});
