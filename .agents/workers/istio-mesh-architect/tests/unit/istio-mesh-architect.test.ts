import { istio-mesharchitectHandler } from '../../handlers/istio-mesh-architect.handlers';

describe('istio-mesh-architectHandler', () => {
  let handler: istio-mesharchitectHandler;

  beforeEach(() => {
    handler = new istio-mesharchitectHandler();
  });

  test('should create handler instance', () => {
    expect(handler).toBeInstanceOf(istio-mesh-architectHandler);
  });

  test('should handle health check', async () => {
    const req = {} as any;
    const res = {
      json: jest.fn()
    } as any;

    await handler.health(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'healthy',
        agent: 'istio-mesh-architect',
        version: '1.0.0'
      })
    );
  });
});
