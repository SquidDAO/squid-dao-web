import { SvgIcon, Link } from "@material-ui/core";
import { ReactComponent as Twitter } from "../../assets/icons/twitter.svg";

export default function Social() {
  return (
    <div className="social-row">
      <Link href="https://twitter.com/SquidDao" target="_blank">
        <SvgIcon color="primary" component={Twitter} />
      </Link>
    </div>
  );
}
