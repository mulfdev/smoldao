import Button from "~/components/Button";
import { useAccount, useReadContract, useSimulateContract, useWriteContract } from 'wagmi'
import { vaultAbi } from "~/abis/vault";
import { formatUnits } from 'viem'

export default function DepositPage() {


  const { address } = useAccount()

  const { data: simulateData, error: simulateError } = useSimulateContract({
    address: "0x39356f78560b0DCFE6Bd816ac68a285C2a567bb5",
    abi: vaultAbi,
    functionName: "deposit",
    args: [BigInt(1), BigInt(1)]
  })

  const { writeContract, error: writeError, isPending } = useWriteContract()

  const handleDeposit = async () => {
    try {
      console.log("Simulated data:", simulateData)

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

  const { data: nftBalance } = useReadContract({
    abi: [{
      inputs: [
        { name: "account", type: "address" },
        { name: "id", type: "uint256" }
      ],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function"
    }],
    address: '0x1e38AFBb2628943ABbDCDAb7151Fa84990930F4C',
    functionName: 'balanceOf',
    args: address ? [address, 1n] : undefined,
  })

  const { data: govBalance, isError, isLoading } = useReadContract({
    address: "0xCC07045bB0c75Db97BeB08bF704356190620A425",
    abi: [{
      constant: true,
      inputs: [{ name: '_owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: 'balance', type: 'uint256' }],
      type: 'function'
    },],
    functionName: 'balanceOf',
    args: [address],
  })
  if (!address) return <div>Please connect your wallet</div>

  const formattedBalance = formatUnits(govBalance ? govBalance : "", 18)

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl">Deposit NFTs to get governance tokens</h1>
      <p>NFT Holdings: {nftBalance ? nftBalance.toString() : null}</p>
      <p>Voting Power: {formattedBalance} </p>
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={handleDeposit}
          className="w-full md:w-fit"
        >
          Deposit
        </Button>

        <Button
          variant="secondary"
          onClick={() => console.log('Secondary button clicked')}
          className="w-full md:w-fit"
        >
          Withdraw
        </Button>
      </div>
    </div >
  )
}
