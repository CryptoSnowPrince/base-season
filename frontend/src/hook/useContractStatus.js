import { useEffect, useState } from "react";
import voteABI from "../assets/abi/vote.json";
import erc20ABI from "../assets/abi/erc20.json";
import Config from "src/settings/config";
import { useAccount, useConfig } from "wagmi";
import { multicall, getBalance } from '@wagmi/core'
import { formatUnits } from "viem";
import { REFETCH_INTERVAL, events, tokenCA, voteCA } from "../wagmi";

export function useContractStatus(refresh, id) {
  const [data, setData] = useState({
    items: [],
    ethBal: 0,
    tokenBal: 0,
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
        for (let idx = 0; idx < events[id].items.length; idx++) {
          contracts.push({
            address: voteCA,
            abi: voteABI,
            functionName: 'items',
            args: [events[id].items[idx]],
          })
        }

        contracts.push({
          address: nftContract,
          abi: nftABI,
          functionName: 'totalSupply',
        }, {
          address: nftContract,
          abi: nftABI,
          functionName: '_mintingSeason',
        }, {
          address: Config.BEPE,
          abi: erc20ABI,
          functionName: 'balanceOf',
          args: [Config.BEPE_WETH],
        }, {
          address: Config.WETH,
          abi: erc20ABI,
          functionName: 'balanceOf',
          args: [Config.BEPE_WETH],
        },)

        if (account.address) {
          for (let idx = 0; idx < len; idx++) {
            contracts.push({
              address: stakeContract,
              abi: stakeABI,
              functionName: 'userInfo',
              args: [Config.POOL[idx].pid, account.address],
            }, {
              address: stakeContract,
              abi: stakeABI,
              functionName: 'pendingRewards',
              args: [Config.POOL[idx].pid, account.address],
            }, {
              address: Config.POOL[idx].token,
              abi: erc20ABI,
              functionName: 'balanceOf',
              args: [account.address],
            }, {
              address: Config.POOL[idx].token,
              abi: erc20ABI,
              functionName: 'allowance',
              args: [account.address, Config.STAKE],
            },)
          }
          contracts.push({
            address: tokenContract,
            abi: erc20ABI,
            functionName: 'balanceOf',
            args: [account.address],
          }, {
            address: nftContract,
            abi: nftABI,
            functionName: 'walletOfOwner',
            args: [account.address],
          }, {
            address: nftContract,
            abi: nftABI,
            functionName: 'topHolders',
            args: [account.address],
          }, {
            address: nftContract,
            abi: nftABI,
            functionName: 'whitelists',
            args: [account.address],
          },)
        }
        const _d = await multicall(config, {
          contracts
        })
        // console.log('_d', _d)

        let ethBal = 0;
        if (account.address) {
          const ethRawBalance = await getBalance(config, { address: account.address })
          ethBal = parseFloat(formatUnits(ethRawBalance.value, ethRawBalance.decimals))
        }

        const ethPriceInUSD = await getEthPriceInUSD();
        const wethBal = _d[3 * len + 2].status === "success" ? parseFloat(formatUnits(_d[3 * len + 2].result, Config.WETH_DEC)) : 0;
        const bepeBal = _d[3 * len + 3].status === "success" ? parseFloat(formatUnits(_d[3 * len + 3].result, Config.BEPE_DEC)) : 0;
        const bepePriceInUSD = bepeBal > 0 ? (ethPriceInUSD * wethBal / bepeBal) : 0;

        const sData = []
        for (let idx = 0; idx < len; idx++) {
          const sDataItem = {
            pid: Config.POOL[idx].pid,
            isBepe: Config.POOL[idx].isBepe,
            poolAmount: _d[3 * idx].status === "success" ? parseFloat(formatUnits(_d[3 * idx].result[4], Config.POOL[idx].decimals)) : 0,
            poolLockDays: _d[3 * idx].status === "success" ? _d[3 * idx].result[2] : 0,
            userAmount: account.address && _d[3 * len + 4 + 4 * idx].status === "success" ? parseFloat(formatUnits(_d[3 * len + 4 + 4 * idx].result[0], Config.POOL[idx].decimals)) : 0,
            userEndTime: account.address && _d[3 * len + 4 + 4 * idx].status === "success" ? formatUnits(_d[3 * len + 4 + 4 * idx].result[1], 0) : 0,
            userLastCTime: account.address && _d[3 * len + 4 + 4 * idx].status === "success" ? formatUnits(_d[3 * len + 4 + 4 * idx].result[2], 0) : 0,
            pendingReward: account.address && _d[3 * len + 5 + 4 * idx].status === "success" ? parseFloat(formatUnits(_d[3 * len + 5 + 4 * idx].result, Config.BEPE_DEC)) : 0,
            tokenBal: account.address && _d[3 * len + 6 + 4 * idx].status === "success" ? parseFloat(formatUnits(_d[3 * len + 6 + 4 * idx].result, Config.POOL[idx].decimals)) : 0,
            tokenAllowance: account.address && _d[3 * len + 7 + 4 * idx].status === "success" ? parseFloat(formatUnits(_d[3 * len + 7 + 4 * idx].result, Config.POOL[idx].decimals)) : 0,
            poolAmountInUSD: 0,
            userAmountInUSD: 0,
            apy: 0,
          }

          if (!Config.POOL[idx].isBepe) {
            const tokenAPriceInUSD = parseFloat((await axios.get(Config.POOL[idx].tokenAPriceAPI)).data.result.ethusd)
            // console.log('tokenAPriceInUSD', tokenAPriceInUSD)
            const poolLpSupply = _d[3 * idx + 1].status === "success" ? parseFloat(formatUnits(_d[3 * idx + 1].result, Config.POOL[idx].decimals)) : 0;
            const poolTokenAAmount = _d[3 * idx + 2].status === "success" ? parseFloat(formatUnits(_d[3 * idx + 2].result, Config.POOL[idx].decimalsA)) : 0;
            const lpPriceInUSD = poolLpSupply > 0 ? tokenAPriceInUSD * poolTokenAAmount / poolLpSupply : 0;
            sDataItem.poolAmountInUSD = poolLpSupply > 0 ? tokenAPriceInUSD * poolTokenAAmount * sDataItem.poolAmount / poolLpSupply : 0;
            sDataItem.userAmountInUSD = poolLpSupply > 0 ? tokenAPriceInUSD * poolTokenAAmount * sDataItem.userAmount / poolLpSupply : 0;
            // console.log('lp apy bepePriceInUSD', bepePriceInUSD)
            // console.log('lp apy lpPriceInUSD', lpPriceInUSD)
            sDataItem.apy = lpPriceInUSD > 0 ? (1 + Config.POOL[idx].rpbt * bepePriceInUSD / lpPriceInUSD) ** 365 * 100 - 100 : 99999999
          } else {
            sDataItem.poolAmountInUSD = bepePriceInUSD * sDataItem.poolAmount;
            sDataItem.userAmountInUSD = bepePriceInUSD * sDataItem.userAmount;
            sDataItem.apy = (1 + Config.POOL[idx].rpbt) ** 365 * 100 - 100
          }
          sData.push(sDataItem)
        }

        const nftData = {
          totalSupply: _d[3 * len].status === "success" ? formatUnits(_d[3 * len].result, 0) : 0,
          mintingSeason: _d[3 * len + 1].status === "success" ? Number(_d[3 * len + 1].result, 0) : 0,
          isTopHolder: account.address && _d[7 * len + 6].status === "success" ? _d[7 * len + 6].result : false,
          isWhitelist: account.address && _d[7 * len + 7].status === "success" ? _d[7 * len + 7].result : false,
          walletOfOwner: account.address && _d[7 * len + 5].status === "success" ? _d[7 * len + 5].result : [],
        }

        const userBal = {
          ethBal,
          rTokenBal: account.address && _d[7 * len + 4].status === "success" ? parseFloat(formatUnits(_d[7 * len + 4].result, Config.BEPE_DEC)) : 0,
        }

        const bepePoolAmount = sData.filter(item => item.isBepe).reduce((sum, item) => sum + item.poolAmount, 0)
        const bepeUserAmount = sData.filter(item => item.isBepe).reduce((sum, item) => sum + item.userAmount, 0)
        const bepePoolAmountInUSD = sData.filter(item => item.isBepe).reduce((sum, item) => sum + item.poolAmountInUSD, 0)
        const bepeUserAmountInUSD = sData.filter(item => item.isBepe).reduce((sum, item) => sum + item.userAmountInUSD, 0)
        const otherPoolAmountInUSD = sData.filter(item => !item.isBepe).reduce((sum, item) => sum + item.poolAmountInUSD, 0)
        const otherUserAmountInUSD = sData.filter(item => !item.isBepe).reduce((sum, item) => sum + item.userAmountInUSD, 0)

        // console.log('lp apy sData', sData)

        setData({
          sData,
          bepePriceInUSD,
          ethPriceInUSD,
          bepePoolAmount,
          bepeUserAmount,
          bepePoolAmountInUSD,
          bepeUserAmountInUSD,
          otherPoolAmountInUSD,
          otherUserAmountInUSD,
          userBal,
          nftData,
        })
      } catch (error) {
        console.log('useContractStatus err', error)
      }
    };
    fetchData();
  }, [account.address, refetch, refresh, id, config])

  return data
}
