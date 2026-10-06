import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/db';
import { CacheService } from '../src/services/cache.service';
import { getRedisClient } from '../src/config/redis';

describe('Delivery Agent Management API - Integration Tests', () => {
  const testAgentEmail = `test.courier.${Date.now()}@example.com`;
  const testAgentPhone = `+1-555-${Math.floor(100000 + Math.random() * 900000)}`;
  let createdAgentId: string;

  beforeAll(async () => {
    // Clean any prior test artifacts
    await CacheService.flushAgentCaches();
  });

  afterAll(async () => {
    // Cleanup created test agent if still present
    if (createdAgentId) {
      await prisma.deliveryAgent.deleteMany({
        where: { id: createdAgentId },
      });
    }
    await prisma.$disconnect();
    const redis = getRedisClient();
    if (redis) {
      await redis.quit();
    }
  });

  describe('GET /api/health', () => {
    it('should return healthy status for database and redis', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.services.database.status).toBe('healthy');
    });
  });

  describe('POST /api/agents (Create)', () => {
    it('should validate and reject missing required fields with 400', async () => {
      const res = await request(app).post('/api/agents').send({
        name: 'Incomplete Agent',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Validation failed');
      expect(Array.isArray(res.body.error.details)).toBe(true);
    });

    it('should create a valid delivery agent with 201 Created', async () => {
      const res = await request(app).post('/api/agents').send({
        name: 'Alexandria Morgan',
        phone: testAgentPhone,
        email: testAgentEmail,
        serviceArea: 'Downtown Central',
        status: 'ACTIVE',
        vehicleType: 'MOTORCYCLE',
        rating: 4.9,
        notes: 'Express parcel courier',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe('Alexandria Morgan');
      expect(res.body.data.email).toBe(testAgentEmail);
      expect(res.body.data.phone).toBe(testAgentPhone);
      expect(res.body.data.status).toBe('ACTIVE');

      createdAgentId = res.body.data.id;
    });

    it('should reject duplicate email with 409 Conflict', async () => {
      const res = await request(app).post('/api/agents').send({
        name: 'Duplicate Email Agent',
        phone: `+1-555-${Math.floor(100000 + Math.random() * 900000)}`,
        email: testAgentEmail,
        serviceArea: 'Uptown North',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('already exists');
    });

    it('should reject duplicate phone with 409 Conflict', async () => {
      const res = await request(app).post('/api/agents').send({
        name: 'Duplicate Phone Agent',
        phone: testAgentPhone,
        email: `unique.${Date.now()}@example.com`,
        serviceArea: 'Uptown North',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('already exists');
    });
  });

  describe('GET /api/agents (List & Redis Caching)', () => {
    it('should fetch agents list with pagination metadata', async () => {
      const res = await request(app).get('/api/agents?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
    });

    it('should serve second identical request from Redis cache with X-Cache: HIT', async () => {
      const query = `/api/agents?page=1&limit=4&sortBy=name&sortOrder=asc`;

      // Flush to guarantee fresh state
      await CacheService.flushAgentCaches();

      // 1st request -> MISS
      const res1 = await request(app).get(query);
      expect(res1.status).toBe(200);
      expect(res1.headers['x-cache']).toBe('MISS');
      expect(res1.body.meta.cached).toBe(false);

      // 2nd request -> HIT
      const res2 = await request(app).get(query);
      expect(res2.status).toBe(200);
      expect(res2.headers['x-cache']).toBe('HIT');
      expect(res2.body.meta.cached).toBe(true);
      expect(res2.body.data.length).toBe(res1.body.data.length);
    });

    it('should filter agents by status', async () => {
      const res = await request(app).get('/api/agents?status=ACTIVE');
      expect(res.status).toBe(200);
      expect(res.body.data.every((a: any) => a.status === 'ACTIVE')).toBe(true);
    });
  });

  describe('GET /api/agents/:id (Detail & Caching)', () => {
    it('should return 404 for non-existent agent id', async () => {
      const res = await request(app).get('/api/agents/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return agent details and cache individual record', async () => {
      // 1st request -> MISS
      const res1 = await request(app).get(`/api/agents/${createdAgentId}`);
      expect(res1.status).toBe(200);
      expect(res1.body.data.id).toBe(createdAgentId);
      expect(res1.headers['x-cache']).toBe('MISS');

      // 2nd request -> HIT
      const res2 = await request(app).get(`/api/agents/${createdAgentId}`);
      expect(res2.status).toBe(200);
      expect(res2.headers['x-cache']).toBe('HIT');
      expect(res2.body.meta.cached).toBe(true);
    });
  });

  describe('PUT /api/agents/:id (Update & Cache Invalidation)', () => {
    it('should update agent information and invalidate Redis cache', async () => {
      const updatedNotes = 'Updated via integration test suite';
      const res = await request(app)
        .put(`/api/agents/${createdAgentId}`)
        .send({
          serviceArea: 'West Bay Metro',
          notes: updatedNotes,
          status: 'ON_DUTY',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.serviceArea).toBe('West Bay Metro');
      expect(res.body.data.status).toBe('ON_DUTY');

      // Verify that individual cache was invalidated (next GET is a MISS with updated values)
      const verifyRes = await request(app).get(`/api/agents/${createdAgentId}`);
      expect(verifyRes.headers['x-cache']).toBe('MISS');
      expect(verifyRes.body.data.serviceArea).toBe('West Bay Metro');
      expect(verifyRes.body.data.status).toBe('ON_DUTY');
    });
  });

  describe('DELETE /api/agents/:id (Delete & Invalidation)', () => {
    it('should delete agent and return 404 on subsequent detail request', async () => {
      const res = await request(app).delete(`/api/agents/${createdAgentId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);

      // Verify record is gone
      const checkRes = await request(app).get(`/api/agents/${createdAgentId}`);
      expect(checkRes.status).toBe(404);

      // Nullify createdAgentId so afterAll doesn't try to delete again
      createdAgentId = '';
    });
  });

  describe('GET /api/agents/stats/summary', () => {
    it('should return aggregated metrics across delivery fleet', async () => {
      const res = await request(app).get('/api/agents/stats/summary');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('byStatus');
      expect(res.body.data).toHaveProperty('byArea');
      expect(res.body.data).toHaveProperty('averageRating');
    });
  });
});
