const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("AirdropTokenModule", (m) => {
    const deployer= m.getAccount(0);
    const airdropToken = m.contract("AirdropToken", [deployer]);
  
    return { airdropToken };
});
