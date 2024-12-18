import { useCallback, useState } from 'react'
import { useWriteContract, useChainId } from 'wagmi'
import { CONTRACTS } from '../config/contracts'
import { AMA_MATCHER_ABI } from '../config/abis'
import { keccak256, encodePacked } from 'viem'

// Helper function to encode matches into a compact format
function encodeMatches(
  matches: { questionHash: string; answerHash: string }[],
) {
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

  // Create the encoded matches array
  const encodedMatches = matches.map(({ questionHash, answerHash }) => {
    const qIndex = hashToIndex.get(questionHash)!
    const aIndex = hashToIndex.get(answerHash)!
    // Pack indices into a single bytes32
    return keccak256(
      encodePacked(['uint256', 'uint256'], [BigInt(qIndex), BigInt(aIndex)]),
    )
  })

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

  const submitMatches = useCallback(
    async (
      castHash: string,
      matches: { questionHash: string; answerHash: string }[],
      rankings: number[],
    ) => {
      try {
        setError(null)
        resetWrite()

        if (!isCorrectNetwork) {
          throw new Error('Please switch to Optimism Sepolia network')
        }

        // Create AMA ID from cast hash
        const amaId = keccak256(encodePacked(['string'], [castHash]))

        // Create encoded match hashes
        const matchHashes = encodeMatches(matches)

        // Convert rankings to bigints
        const rankingsBigInt = rankings.map(BigInt)

        // Submit to contract
        const hash = await writeContract({
          address: CONTRACTS.AMAMatcher.address,
          abi: AMA_MATCHER_ABI,
          functionName: 'submitMatch',
          args: [amaId, matchHashes, rankingsBigInt],
        })

        console.log('Transaction submitted:', hash)
        return hash
      } catch (error) {
        console.error('Error submitting matches:', error)
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
