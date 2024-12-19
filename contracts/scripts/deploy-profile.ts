import { ethers, run } from 'hardhat'

async function main() {
  console.log('Deploying UserProfile contract...')

  const UserProfile = await ethers.getContractFactory('UserProfile')
  const userProfile = await UserProfile.deploy()

  await userProfile.waitForDeployment()

  const address = await userProfile.getAddress()
  console.log('UserProfile deployed to:', address)

  // Wait for a few block confirmations
  console.log('Waiting for block confirmations...')
  await userProfile.deploymentTransaction()?.wait(5)

  // Verify the contract on Etherscan
  console.log('Verifying contract on Etherscan...')
  try {
    await run('verify:verify', {
      address: address,
      constructorArguments: [],
    })
    console.log('Contract verified successfully')
  } catch (error) {
    console.error('Error verifying contract:', error)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
