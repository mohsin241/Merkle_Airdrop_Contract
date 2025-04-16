const { expect } = require("chai");
const keccak256 = require("keccak256")
const {MerkleTree} = require("merkletreejs");
const AirdropToken = require("../ignition/modules/AirdropToken");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
describe(" MerkleDistributor", function(){
  
 async function deployment(){
    const [signer1, signer2, signer3, signer4, signer5] = await ethers.getSigners();
    walletAddresses = [signer1, signer2, signer3, signer4, signer5].map((s) => s.address)
    console.log(walletAddresses)
    leaves = walletAddresses.map(x => keccak256(x))
    tree = new MerkleTree(leaves, keccak256, { sortPairs: true })
    airdropToken = await ethers.getContractFactory('AirdropToken', signer1);
    token = await airdropToken.deploy(signer1.address);
    MerkleDistributor = await ethers.getContractFactory('MerkleDistributor', signer1);
    distributor = await MerkleDistributor.deploy(token.target, tree.getHexRoot(), 100);
    await token.connect(signer1).mint(
      distributor.target,
      '4000'
    )
   return{signer1, tree, keccak256}
  }; 
  
describe("5 account tree", ()=>{
  it("successful and unsuccessful claim", async() => {
    const {signer1, tree, keccak256} = await loadFixture(deployment)
    
    expect(await token.balanceOf(signer1.address)).to.be.equal(0)

    const proof = tree.getHexProof(keccak256(signer1.address))

    await distributor.connect(signer1).claim(proof)

    expect(await token.balanceOf(signer1.address)).to.be.equal(100)

    expect(
          distributor.connect(signer1).claim(proof)
        ).to.be.revertedWith(
          'MerkleDistributor: Drop already claimed.'
        )

     expect(await token.balanceOf(signer1.address)).to.be.equal(100)
  })
})

it('unsuccessful claim', async () => {
  const {signer1, tree, keccak256} = await loadFixture(deployment)
  const generatedAddress = '0x4dE8dabfdc4D5A508F6FeA28C6f1B288bbdDc26e'
  const proof2 = tree.getHexProof(keccak256(generatedAddress))

  expect(
      distributor.connect(signer1).claim(proof2)
    ).to.be.revertedWith(
      'MerkleDistributor: Invalid proof.'
    )
})

it('emits a successful event', async () => {
  const {signer1, tree, keccak256} = await loadFixture(deployment)
  const proof = tree.getHexProof(keccak256(signer1.address))

  await expect(distributor.connect(signer1).claim(proof))
    .to.emit(distributor, 'Claimed')
    .withArgs(signer1.address, 100)
})


 

})