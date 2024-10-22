import { useEffect, useState } from "react";
import voteABI from "../assets/abi/vote.json";
import erc20ABI from "../assets/abi/erc20.json";
import multicallABI from "../assets/abi/multicall.json";
import { useAccount, useConfig } from "wagmi";
import { multicall } from '@wagmi/core'
import { formatUnits } from "viem";
import { REFETCH_INTERVAL, events, multicallCA, tokenCA, voteCA } from "../wagmi";

export function useContractStatus(refresh, id) {
  const [data, setData] = useState({
    projects: [],
    votes: [],
    tokenBal: 0,
    tokenAllowance: 0,
    ethBal: 0,
  })
  const account = useAccount()
  const config = useConfig()

  const [refetch, setRefetch] = useState(false)

  useEffect(() => {
    const timerID = setInterval(() => {
      setRefetch((prevData) => {
        return !prevData;
      })
    }, REFETCH_INTERVAL);

    return () => {
      clearInterval(timerID);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contracts = []
        const length = events[id].items.length
        for (let idx = 0; idx < length; idx++) {
          contracts.push({
            address: voteCA,
            abi: voteABI,
            functionName: 'items',
            args: [events[id].items[idx]],
          })
        }

        if (account?.address) {
          contracts.push({
            address: tokenCA,
            abi: erc20ABI,
            functionName: 'balanceOf',
            args: [account.address],
          }, {
            address: tokenCA,
            abi: erc20ABI,
            functionName: 'allowance',
            args: [account.address, voteCA],
          }, {
            address: multicallCA,
            abi: multicallABI,
            functionName: "getEthBalance",
            args: [account.address]
          })
        }
        const _d = await multicall(config, {
          contracts
        })
        // console.log('_d', _d)

        const projects = []
        const votes = []
        for (let idx = 0; idx < length; idx++) {
          projects.push(_d[idx].status === "success" ? _d[idx].result[0] : '')
          votes.push(_d[idx].status === "success" ? parseFloat(formatUnits(_d[idx].result[1], 18)) : 0)
        }
        const tokenBal = account?.address && _d[length].status === "success" ? parseFloat(formatUnits(_d[length].result, 18)) : 0;
        const tokenAllowance = account?.address && _d[length + 1].status === "success" ? parseFloat(formatUnits(_d[length + 1].result, 18)) : 0;
        const ethBal = account?.address && _d[length + 2].status === "success" ? parseFloat(formatUnits(_d[length + 2].result, 18)) : 0;

        setData({
          projects,
          votes,
          tokenBal,
          tokenAllowance,
          ethBal
        })
      } catch (error) {
        console.log('useContractStatus err', error)
      }
    };
    fetchData();
  }, [account.address, refetch, refresh, id, config])

  return data
}
