import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { setAll } from "src/helpers";
import { clearPendingTxn, fetchPendingTxns } from "./PendingTxnsSlice";
import { fetchAccountSuccess, getBalances } from "./AccountSlice";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as votingEscrow } from "../abi/VotingEscrow.json";
import { abi as votingEscrowHelper } from "../abi/VotingEscrowHelper.json";
import { abi as feeDistributor } from "../abi/FeeDistributor.json";
import { abi as wsSquid } from "../abi/wsSQUID.json";
import { abi as feeClaimHelper } from "../abi/FeeClaimHelper.json";
import { error, info } from "./MessagesSlice";
import { RootState } from "src/store";
import { BigNumber, ethers } from "ethers";
import {
  IJsonRPCError,
  IBaseAddressAsyncThunk,
  ICreateLockThunk,
  IIncreaseAmountThunk,
  IIncreaseUnlockTimeThunk,
  IWithdrawThunk,
  IBaseAsyncThunk,
} from "./interfaces";

export const loadDetails = createAsyncThunk(
  "votingEscrow/loadDetails",
  async ({ address, networkID, provider }: IBaseAddressAsyncThunk) => {
    const votingEscrowContract = new ethers.Contract(
      addresses[networkID].VOTING_ESCROW_ADDRESS,
      votingEscrow,
      provider,
    );
    const feeDistributorContract = new ethers.Contract(
      addresses[networkID].FEE_DISTRIBUTOR_ADDRESS,
      feeDistributor,
      provider,
    );
    const wethFeeDistributorContract = new ethers.Contract(
      addresses[networkID].WETH_FEE_DISTRIBUTOR_ADDRESS,
      feeDistributor,
      provider,
    );
    const wsSquidContract = new ethers.Contract(addresses[networkID].WSSQUID_ADDRESS, wsSquid, provider);

    const balance = await votingEscrowContract["balanceOf(address)"](address);
    const { amount: lockedWSSquidBalance, end: unlockTime } = await votingEscrowContract.locked(address);
    const totalSupply = await votingEscrowContract["totalSupply()"]();
    const supply = await votingEscrowContract.supply();
    const claimable = await feeDistributorContract.callStatic["claim(address)"](address);
    const wethClaimable = await wethFeeDistributorContract.callStatic["claim(address)"](address);
    const lockedBalance = await wsSquidContract.sSQUIDValue(lockedWSSquidBalance);
    // wsSQUIDValue of 1 sSQUID
    const wsSQUIDValue = await wsSquidContract.wsSQUIDValue(ethers.utils.parseUnits("1", "gwei"));

    return {
      stake: {
        balance: ethers.utils.formatEther(balance), // voting power
        lockedBalance: ethers.utils.formatUnits(lockedBalance, "gwei"),
        unlockTime: unlockTime.toString(),
        totalSupply: ethers.utils.formatEther(totalSupply),
        supply: ethers.utils.formatUnits(supply, "gwei"), // total locked balance
      },
      reward: {
        claimable: ethers.utils.formatEther(claimable),
        wethClaimable: ethers.utils.formatEther(wethClaimable),
      },
      value: {
        wsSquid: ethers.utils.formatEther(wsSQUIDValue),
      },
    };
  },
);

export const changeApproval = createAsyncThunk(
  "stake/changeApproval",
  async ({ provider, address, networkID }: IBaseAsyncThunk & { address: string }, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const sSquidContract = new ethers.Contract(addresses[networkID].SSQUID_ADDRESS, ierc20Abi, signer);
    let approveTx;
    try {
      approveTx = await sSquidContract.approve(
        addresses[networkID].VOTING_ESCROW_HELPER_ADDRESS,
        ethers.utils.parseUnits("1000000000", "gwei").toString(),
      );
      const text = "Approve Staking";
      const pendingTxnType = "approve_staking";
      dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));

      await approveTx.wait();
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
      }
    }

    const stakeAllowance = await sSquidContract.allowance(address, addresses[networkID].VOTING_ESCROW_HELPER_ADDRESS);
    return dispatch(
      fetchAccountSuccess({
        votingEscrow: {
          sohmStake: +stakeAllowance,
        },
      }),
    );
  },
);

export const createLock = createAsyncThunk(
  "votingEscrow/createLock",
  async ({ address, networkID, provider, sSQUIDAmount, unlockTime }: ICreateLockThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const votingEscrowHelperContract = new ethers.Contract(
      addresses[networkID].VOTING_ESCROW_HELPER_ADDRESS,
      votingEscrowHelper,
      signer,
    );
    let createLockTx;
    try {
      createLockTx = await votingEscrowHelperContract.createLock(sSQUIDAmount, BigNumber.from(unlockTime));
      const text = "Create Lock";
      const pendingTxnType = "create_lock";
      dispatch(fetchPendingTxns({ txnHash: createLockTx.hash, text, type: pendingTxnType }));

      await createLockTx.wait();
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
      return;
    } finally {
      if (createLockTx) {
        dispatch(clearPendingTxn(createLockTx.hash));
      }
    }

    dispatch(loadDetails({ address, networkID, provider }));
    dispatch(getBalances({ address, networkID, provider }));
  },
);

