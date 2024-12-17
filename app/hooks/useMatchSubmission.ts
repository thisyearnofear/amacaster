import {
  useWriteContract,
  useWatchContractEvent,
  useSimulateContract,
} from 'wagmi'
import { useCallback } from 'react'
import { keccak256, encodePacked } from 'viem'
import { CONTRACTS } from '../config/contracts'
import { AMA_MATCHER_ABI } from '../config/abis'

export function useMatchSubmission() {
  const { writeContract, isError, isPending, isSuccess } = useWriteContract()

  const { data: simulateData } = useSimulateContract({
    address: CONTRACTS.AMAMatcher.address,
    abi: AMA_MATCHER_ABI,
    functionName: 'submitMatch',
  })

  const submitMatches = useCallback(
    async (
      castHash: string,
      matches: { questionHash: string; answerHash: string }[],
      rankings: number[],
    ) => {
      try {
        // Create AMA ID from cast hash
        const amaId = keccak256(encodePacked(['string'], [castHash]))

        // Create match hashes
        const matchHashes = matches.map(({ questionHash, answerHash }) =>
          keccak256(
            encodePacked(['string', 'string'], [questionHash, answerHash]),
          ),
        )

        // Convert rankings to bigints
        const rankingsBigInt = rankings.map(BigInt)

        // Submit to contract
        await writeContract({
          address: CONTRACTS.AMAMatcher.address,
          abi: AMA_MATCHER_ABI,
          functionName: 'submitMatch',
          args: [amaId, matchHashes, rankingsBigInt],
        })
      } catch (error) {
        console.error('Error submitting matches:', error)
        throw error
      }
    },
    [writeContract],
  )

  return {
    submitMatches,
    isLoading: isPending,
    isSuccess,
    isError,
  }
}
