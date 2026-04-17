import { Test, TestingModule } from '@nestjs/testing';
import { HandshakeResolver } from '../src/graphql/handshake.resolver';
import { HandshakeService } from '../src/handshake/handshake.service';

const mockHandshakeService = {
  processHandshake: jest.fn(),
};

describe('HandshakeResolver', () => {
  let resolver: HandshakeResolver;
  let service: typeof mockHandshakeService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandshakeResolver,
        {
          provide: HandshakeService,
          useValue: mockHandshakeService,
        },
      ],
    }).compile();

    resolver = module.get<HandshakeResolver>(HandshakeResolver);
    service = module.get(HandshakeService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('takeHomeHandshake mutation', () => {
    const fakeResponse = {
      success: true,
      reply: 'Hey cand-42, got your message: "hi". Handshake complete.',
      persisted: true,
      timestamp: new Date().toISOString(),
    };

    it('calls service.processHandshake with the right args', async () => {
      service.processHandshake.mockResolvedValueOnce(fakeResponse);

      await resolver.takeHomeHandshake('cand-42', 'hi', true);

      expect(service.processHandshake).toHaveBeenCalledWith({
        candidateId: 'cand-42',
        message: 'hi',
        persist: true,
      });
    });

    it('returns exactly what the service returns', async () => {
      service.processHandshake.mockResolvedValueOnce(fakeResponse);

      const result = await resolver.takeHomeHandshake('cand-42', 'hi', true);

      expect(result).toEqual(fakeResponse);
    });

    it('defaults persist to false when not provided', async () => {
      service.processHandshake.mockResolvedValueOnce({ ...fakeResponse, persisted: false });

      await resolver.takeHomeHandshake('cand-42', 'hi', false);

      expect(service.processHandshake).toHaveBeenCalledWith(
        expect.objectContaining({ persist: false }),
      );
    });
  });
});
