'use strict';

const URI = 'https://ethgasstation.info/json/ethgasAPI.json'
const rp = require('request-promise-native')
const dynamodb = require('./infrastructure/dynamodb');

module.exports.updatePrice = async (event, context, callback) => {

  try {
    let gasPrice = await getGasPrice();
    await writeDB(gasPrice)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Gas price updated',
        input: event,
      }),
    };
  } catch (err) {
    callback(err, null)
  }
};

async function getGasPrice() {
  let egs = await rp(URI)
  return (JSON.parse(egs))
}

async function writeDB(r) {
  const timestamp = new Date().getTime();
  const ttl = new Date().setDate(new Date().getDate() + 1);
  var params = {
    TableName: 'EtherGasPrice',
    Item: {
      network: 'mainnet',
      timestamp: timestamp,
      'fast': r.fast,
      'safeLowWait': r.safeLowWait,
      'block_time': r.block_time,
      'average': r.average,
      'avgWait': r.avgWait,
      'blockNum': r.blockNum,
      'fastestWait': r.fastestWait,
      'fastWait': r.fastWait,
      'speed': r.speed,
      'fastest': r.fastest,
      'safeLow': r.safeLow,
      'ttl': ttl.toString()
    },
};

try {
  await dynamodb.put(params).promise()
} catch (e) {
  console.log(e)
}

}