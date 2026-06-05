jest.mock('@supabase/supabase-js', () => ({ createClient: () => mockSupabaseClient }));
global.fetch = jest.fn();

let mockSupabaseClient, handler;

const makeQueryBuilder = (resolvedData) => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockResolvedValue({ data: resolvedData, error: null })
});

const makeUpdateBuilder = () => ({
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockResolvedValue({ error: null })
});

const makeInsertBuilder = () => ({
  insert: jest.fn().mockResolvedValue({ error: null })
});

function buildFromMock({ queryData, includeUpdate = false, includeInsert = false }) {
  const fromMock = jest.fn();
  let callIndex = 0;
  fromMock.mockImplementation(() => {
    const call = callIndex++;
    if (call === 0) return makeQueryBuilder(queryData);
    if (includeUpdate && call === 1) return makeUpdateBuilder();
    if (includeInsert) return makeInsertBuilder();
    return makeInsertBuilder();
  });
  return fromMock;
}

function makeReqRes(body = {}, method = 'POST') {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  };
  return { req: { method, body }, res };
}

beforeAll(() => {
  process.env.VERIFY_PIN_API_URL = 'https://carrier.example.com/verify-pin';
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  process.env.VOLUUM_POSTBACK_URL = 'http://citcycle-sative.com/postback?cid={click_id}&payout=2';
  mockSupabaseClient = { from: jest.fn() };
  handler = require('../api/verify-pin');
});

beforeEach(() => { jest.clearAllMocks(); });

const validBody = { pin: '123456', request_id: 'req-abc', click_id: 'cid123', msisdn: '+971501234567' };

test('returns 405 for non-POST', async () => {
  const { req, res } = makeReqRes({}, 'GET');
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.json).toHaveBeenCalledWith({ success: false, error: 'method_not_allowed' });
});

test('returns 400 for missing fields', async () => {
  const { req, res } = makeReqRes({ pin: '1234', request_id: 'req' });
  await handler(req, res);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ success: false, error: 'missing_fields' });
});

test('returns carrier_error when fetch throws', async () => {
  mockSupabaseClient.from = buildFromMock({ queryData: null });
  global.fetch.mockRejectedValueOnce(new Error('timeout'));
  const { req, res } = makeReqRes(validBody);
  await handler(req, res);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, error: 'carrier_error' }));
});

test('updates lead to failed and returns invalid_pin when carrier rejects', async () => {
  const updateBuilder = makeUpdateBuilder();
  const fromMock = jest.fn();
  fromMock
    .mockReturnValueOnce(makeQueryBuilder({ id: 'lead-uuid' }))
    .mockReturnValueOnce(updateBuilder);
  mockSupabaseClient.from = fromMock;
  global.fetch.mockResolvedValueOnce({ json: () => Promise.resolve({ success: false }) });
  const { req, res } = makeReqRes(validBody);
  await handler(req, res);
  expect(updateBuilder.update).toHaveBeenCalledWith({ status: 'failed' });
  expect(res.json).toHaveBeenCalledWith({ success: false, error: 'invalid_pin' });
});

test('converts lead, fires postback and logs on success', async () => {
  const updateBuilder = makeUpdateBuilder();
  const insertBuilder = makeInsertBuilder();
  const fromMock = jest.fn();
  fromMock
    .mockReturnValueOnce(makeQueryBuilder({ id: 'lead-uuid' }))
    .mockReturnValueOnce(updateBuilder)
    .mockReturnValueOnce(insertBuilder);
  mockSupabaseClient.from = fromMock;

  global.fetch
    .mockResolvedValueOnce({ json: () => Promise.resolve({ success: true }) })
    .mockResolvedValueOnce({ status: 200, text: () => Promise.resolve('ok'), ok: true });

  const { req, res } = makeReqRes(validBody);
  await handler(req, res);

  expect(updateBuilder.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'converted' }));
  expect(insertBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({ lead_id: 'lead-uuid', success: true }));
  expect(res.json).toHaveBeenCalledWith({ success: true });
});

test('returns success even when postback fetch fails', async () => {
  const updateBuilder = makeUpdateBuilder();
  const insertBuilder = makeInsertBuilder();
  const fromMock = jest.fn();
  fromMock
    .mockReturnValueOnce(makeQueryBuilder({ id: 'lead-uuid' }))
    .mockReturnValueOnce(updateBuilder)
    .mockReturnValueOnce(insertBuilder);
  mockSupabaseClient.from = fromMock;

  global.fetch
    .mockResolvedValueOnce({ json: () => Promise.resolve({ success: true }) })
    .mockRejectedValueOnce(new Error('postback network error'));

  const { req, res } = makeReqRes(validBody);
  await handler(req, res);
  expect(res.json).toHaveBeenCalledWith({ success: true });
});
