import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Utils } from "alchemy-sdk";
import deploy from "./deploy";
import Escrow from "./Escrow";

const provider = new ethers.providers.Web3Provider(window.ethereum);
// const provider =
//   window.ethereum != null
//     ? new ethers.providers.Web3Provider(window.ethereum)
//     : ethers.providers.getDefaultProvider();

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();
  const [beneficiary, setBeneficiary] = useState("");
  const [arbiter, setArbiter] = useState("");
  const [deposit, setDeposit] = useState("");
  const [deployedContracts, setDeployedContracts] = useState(
    JSON.parse(window.localStorage.getItem("deployed-contracts")) || []
  );

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send("eth_requestAccounts", []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  async function newContract() {
    // const beneficiary = document.getElementById("beneficiary").value;
    // const arbiter = document.getElementById("arbiter").value;
    // const deposit = Utils.parseEther(document.getElementById("ether").value);

    // console.log("deposit", deposit);
    const escrowContract = await deploy(
      signer,
      arbiter,
      beneficiary,
      Utils.parseEther(deposit)
    );

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: deposit.toString(),
      handleApprove: async () => {
        console.log("hey");
        escrowContract.on("Approved", () => {
          document.getElementById(escrowContract.address).className =
            "complete";
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };

    setDeployedContracts([...deployedContracts, escrow.address]);

    console.log("escrow", escrow);
    window.localStorage.setItem(
      "deployed-contracts",
      JSON.stringify([...deployedContracts, escrow.address])
    );

    setEscrows([...escrows, escrow]);

    // Sets all inputs to empty string when new contract is deployed.
    setArbiter("");
    setBeneficiary("");
    setDeposit("");
  }

  return (
    <>
      <div className="contract">
        <h1> New Contract 🚀</h1>
        <label>
          <input
            type="text"
            id="arbiter"
            placeholder="Arbiter address"
            deposit={arbiter}
            value={arbiter}
            onChange={({ target: { value } }) => setArbiter(value)}
          />
        </label>

        <label>
          <input
            type="text"
            id="beneficiary"
            placeholder="Beneficiary address"
            value={beneficiary}
            onChange={({ target: { value } }) => setBeneficiary(value)}
          />
        </label>

        <label>
          <input
            type="text"
            id="ether"
            placeholder="Deposit ETH"
            value={deposit}
            onChange={({ target: { value } }) => setDeposit(value)}
          />
        </label>

        <button
          className="deploy"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
          onKeyDown={(event) => {
            event.preventDefault();
            if (event.key === "Enter") {
              newContract();
            }
          }}
        >
          Deploy
        </button>
      </div>

      <div className="existing-contracts">
        <div id="container">
          {escrows?.map((escrow) => {
            return (
              <Escrow
                key={escrow?.address}
                handleApprove={escrow.handleApprove}
                {...escrow}
              />
            );
          })}
        </div>
        <div id="deployed-contracts">
          <h3>Deployed contracts: {deployedContracts.length}</h3>
          <ul>
            {deployedContracts.map((address) => (
              <li key={address}>{address}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default App;
