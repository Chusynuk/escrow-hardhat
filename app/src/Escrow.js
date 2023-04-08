import "./escrow.css";

export default function Escrow({
  address,
  arbiter,
  beneficiary,
  value,
  handleApprove,
}) {
  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div>Arbiter: {arbiter}</div>
        </li>
        <li>
          <div> Beneficiary: {beneficiary} </div>
        </li>
        <li>
          <div> Value: {value} </div>
        </li>
      </ul>
      {/* <br />
      <br />
      <br /> */}
      <button
        className="approve"
        id={address}
        onClick={(e) => {
          e.preventDefault();
          console.log("button");
          handleApprove();
        }}
      >
        Approve
      </button>
      <div>Deployed contracts: </div>
    </div>
  );
}
