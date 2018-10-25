import React from "react";
import { Jumbotron } from "reactstrap";

const JumboTron = ({ display, lead, backgroundColor = "#2C2F33", color = "#FFFFFF" }) => (
    <Jumbotron style={{ backgroundColor, color }}>
        <h1 className="display-3">{display}</h1>
        <p>{lead}</p>
    </Jumbotron>
);

export default JumboTron;