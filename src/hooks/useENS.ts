import { useEffect, useState } from "react";
import { useWeb3Context } from "./web3Context";

export function useENS(address: string | null | undefined) {
  const [ensName, setENSName] = useState<string | null>();
  const { provider } = useWeb3Context();

  useEffect(() => {
    async function resolveENS() {
      if (address) {
        const name = await provider.lookupAddress(address.toLowerCase());
        if (name) setENSName(name);
      }
    }
    resolveENS();
  }, [address]);

  return { ensName };
}
