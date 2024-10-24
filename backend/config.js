const maindeploy = require('../contracts/deployments/localhost/Main.json');

const contractAddress = maindeploy.address;
const contractAbi = maindeploy.abi;

module.exports = {
  contractAddress,
  contractAbi,
};