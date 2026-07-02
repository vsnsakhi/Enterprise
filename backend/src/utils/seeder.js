require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Trade = require('../models/Trade');
const Exception = require('../models/Exception');
const Notification = require('../models/Notification');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding');
};

const assets = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'Stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Stock' },
  { symbol: 'JPM', name: 'JPMorgan Chase', type: 'Stock' },
  { symbol: 'GS', name: 'Goldman Sachs', type: 'Stock' },
  { symbol: 'US10Y', name: 'US 10Y Treasury', type: 'Bond' },
  { symbol: 'UK10Y', name: 'UK 10Y Gilt', type: 'Bond' },
  { symbol: 'SPY', name: 'S&P 500 ETF', type: 'ETF' },
  { symbol: 'QQQ', name: 'Nasdaq ETF', type: 'ETF' },
  { symbol: 'EURUSD', name: 'EUR/USD', type: 'Currency' },
  { symbol: 'GBPUSD', name: 'GBP/USD', type: 'Currency' },
];

const counterparties = ['Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'Barclays', 'Deutsche Bank', 'UBS', 'Credit Suisse', 'Citigroup', 'HSBC', 'BNP Paribas'];
const brokers = ['Bloomberg Terminal', 'Reuters Eikon', 'ICE', 'CME Group', 'NYSE', 'NASDAQ', 'LSE', 'Euronext'];
const statuses = ['Pending', 'Validated', 'Matched', 'Failed', 'Settled', 'Rejected'];
const currencies = ['USD', 'EUR', 'GBP', 'JPY'];

const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomItem = arr => arr[Math.floor(Math.random() * arr.length)];
const randomNum = (min, max) => Math.random() * (max - min) + min;

const seed = async () => {
  try {
    await connectDB();
    await Promise.all([User.deleteMany(), Trade.deleteMany(), Exception.deleteMany(), Notification.deleteMany()]);
    console.log('Cleared existing data');

    const users = await User.create([
      { firstName: 'Admin', lastName: 'User', email: 'admin@enterprise.com', password: 'Admin@123', role: 'administrator', department: 'IT Operations' },
      { firstName: 'Sarah', lastName: 'Mitchell', email: 'sarah.mitchell@enterprise.com', password: 'Lead@123', role: 'team_lead', department: 'Trade Operations' },
      { firstName: 'James', lastName: 'Chen', email: 'james.chen@enterprise.com', password: 'Analyst@123', role: 'analyst', department: 'Post Trade' },
      { firstName: 'Emma', lastName: 'Rodriguez', email: 'emma.rodriguez@enterprise.com', password: 'Analyst@123', role: 'analyst', department: 'Reconciliation' },
      { firstName: 'Michael', lastName: 'Thompson', email: 'michael.thompson@enterprise.com', password: 'Lead@123', role: 'team_lead', department: 'Settlement' },
    ]);
    console.log(`Created ${users.length} users`);

    const trades = [];
    const now = new Date();
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 150; i++) {
      const asset = randomItem(assets);
      const tradeDate = randomDate(sixtyDaysAgo, now);
      const settlementDate = new Date(tradeDate.getTime() + 2 * 24 * 60 * 60 * 1000);
      const status = randomItem(statuses);
      const price = parseFloat(randomNum(10, 5000).toFixed(2));
      const quantity = Math.floor(randomNum(100, 10000));
      const trade = {
        buyer: randomItem(counterparties),
        seller: randomItem(counterparties),
        assetType: asset.type,
        assetSymbol: asset.symbol,
        assetName: asset.name,
        price,
        quantity,
        totalValue: price * quantity,
        currency: randomItem(currencies),
        tradeDate,
        settlementDate,
        broker: randomItem(brokers),
        counterparty: randomItem(counterparties),
        status,
        validationStatus: ['Validated', 'Matched', 'Settled'].includes(status) ? 'Passed' : status === 'Failed' ? 'Failed' : 'Pending',
        matchStatus: ['Matched', 'Settled'].includes(status) ? 'Matched' : status === 'Failed' ? 'Failed' : 'Unmatched',
        riskLevel: randomItem(['Low', 'Low', 'Medium', 'Medium', 'High', 'Critical']),
        createdBy: randomItem(users)._id,
        source: randomItem(['Manual', 'API', 'Import']),
      };
      if (status === 'Settled') {
        trade.settlementDetails = { settledAt: new Date(), settlementRef: `SET-${Date.now()}-${i}`, processingTime: Math.floor(randomNum(5, 120)) };
      }
      trades.push(trade);
    }
    const createdTrades = await Trade.insertMany(trades);
    console.log(`Created ${createdTrades.length} trades`);

    const exceptions = [];
    const excTypes = ['Price Mismatch', 'Quantity Mismatch', 'Missing Trade', 'Duplicate Trade', 'Validation Failed', 'Settlement Failed'];
    const priorities = ['Critical', 'High', 'Medium', 'Low'];
    const excStatuses = ['Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'];
    const failedTrades = createdTrades.filter(t => ['Failed', 'Rejected'].includes(t.status)).slice(0, 30);

    for (let i = 0; i < Math.min(40, failedTrades.length + 10); i++) {
      const trade = failedTrades[i % failedTrades.length] || createdTrades[i];
      const type = randomItem(excTypes);
      exceptions.push({
        exceptionId: `EXC-${Date.now()}-${i.toString().padStart(4,'0')}`,
        trade: trade._id,
        tradeId: trade.tradeId,
        type,
        priority: randomItem(priorities),
        status: randomItem(excStatuses),
        title: `${type} - ${trade.tradeId}`,
        description: `Automated exception: ${type} detected for trade ${trade.tradeId}`,
        assignedTo: randomItem(users)._id,
        createdBy: randomItem(users)._id,
        dueDate: new Date(Date.now() + randomNum(1, 7) * 24 * 60 * 60 * 1000)
      });
    }
    await Exception.insertMany(exceptions);
    console.log(`Created ${exceptions.length} exceptions`);

    console.log('\n=== SEED COMPLETE ===');
    console.log('Login credentials:');
    console.log('Admin:     admin@enterprise.com     / Admin@123');
    console.log('Team Lead: sarah.mitchell@enterprise.com / Lead@123');
    console.log('Analyst:   james.chen@enterprise.com    / Analyst@123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
