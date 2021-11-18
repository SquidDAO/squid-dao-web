import { useEffect, useState } from "react";
import { useWeb3Context } from "../hooks/web3Context";

export const useReverseENSLookUp = (address: string) => {
  const { provider } = useWeb3Context();
  const [ens, setEns] = useState<string>();

  useEffect(() => {
    let mounted = true;
    if (address && provider) {
      provider.lookupAddress(address).then(name => {
        if (mounted) {
          setEns(name);
        }
      });
    }

    return () => {
      setEns("");
      mounted = false;
    };
  }, [address, provider]);

  return ens;
};
