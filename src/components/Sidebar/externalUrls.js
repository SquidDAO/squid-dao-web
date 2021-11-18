import { ReactComponent as ForumIcon } from "../../assets/icons/forum.svg";
import { ReactComponent as GovIcon } from "../../assets/icons/governance.svg";
import { ReactComponent as DocsIcon } from "../../assets/icons/docs.svg";
import { ReactComponent as FeedbackIcon } from "../../assets/icons/feedback.svg";
import { SvgIcon } from "@material-ui/core";

const externalUrls = [
  {
    title: "Forum",
    url: "https://forum.olympusdao.finance/",
    icon: <SvgIcon color="primary" component={ForumIcon} style={{ fill: "none" }} />,
  },
  {
    title: "Governance",
    url: "https://vote.olympusdao.finance/",
    icon: <SvgIcon color="primary" component={GovIcon} style={{ fill: "none" }} />,
  },
  {
    title: "Docs",
    url: "https://docs.olympusdao.finance/",
    icon: <SvgIcon color="primary" component={DocsIcon} style={{ fill: "none" }} />,
  },
  {
    title: "Feedback",
    url: "https://olympusdao.canny.io/",
    icon: <SvgIcon color="primary" component={FeedbackIcon} style={{ fill: "none" }} />,
  },
];

export default externalUrls;
