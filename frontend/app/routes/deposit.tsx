import Button from "~/components/Button";
import { useAccount, useReadContract, useReadContracts, useSimulateContract, useWriteContract } from 'wagmi'
import { vaultAbi } from "~/abis/vault";
import { formatUnits } from 'viem'
import { useMemo } from 'react'

export default function DepositPage() {
  const { address } = useAccount()

  const { data: simulateData, error: simulateError } = useSimulateContract({
    address: "0x39356f78560b0DCFE6Bd816ac68a285C2a567bb5",
    abi: vaultAbi,
    functionName: "deposit",
    args: [BigInt(1), BigInt(1)]
  })

  const { writeContract, isPending } = useWriteContract()

  const handleDeposit = async () => {
    try {
      if (!simulateData?.request) {
        console.error("Simulation failed:", simulateError)
        return
      }

      const result = writeContract(simulateData.request)
      console.log("Transaction submitted:", result)
    } catch (err) {
      console.error("Contract error:", err)
    }
  }

  const { data: contractData, isError, isLoading } = useReadContracts({
    contracts: [
      {
        abi: [{
          inputs: [
            { name: "account", type: "address" },
            { name: "id", type: "uint256" }
          ],
          name: "balanceOf",
          outputs: [{ name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function"
        }] as const,
        address: '0x1e38AFBb2628943ABbDCDAb7151Fa84990930F4C',
        functionName: 'balanceOf',
        args: address ? [address, 1n] : undefined,
      },
      {
        address: "0xCC07045bB0c75Db97BeB08bF704356190620A425",
        abi: [{
          constant: true,
          inputs: [{ name: '_owner', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: 'balance', type: 'uint256' }],
          type: 'function'
        }] as const,
        functionName: 'balanceOf',
        args: [address],
      }
    ],
    // Add caching configuration
    query: {
      staleTime: 30_000, // Consider data fresh for 30 seconds
      gcTime: 5 * 60_000, // Keep in cache for 5 minutes
    }
  })

  const [nftBalance, govBalance] = contractData || []

  // Memoize formatted balance calculation
  const formattedBalance = useMemo(() => {
    if (isError || isLoading || !govBalance?.result) return ""
    if (typeof govBalance.result !== "bigint") return ""
    return formatUnits(govBalance.result, 18)
  }, [govBalance, isError, isLoading])

  if (!address) return <div>Please connect your wallet</div>

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl">Deposit NFTs to get governance tokens</h1>
      <p>NFT Holdings: {nftBalance?.result ? nftBalance.result.toString() : null}</p>
      <p>Voting Power: {formattedBalance}</p>
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={handleDeposit}
          className="w-full md:w-fit"
          disabled={isPending}
        >
          {isPending ? 'Depositing...' : 'Deposit'}
        </Button>

        <Button
          variant="secondary"
          onClick={() => console.log('Secondary button clicked')}
          className="w-full md:w-fit"
        >
          Withdraw
        </Button>
      </div>
    </div>
  )
}
