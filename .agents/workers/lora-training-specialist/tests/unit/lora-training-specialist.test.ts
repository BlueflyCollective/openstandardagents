import { lora-trainingspecialistHandler } from '../../handlers/lora-training-specialist.handlers';

describe('lora-training-specialistHandler', () => {
  let handler: lora-trainingspecialistHandler;

  beforeEach(() => {
    handler = new lora-trainingspecialistHandler();
  });

  test('should create handler instance', () => {
    expect(handler).toBeInstanceOf(lora-training-specialistHandler);
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
        agent: 'lora-training-specialist',
        version: '1.0.0'
      })
    );
  });
});
