import { ReactComponent as ForumIcon } from "../../assets/icons/forum.svg";
import { ReactComponent as GovIcon } from "../../assets/icons/governance.svg";
import { ReactComponent as DocsIcon } from "../../assets/icons/docs.svg";
import { ReactComponent as FeedbackIcon } from "../../assets/icons/feedback.svg";
import { SvgIcon } from "@material-ui/core";

const externalUrls = [
  {
    title: "Discourse",
    url: "https://discourse.squid.xyz/",
    icon: <SvgIcon color="primary" component={ForumIcon} style={{ fill: "none" }} />,
  },
  {
    title: "Docs",
    url: "https://squid-dao.gitbook.io/squiddao/",
    icon: <SvgIcon color="primary" component={DocsIcon} style={{ fill: "none" }} />,
  },
  {
    title: "Governance",
    url: "https://vote.squid.xyz",
    icon: <SvgIcon color="primary" component={GovIcon} style={{ fill: "none" }} />,
  },
];

export default externalUrls;
