import React from"react";
import { Jumbotron } from "reactstrap";

const JumboTron = ({ display, lead, backgroundColor = "#2C2F33", color = "#FFFFFF" }) => (
    <Jumbotron style={{ backgroundColor, color }} fluid>
        <center>
            <h1 id="jumboTronHeader" className="display-3">{display}</h1>
            <p id="jumboTronLead">{lead}</p>
        </center>
    </Jumbotron>
);

export default JumboTron;