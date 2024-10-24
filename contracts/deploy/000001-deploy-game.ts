import 'dotenv/config'
import { DeployFunction } from 'hardhat-deploy/types'
import {ethers} from 'hardhat'

const deployer: DeployFunction = async hre => {
  if (hre.network.config.chainId !== 31337) return
  const { deployer } = await hre.getNamedAccounts()
  let collectionName = "ST01";
  let cardCount = 17;
  

  const mainDeployment =  await hre.deployments.deploy('Main', { from: deployer, log: true })
  await ethers.getContractAt('Main', mainDeployment.address);

}

export default deployer
