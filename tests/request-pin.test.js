jest.mock('@supabase/supabase-js', () => ({ createClient: () => mockSupabaseClient }));
global.fetch = jest.fn();

let mockSupabaseClient, handler;

const makeQueryBuilder = (resolvedData) => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockResolvedValue({ data: resolvedData, error: null })
});

const makeQueryBuilderWithError = (error) => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockResolvedValue({ data: null, error })
});

const makeInsertBuilder = (error = null) => ({
  insert: jest.fn().mockResolvedValue({ error })
});

function makeReqRes(body = {}, method = 'POST') {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
  return { req: { method, body }, res };
}

beforeAll(() => {
  process.env.REQUEST_PIN_API_URL = 'https://carrier.example.com/request-pin';
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  mockSupabaseClient = { from: jest.fn() };
  handler = require('../api/request-pin');
});

beforeEach(() => { jest.clearAllMocks(); });

test('returns 405 for non-POST', async () => {
  const { req, res } = makeReqRes({}, 'GET');
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.json).toHaveBeenCalledWith({ success: false, error: 'method_not_allowed' });
});

test('returns 400 for missing fields', async () => {
  const { req, res } = makeReqRes({ msisdn: '+971501234567' });
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ success: false, error: 'missing_fields' });
});

test('blocks already-converted msisdn', async () => {
  mockSupabaseClient.from.mockReturnValue(makeQueryBuilder({ id: 'existing-uuid' }));
  const { req, res } = makeReqRes({ msisdn: '+971501234567', click_id: 'cid123' });
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ success: false, error: 'already_registered' });
});

test('returns db_error when dedup query fails', async () => {
  mockSupabaseClient.from.mockReturnValue(makeQueryBuilderWithError({ message: 'connection failed' }));
  const { req, res } = makeReqRes({ msisdn: '+971501234567', click_id: 'cid123' });
  await handler(req, res);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: 'db_error' }));
});

test('returns carrier_error when fetch throws', async () => {
  mockSupabaseClient.from.mockReturnValue(makeQueryBuilder(null));
  global.fetch.mockRejectedValue(new Error('network down'));
  const { req, res } = makeReqRes({ msisdn: '+971501234567', click_id: 'cid123' });
  await handler(req, res);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: 'carrier_error' }));
});

test('returns carrier_error when no request_id in response', async () => {
  mockSupabaseClient.from.mockReturnValue(makeQueryBuilder(null));
  global.fetch.mockResolvedValue({ json: () => Promise.resolve({ some: 'field' }) });
  const { req, res } = makeReqRes({ msisdn: '+971501234567', click_id: 'cid123' });
  await handler(req, res);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: 'carrier_error' }));
});

test('returns db_error when insert fails', async () => {
  const fromMock = jest.fn();
  fromMock
    .mockReturnValueOnce(makeQueryBuilder(null))
    .mockReturnValueOnce(makeInsertBuilder({ message: 'insert failed' }));
  mockSupabaseClient.from = fromMock;
  global.fetch.mockResolvedValue({ json: () => Promise.resolve({ request_id: 'req-abc' }) });
  const { req, res } = makeReqRes({ msisdn: '+971501234567', click_id: 'cid123' });
  await handler(req, res);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: 'db_error' }));
});

test('returns success with request_id on happy path', async () => {
  const fromMock = jest.fn();
  fromMock
    .mockReturnValueOnce(makeQueryBuilder(null))
    .mockReturnValueOnce(makeInsertBuilder(null));
  mockSupabaseClient.from = fromMock;
  global.fetch.mockResolvedValue({ json: () => Promise.resolve({ request_id: 'req-xyz' }) });
  const { req, res } = makeReqRes({ msisdn: '+971501234567', click_id: 'cid123' });
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ success: true, request_id: 'req-xyz' });
});
