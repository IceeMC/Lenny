import "bootstrap/dist/css/bootstrap.min.css";
import React, { Component } from "react";
import Design from "../reactComponents/Design.jsx";
import NavBar from "../reactComponents/NavBar.jsx";
import Jumbotron from "../reactComponents/Jumbotron.jsx";

const name = <p>Hello, I am <strong style={{ color: "#99AAB5" }}>Chat Noir</strong></p>;
const guild = ({ guilds }) => <p>I am currently serving <strong style={{ color: "#99AAB5" }}>{guilds}</strong> guilds.</p>

class Index extends Component {

    static async getInitialProps({ query: { authorized, stats, usr, owner } }) {
        return { authorized, stats, usr, owner };
    }

    render() {
        return (
            <div>
                <NavBar activePage="Home" usr={this.props.usr} authorized={this.props.authorized} owner={this.props.owner}></NavBar>
                <Jumbotron display={name} lead={guild(this.props.stats)}></Jumbotron>
                <Design/>
            </div>
        );
    }

}

export default Index;