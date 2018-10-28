import "bootstrap/dist/css/bootstrap.min.css";
import React, { Component } from "react";
import MetaData from "../reactComponents/MetaData.jsx";
import NavBar from "../reactComponents/NavBar.jsx";
import Head from "next/head";
import Jumbotron from "../reactComponents/Jumbotron.jsx";

const name = <p>Hello, I am <strong style={{ color: "#99AAB5" }}>Chat Noir</strong></p>;
const guild = (count) => <p>I am currently serving <strong style={{ color: "#99AAB5" }}>{count}</strong> guilds.</p>

class Index extends Component {

    static async getInitialProps({ query }) {
        return query;
    }

    render() {
        return (
            <div>
                <Head><MetaData/></Head>
                <NavBar activePage="Home" usr={this.props.usr} authorized={this.props.authorized} owner={this.props.owner}></NavBar>
                <Jumbotron display={name} lead={guild(this.props.stats.guilds)}></Jumbotron>
            </div>
        );
    }

}

export default Index;