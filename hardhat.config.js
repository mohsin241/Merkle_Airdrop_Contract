require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks:{
    sepolia:{
      accounts:[process.env.privatekey],
      url:process.env.rpc
    }
  },
  etherscan:{
    apiKey:{
      sepolia: process.env.etherscan
    }
  }
};
