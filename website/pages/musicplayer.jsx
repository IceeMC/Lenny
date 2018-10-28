import "bootstrap/dist/css/bootstrap.min.css";
import React, { Component } from "react";
import MetaData from "../reactComponents/MetaData";
import NavBar from "../reactComponents/NavBar.jsx";
import { Container, Button, Input, FormGroup } from "reactstrap";
import Script from "react-load-script";
import Head from "next/head";
import Jumbotron from "../reactComponents/Jumbotron.jsx";

class MusicPlayer extends Component {

    static async getInitialProps({ query }) {
        return query;
    }

    render() {
        return (
            <div>
                <Head><MetaData title="Music Player" description="Gets info on a guilds music player."/></Head>
                <Script url="https://remixbot.ml/assets/scripts/PlayerSocket.js"/>
                <NavBar activePage="Music Player" usr={this.props.usr} authorized={this.props.authorized} owner={this.props.owner}></NavBar>
                <Jumbotron id="jumbotron" display="Music Player" lead="Gets info on a guilds music player. Enter an id to get started."></Jumbotron>
                <Container>
                    <div id="playerDiv">
                        <div id="playerDivOverlay">
                            <FormGroup>
                                <Input id="guildId" type="text"/>
                            </FormGroup>
                            <Button id="submit">Go!</Button>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

}

export default MusicPlayer;