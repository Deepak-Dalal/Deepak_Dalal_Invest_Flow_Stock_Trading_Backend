const request = require('supertest');
const http = require('http');
const { app } = require('../index.js');
const {
  getAllStocks,
  getStockByTicker,
  addTrade,
  stocks,
} = require('../stocks');

jest.mock('../stocks.js', () => ({
  ...jest.requireActual('../stocks.js'),
  getAllStocks: jest.fn(),
  getStockByTicker: jest.fn(),
  addTrade: jest.fn(),
}));

let server;

beforeAll(async () => {
  server = http.createServer(app);
  server.listen(3001);
});

afterAll(async () => {
  server.close();
});

describe('Stocks and trades APIs tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all stocks', async () => {
    const mockStocks = [
      { stockId: 1, ticker: 'AAPL', companyName: 'Apple Inc.', price: 150.75 },
      {
        stockId: 2,
        ticker: 'GOOGL',
        companyName: 'Alphabet Inc.',
        price: 2750.1,
      },
      { stockId: 3, ticker: 'TSLA', companyName: 'Tesla, Inc.', price: 695.5 },
    ];
    getAllStocks.mockResolvedValue({ stocks: mockStocks });

    const res = await request(server).get('/stocks');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ stocks: mockStocks });
  });

  it('should return a specific stock by ticker symbol', async () => {
    const mockStock = {
      stockId: 1,
      ticker: 'AAPL',
      companyName: 'Apple Inc.',
      price: 150.75,
    };

    getStockByTicker.mockResolvedValue({ stock: mockStock });

    const res = await request(server).get('/stocks/AAPL');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ stock: mockStock });
  });

  it('should add a new trade', async () => {
    const mockTrade = {
      stockId: 1,
      quantity: 10,
      tradeType: 'buy',
      tradeDate: '2024-08-07',
    };

    addTrade.mockResolvedValue({ trade: { tradeId: 1, ...mockTrade } });

    const res = await request(server).post('/trades/new').send(mockTrade);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ trade: { tradeId: 1, ...mockTrade } });
  });

  it('GET API /stocks/:ticker should return 404 if stock with given ticker symbol is not found', async () => {
    getStockByTicker.mockResolvedValue({});

    const res = await request(server).get('/stocks/AGPL');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toEqual('stock not found');
  });

  it('should return 400 error if new trade input is invalid', async () => {
    const mockTrade = {
      stockId: 1,
      quantity: 10,
      tradeType: 'buy',
      tradeDate: 123,
    };

    const res = await request(server).post('/trades/new').send(mockTrade);
    expect(res.statusCode).toBe(400);
    expect(res.text).toEqual('tradeDate is required and should be a string');
  });

  it('getAllStocks should return list of all stocks', async () => {
    getAllStocks.mockResolvedValue({ stocks });

    const result = await getAllStocks();
    expect(result).toEqual({ stocks });
    expect(getAllStocks).toHaveBeenCalled();
  });

  it('addTrade should add a new trade', async () => {
    const mockTrade = {
      stockId: 1,
      quantity: 10,
      tradeType: 'buy',
      tradeDate: 123,
    };
    addTrade.mockResolvedValue({ trade: { tradeId: 1, ...mockTrade } });

    const result = await addTrade(mockTrade);
    expect(result).toEqual({ trade: { tradeId: 1, ...mockTrade } });
    expect(addTrade).toHaveBeenCalledWith(mockTrade);
  });
});
