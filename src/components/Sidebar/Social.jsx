import { SvgIcon, Link } from "@material-ui/core";
import { ReactComponent as Twitter } from "../../assets/icons/twitter.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { faDiscord, faGithub, faReddit } from "@fortawesome/free-brands-svg-icons";
import styled from "styled-components";

export default function Social() {
  return (
    <div className="social-row">
      <Link href="https://github.com/squiddaodev" target="_blank">
        <Icon icon={faGithub} size="1x" />
      </Link>
      <Link href="https://twitter.com/SquidDao" target="_blank">
        <SvgIcon color="primary" component={Twitter} />
      </Link>
      <Link href="https://discord.gg/squid-dao" target="_blank">
        <Icon icon={faDiscord} size="1x" />
      </Link>
      <Link href="https://www.reddit.com/r/SquidDAO/" target="_blank">
        <Icon icon={faReddit} size="1x" />
      </Link>
    </div>
  );
}

const Icon = styled(FontAwesomeIcon)`
  color: black;
  font-size: 16px;

  &:hover {
    color: black;
  }
`;
