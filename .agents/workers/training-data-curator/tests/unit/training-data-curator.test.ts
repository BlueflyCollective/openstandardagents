import { training-datacuratorHandler } from '../../handlers/training-data-curator.handlers';

describe('training-data-curatorHandler', () => {
  let handler: training-datacuratorHandler;

  beforeEach(() => {
    handler = new training-datacuratorHandler();
  });

  test('should create handler instance', () => {
    expect(handler).toBeInstanceOf(training-data-curatorHandler);
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
        agent: 'training-data-curator',
        version: '1.0.0'
      })
    );
  });
});
