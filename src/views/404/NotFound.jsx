import OlympusLogo from "../../assets/404.png";
import "./notfound.scss";

export default function NotFound() {
  return (
    <div id="not-found" style={{ textAlign: "center", height: "100%" }}>
      <div className="not-found-header">
        <img className="branding-header-icon" src={OlympusLogo} alt="SquidDAO" style={{ marginBottom: "20px" }} />
        <h1 style={{ marginBottom: "16px" }}>Oops!!</h1>
        <p>Wrong way, please try again.</p>
      </div>
    </div>
  );
}
