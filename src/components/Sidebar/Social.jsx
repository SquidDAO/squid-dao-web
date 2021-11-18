import { SvgIcon, Link } from "@material-ui/core";
import { ReactComponent as Gitlab } from "../../assets/icons/gitlab.svg";
import { ReactComponent as Medium } from "../../assets/icons/medium.svg";
import { ReactComponent as Twitter } from "../../assets/icons/twitter.svg";
import { ReactComponent as Telegram } from "../../assets/icons/telegram.svg";

export default function Social() {
  return (
    <div className="social-row">
      <Link href="#" target="_blank">
        <SvgIcon color="primary" component={Twitter} />
      </Link>
      <Link href="#" target="_blank">
        <SvgIcon color="primary" component={Medium} />
      </Link>
      <Link href="#" target="_blank">
        <SvgIcon color="primary" component={Telegram} />
      </Link>
      <Link href="#" target="_blank">
        <SvgIcon color="primary" component={Gitlab} />
      </Link>
    </div>
  );
}
