import { ethers, run, network } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

async function main() {
  const [deployer]: HardhatEthersSigner[] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  const balance = await deployer.provider.getBalance(deployer.address)
  console.log('Account balance:', ethers.formatEther(balance))

  const AMAMatcher = await ethers.getContractFactory('AMAMatcher')
  const amaMatcher = await AMAMatcher.deploy()
  await amaMatcher.waitForDeployment()

  const address = await amaMatcher.getAddress()
  console.log('AMAMatcher deployed to:', address)

  // Verify the contract on Etherscan if we're on a live network
  if (network.name !== 'hardhat' && network.name !== 'localhost') {
    console.log('Waiting for block confirmations...')
    await amaMatcher.deploymentTransaction()?.wait(5)

    console.log('Verifying contract...')
    try {
      await run('verify:verify', {
        address: address,
        constructorArguments: [],
      })
      console.log('Contract verified successfully')
    } catch (error) {
      console.log('Error verifying contract:', error)
    }
  }

  // Log deployment info for frontend configuration
  console.log('\nDeployment Info:')
  console.log('=================')
  console.log('Network:', network.name)
  console.log('Contract Address:', address)
  console.log('Block Explorer:', getBlockExplorer(network.name))
}

function getBlockExplorer(networkName: string): string {
  switch (networkName) {
    case 'optimism-sepolia':
      return 'https://sepolia-optimism.etherscan.io'
    default:
      return ''
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
