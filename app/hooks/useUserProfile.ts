import { useEffect, useState } from 'react'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { useNeynarUser } from './useNeynarUser'
import { type Hash } from 'viem'
import { type OnChainProfile, type UserProfile } from '../types'

const CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_PROFILE_CONTRACT_ADDRESS as `0x${string}`

const ABI = [
  {
    name: 'createProfile',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_fid', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'updateProfile',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_matchesSubmitted', type: 'uint256' },
      { name: '_score', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'getProfile',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_fid', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'fid', type: 'uint256' },
          { name: 'walletAddress', type: 'address' },
          { name: 'matchesSubmitted', type: 'uint256' },
          { name: 'totalScore', type: 'uint256' },
          { name: 'achievementFlags', type: 'uint256' },
          { name: 'lastUpdated', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'getProfileByAddress',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_address', type: 'address' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'fid', type: 'uint256' },
          { name: 'walletAddress', type: 'address' },
          { name: 'matchesSubmitted', type: 'uint256' },
          { name: 'totalScore', type: 'uint256' },
          { name: 'achievementFlags', type: 'uint256' },
          { name: 'lastUpdated', type: 'uint256' },
        ],
      },
    ],
  },
] as const

interface UseUserProfileReturn {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  createUserProfile: () => Promise<Hash | undefined>
  updateUserProfile: (
    matchesSubmitted: number,
    score: number,
  ) => Promise<Hash | undefined>
  isLoading: boolean
}

export function useUserProfile(): UseUserProfileReturn {
  const { address } = useAccount()
  const { neynarUser } = useNeynarUser()
  const [profile, setProfile] = useState<OnChainProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Read profile data
  const { data: profileData, error: readError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getProfileByAddress',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Contract writes
  const { writeContractAsync: writeCreateProfile, data: createTxHash } =
    useWriteContract()
  const { writeContractAsync: writeUpdateProfile, data: updateTxHash } =
    useWriteContract()

  // Transaction receipts
  const { isLoading: isWaitingCreate } = useWaitForTransactionReceipt({
    hash: createTxHash,
  })

  const { isLoading: isWaitingUpdate } = useWaitForTransactionReceipt({
    hash: updateTxHash,
  })

  // Effect to set profile data
  useEffect(() => {
    if (profileData) {
      const data = profileData as unknown as {
        fid: bigint
        walletAddress: `0x${string}`
        matchesSubmitted: bigint
        totalScore: bigint
        achievementFlags: bigint
        lastUpdated: bigint
      }

      setProfile({
        fid: data.fid,
        walletAddress: data.walletAddress,
        matchesSubmitted: data.matchesSubmitted,
        totalScore: data.totalScore,
        achievementFlags: data.achievementFlags,
        lastUpdated: data.lastUpdated,
      })
      setLoading(false)
    }
  }, [profileData])

  // Effect to handle read errors
  useEffect(() => {
    if (readError) {
      setError('Failed to load profile data')
      setLoading(false)
    }
  }, [readError])

  // Function to create user profile
  const createUserProfile = async (): Promise<Hash | undefined> => {
    if (!neynarUser?.fid) {
      throw new Error('No Farcaster ID found')
    }

    try {
      const hash = await writeCreateProfile({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'createProfile',
        args: [BigInt(neynarUser.fid)],
      })
      return hash
    } catch (err) {
      console.error('Error creating profile:', err)
      throw err
    }
  }

  // Function to update user profile
  const updateUserProfile = async (
    matchesSubmitted: number,
    score: number,
  ): Promise<Hash | undefined> => {
    try {
      const hash = await writeUpdateProfile({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'updateProfile',
        args: [BigInt(matchesSubmitted), BigInt(score)],
      })
      return hash
    } catch (err) {
      console.error('Error updating profile:', err)
      throw err
    }
  }

  return {
    profile: profile
      ? {
          fid: Number(profile.fid),
          walletAddress: profile.walletAddress,
          matchesSubmitted: Number(profile.matchesSubmitted),
          totalScore: Number(profile.totalScore),
          achievementFlags: Number(profile.achievementFlags),
          lastUpdated: Number(profile.lastUpdated),
        }
      : null,
    loading,
    error,
    createUserProfile,
    updateUserProfile,
    isLoading: isWaitingCreate || isWaitingUpdate,
  }
}
