import { routes } from './app.routes';

describe('routes', () => {
  it('should define redirect from empty path to scoreboard', () => {
    expect(routes.length).toBeGreaterThanOrEqual(2);

    const redirectRoute = routes[0];
    expect(redirectRoute.path).toBe('');
    expect(redirectRoute.redirectTo).toBe('scoreboard');
    expect(redirectRoute.pathMatch).toBe('full');
  });

  it('should lazily load the Scoreboard component', async () => {
    const scoreboardRoute = routes.find((r) => r.path === 'scoreboard');
    expect(scoreboardRoute).toBeDefined();
    expect(scoreboardRoute!.loadComponent).toEqual(jasmine.any(Function));

    const component = await scoreboardRoute!.loadComponent!();
    // The route is configured to return the standalone component class.
    expect(component).toBeTruthy();
    // Name can be mangled by build tooling (e.g. Scoreboard2), so assert on Angular metadata instead.
    expect((component as any).ɵcmp).toBeDefined();
  });
});
