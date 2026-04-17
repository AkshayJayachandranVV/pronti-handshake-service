import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HandshakeService } from '../src/handshake/handshake.service';
import { Handshake } from '../src/handshake/handshake.schema';

const makeDto = (overrides = {}) => ({
  candidateId: 'cand-001',
  message: 'Hello from the test suite',
  persist: false,
  ...overrides,
});


const mockHandshakeModel = () => ({
  create: jest.fn(),
});

describe('HandshakeService', () => {
  let service: HandshakeService;
  let handshakeModel: ReturnType<typeof mockHandshakeModel>;

  beforeEach(async () => {
    handshakeModel = mockHandshakeModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandshakeService,
        {
          provide: getModelToken(Handshake.name),
          useValue: handshakeModel,
        },
      ],
    }).compile();

    service = module.get<HandshakeService>(HandshakeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processHandshake', () => {
    it('returns success:true and a non-empty reply', async () => {
      const result = await service.processHandshake(makeDto());
      expect(result.success).toBe(true);
      expect(result.reply).toContain('cand-001');
    });

    it('does NOT persist when persist=false', async () => {
      await service.processHandshake(makeDto({ persist: false }));
      expect(handshakeModel.create).not.toHaveBeenCalled();
    });

    it('persists to mongo when persist=true', async () => {
      handshakeModel.create.mockResolvedValueOnce({});
      const result = await service.processHandshake(makeDto({ persist: true }));

      expect(handshakeModel.create).toHaveBeenCalledTimes(1);
      expect(handshakeModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          candidateId: 'cand-001',
          message: 'Hello from the test suite',
        }),
      );
      expect(result.persisted).toBe(true);
    });

    it('returns persisted:false when persist=false even if mongo is fine', async () => {
      const result = await service.processHandshake(makeDto({ persist: false }));
      expect(result.persisted).toBe(false);
    });

    it('returns a valid ISO timestamp', async () => {
      const result = await service.processHandshake(makeDto());
      expect(() => new Date(result.timestamp)).not.toThrow();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('still returns success if mongo.create throws (resilient path)', async () => {

      handshakeModel.create.mockRejectedValueOnce(new Error('Connection timeout'));

      const result = await service.processHandshake(makeDto({ persist: true }));


      expect(result.success).toBe(true);
      expect(result.persisted).toBe(false);
    });
  });
});
