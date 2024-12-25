const express = require('express');
const cors = require('cors');
const { getAllStocks, getStockByTicker, addTrade } = require('./stocks');

const app = express();

app.use(cors());
app.use(express.json());
const port = 3000;

app.get('/stocks', async (req, res) => {
  try {
    const response = await getAllStocks();
    if (response.stocks.length === 0) {
      res.status(404).json({ message: 'No stocks found' });
    } else {
      res.status(200).json(response);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/stocks/:ticker', async (req, res) => {
  try {
    const ticker = req.params.ticker;
    const response = await getStockByTicker(ticker);
    if (!response.stock) {
      res.status(404).json({ message: 'stock not found' });
    } else {
      res.status(200).json(response);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function validateNewTrade(trade) {
  if (!trade.stockId || typeof trade.stockId !== 'number') {
    return 'stockId is required and should be a number';
  }
  if (!trade.quantity || typeof trade.quantity !== 'number') {
    return 'quantity is required and should be a number';
  }
  if (!trade.tradeType || typeof trade.tradeType !== 'string') {
    return 'tradeType is required and should be a string';
  }
  if (!trade.tradeDate || typeof trade.tradeDate !== 'string') {
    return 'tradeDate is required and should be a string';
  }
  return null;
}

app.post('/trades/new', async (req, res) => {
  try {
    const newTrade = req.body;
    const error = validateNewTrade(newTrade);
    if (error) return res.status(400).send(error);

    const response = await addTrade(newTrade);

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = { app };
