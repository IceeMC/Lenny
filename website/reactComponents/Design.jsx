import React from "react";
import NavBar from "./NavBar.jsx";
import { Container } from "reactstrap";

const Design = ({ children, authorized = false, owner = false, activePage = "home", usr = null }) => (
    <div>
        <NavBar authorized={authorized} owner={owner} activePage={activePage} usr={usr}></NavBar>
        <Container>{children}</Container>
    </div>
);

export default Design;