export const increaseAmount = createAsyncThunk(
  "votingEscrow/increaseAmount",
  async ({ address, networkID, provider, sSQUIDAmount }: IIncreaseAmountThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const votingEscrowHelperContract = new ethers.Contract(
      addresses[networkID].VOTING_ESCROW_HELPER_ADDRESS,
      votingEscrowHelper,
      signer,
    );
    let increaseAmountTx;
    try {
      increaseAmountTx = await votingEscrowHelperContract.increaseAmount(sSQUIDAmount);
      const text = "Increase Amount";
      const pendingTxnType = "increase_amount";
      dispatch(fetchPendingTxns({ txnHash: increaseAmountTx.hash, text, type: pendingTxnType }));

      await increaseAmountTx.wait();
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
      return;
    } finally {
      if (increaseAmountTx) {
        dispatch(clearPendingTxn(increaseAmountTx.hash));
      }
    }

    dispatch(loadDetails({ address, networkID, provider }));
  },
);

export const increaseUnlockTime = createAsyncThunk(
  "votingEscrow/increaseUnlockTime",
  async ({ address, networkID, provider, unlockTime }: IIncreaseUnlockTimeThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const votingEscrowContract = new ethers.Contract(addresses[networkID].VOTING_ESCROW_ADDRESS, votingEscrow, signer);
    let increaseUnlockTimeTx;
    try {
      increaseUnlockTimeTx = await votingEscrowContract.increase_unlock_time(unlockTime);
      const text = "Increase Unlock Time";
      const pendingTxnType = "increase_unlock_time";
      dispatch(fetchPendingTxns({ txnHash: increaseUnlockTimeTx.hash, text, type: pendingTxnType }));

      await increaseUnlockTimeTx.wait();
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
      return;
    } finally {
      if (increaseUnlockTimeTx) {
        dispatch(clearPendingTxn(increaseUnlockTimeTx.hash));
      }
    }

    dispatch(loadDetails({ address, networkID, provider }));
  },
);

export const withdraw = createAsyncThunk(
  "votingEscrow/withdraw",
  async ({ address, networkID, provider }: IWithdrawThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const votingEscrowHelperContract = new ethers.Contract(
      addresses[networkID].VOTING_ESCROW_HELPER_ADDRESS,
      votingEscrowHelper,
      signer,
    );
    let withdrawTx;
    try {
      withdrawTx = await votingEscrowHelperContract.withdraw();
      const text = "Withdraw";
      const pendingTxnType = "withdraw";
      dispatch(fetchPendingTxns({ txnHash: withdrawTx.hash, text, type: pendingTxnType }));

      await withdrawTx.wait();
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
      return;
    } finally {
      if (withdrawTx) {
        dispatch(clearPendingTxn(withdrawTx.hash));
      }
    }

    dispatch(loadDetails({ address, networkID, provider }));
  },
);

export const claim = createAsyncThunk(
  "votingEscrow/claim",
  async ({ address, networkID, provider }: IWithdrawThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const wsFeeDistributor = addresses[networkID].FEE_DISTRIBUTOR_ADDRESS;
    const wethFeeDistributor = addresses[networkID].WETH_FEE_DISTRIBUTOR_ADDRESS;

    const signer = provider.getSigner();
    const claimHelperContract = new ethers.Contract(
      addresses[networkID].FEE_DISTRIBUTOR_CLAIM_HELPER,
      feeClaimHelper,
      signer,
    );

    let claimTx;
    try {
      claimTx = await claimHelperContract.claim([wsFeeDistributor, wethFeeDistributor], address);
      const text = "Claim";
      const pendingTxnType = "claim";
      dispatch(fetchPendingTxns({ txnHash: claimTx.hash, text, type: pendingTxnType }));

      await claimTx.wait();
    } catch (e: unknown) {
      dispatch(error((e as IJsonRPCError).message));
      return;
    } finally {
      if (claimTx) {
        dispatch(clearPendingTxn(claimTx.hash));
      }
    }

    dispatch(loadDetails({ address, networkID, provider }));
  },
);

interface IVotingEscrowSlice {
  stake: {
    balance: string;
    lockedBalance: string;
    unlockTime: string;
    totalSupply: string;
    supply: string;
  };
  reward: {
    claimable: string;
    wethClaimable: string;
  };
  value: {
    wsSquid: string;
  };
  loading: boolean;
}

const initialState: IVotingEscrowSlice = {
  loading: true,
  stake: { balance: "0", lockedBalance: "0", unlockTime: "0", totalSupply: "0", supply: "0" },
  value: { wsSquid: "0" },
  reward: { claimable: "0", wethClaimable: "0" },
};

const votingEscrowSlice = createSlice({
  name: "votingEscrow",
  initialState,
  reducers: {
    fetchVotingEscrowSuccess(state, action) {
      setAll(state, action.payload);
    },
  },

  extraReducers: builder => {
    builder
      .addCase(loadDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.error(error.message);
      });
  },
});

export default votingEscrowSlice.reducer;

export const { fetchVotingEscrowSuccess } = votingEscrowSlice.actions;

const baseInfo = (state: RootState) => state.votingEscrow;

export const getVotinfEscrowState = createSelector(baseInfo, votingEscrow => votingEscrow);
