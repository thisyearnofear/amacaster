import { useCallback, useState } from 'react'
import { useWriteContract, useChainId } from 'wagmi'
import { CONTRACTS } from '../config/contracts'
import { AMA_MATCHER_ABI } from '../config/abis'
import { keccak256, encodePacked } from 'viem'

// Helper function to encode matches into a compact format
function encodeMatches(
  matches: { questionHash: string; answerHash: string }[],
) {
  console.log('Encoding matches:', matches)
  // Create a mapping of all unique hashes to indices
  const hashToIndex = new Map<string, number>()
  let nextIndex = 0

  // Collect all unique hashes
  matches.forEach(({ questionHash, answerHash }) => {
    if (!hashToIndex.has(questionHash)) {
      hashToIndex.set(questionHash, nextIndex++)
    }
    if (!hashToIndex.has(answerHash)) {
      hashToIndex.set(answerHash, nextIndex++)
    }
  })

  console.log('Hash to index mapping:', Object.fromEntries(hashToIndex))

  // Create the encoded matches array
  const encodedMatches = matches.map(({ questionHash, answerHash }) => {
    const qIndex = hashToIndex.get(questionHash)!
    const aIndex = hashToIndex.get(answerHash)!
    // Pack indices into a single bytes32
    return keccak256(
      encodePacked(['uint256', 'uint256'], [BigInt(qIndex), BigInt(aIndex)]),
    )
  })

  console.log('Encoded matches:', encodedMatches)
  return encodedMatches
}

export function useMatchSubmission() {
  const [error, setError] = useState<Error | null>(null)
  const chainId = useChainId()
  const {
    writeContract,
    isPending,
    isSuccess,
    reset: resetWrite,
  } = useWriteContract()

  // Check if we're on the correct network
  const isCorrectNetwork = chainId === CONTRACTS.AMAMatcher.chainId
  console.log('Contract config:', {
    address: CONTRACTS.AMAMatcher.address,
    chainId: CONTRACTS.AMAMatcher.chainId,
    currentChainId: chainId,
    isCorrectNetwork,
  })

  const submitMatches = useCallback(
    async (
      castHash: string,
      matches: { questionHash: string; answerHash: string }[],
      rankings: number[],
    ) => {
      try {
        console.log('Starting match submission...')
        console.log('Cast hash:', castHash)
        console.log('Matches:', matches)
        console.log('Rankings:', rankings)

        if (!CONTRACTS.AMAMatcher.address) {
          throw new Error('Contract address not configured')
        }

        setError(null)
        resetWrite()

        if (!isCorrectNetwork) {
          throw new Error('Please switch to Optimism Sepolia network')
        }

        if (!matches.length) {
          throw new Error('No matches to submit')
        }

        // Create AMA ID from cast hash
        const amaId = keccak256(encodePacked(['string'], [castHash]))
        console.log('Generated AMA ID:', amaId)

        // Create encoded match hashes
        const matchHashes = encodeMatches(matches)
        console.log('Encoded match hashes:', matchHashes)

        // Convert rankings to bigints
        const rankingsBigInt = rankings.map(BigInt)
        console.log('Rankings as BigInt:', rankingsBigInt)

        // Submit to contract
        console.log('Submitting to contract:', {
          address: CONTRACTS.AMAMatcher.address,
          functionName: 'submitMatch',
          args: [amaId, matchHashes, rankingsBigInt],
        })

        const hash = await writeContract({
          address: CONTRACTS.AMAMatcher.address,
          abi: AMA_MATCHER_ABI,
          functionName: 'submitMatch',
          args: [amaId, matchHashes, rankingsBigInt],
        })

        console.log('Transaction submitted:', hash)
        return hash
      } catch (error) {
        console.error('Error in submitMatches:', error)
        setError(error instanceof Error ? error : new Error('Unknown error'))
        throw error
      }
    },
    [isCorrectNetwork, writeContract, resetWrite],
  )

  return {
    submitMatches,
    isCorrectNetwork,
    isLoading: isPending,
    isSuccess,
    error,
  }
}
