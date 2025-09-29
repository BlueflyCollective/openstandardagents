import { dataagentHandler } from '../../handlers/data-agent.handlers';

describe('data-agentHandler', () => {
  let handler: dataagentHandler;

  beforeEach(() => {
    handler = new dataagentHandler();
  });

  test('should create handler instance', () => {
    expect(handler).toBeInstanceOf(data-agentHandler);
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
        agent: 'data-agent',
        version: '1.0.0'
      })
    );
  });
});
