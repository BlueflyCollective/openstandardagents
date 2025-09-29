import { drools-rulesexpertHandler } from '../../handlers/drools-rules-expert.handlers';

describe('drools-rules-expertHandler', () => {
  let handler: drools-rulesexpertHandler;

  beforeEach(() => {
    handler = new drools-rulesexpertHandler();
  });

  test('should create handler instance', () => {
    expect(handler).toBeInstanceOf(drools-rules-expertHandler);
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
        agent: 'drools-rules-expert',
        version: '1.0.0'
      })
    );
  });
});
