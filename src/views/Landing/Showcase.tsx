import { Typography } from "@material-ui/core";
import React from "react";
import { Col, Row } from "react-bootstrap";
import styled from "styled-components";
import showcase0 from "../../assets/images/showcase_0.png";
import showcase1 from "../../assets/images/showcase_1.png";
import showcase2 from "../../assets/images/showcase_2.png";
import showcase3 from "../../assets/images/showcase_3.png";
import showcase4 from "../../assets/images/showcase_4.png";
import showcase5 from "../../assets/images/showcase_5.png";
import showcase6 from "../../assets/images/showcase_6.png";
import showcase7 from "../../assets/images/showcase_7.png";

const Showcase: React.FC = () => {
  return (
    <>
      <Row className="g-4 align-items-center">
        <Col className="d-flex justify-content-center">
          <Typography variant="h1" component="span" style={{ fontWeight: "bold" }} className="p-4 d-none d-sm-block">
            Get
            <br />
            Kraken
            <br />
            Before
            <br />
            They're
            <br />
            Gone
          </Typography>
          <Typography variant="h3" component="span" style={{ fontWeight: "bold" }} className="d-sm-none">
            Get
            <br />
            Kraken
            <br />
            Before
            <br />
            They're
            <br />
            Gone
          </Typography>
        </Col>
        <Col>
          <Img src={showcase0} className="p-4 d-none d-sm-block" />
          <Img src={showcase0} className="p-2 d-sm-none" />
        </Col>
      </Row>
      <Row>
        <Col>
          <Img src={showcase1} />
        </Col>
        <Col>
          <Img src={showcase2} />
        </Col>
        <Col>
          <Img src={showcase3} />
        </Col>
        <Col>
          <Img src={showcase4} />
        </Col>
        <Col>
          <Img src={showcase5} />
        </Col>
      </Row>
    </>
  );
};

const Img = styled.img`
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
`;

export default Showcase;
