import "bootstrap/dist/css/bootstrap.min.css";
import React, { Component } from "react";
import NavBar from "../reactComponents/NavBar.jsx";
import { Button, Input, FormGroup } from "reactstrap";
import Script from "react-load-script";
import Jumbotron from "../reactComponents/Jumbotron.jsx";
import Design from "../reactComponents/Design.jsx";

class MusicPlayer extends Component {

    static async getInitialProps({ query }) {
        return query;
    }

    render() {
        return (
            <div>
                <Script url="https://remixbot.ml/assets/scripts/PlayerSocket.js"/>
                <NavBar activePage="Music Player" usr={this.props.usr} authorized={this.props.authorized} owner={this.props.owner}></NavBar>
                <Jumbotron id="jumbotron" display="Music Player" lead="Gets info about the current playing song, queue, etc. Enter a guild id to start."></Jumbotron>
                <Design description="Gets info about the current playing song, queue, etc.">
                    <div id="playerDiv">
                        <div id="playerDivOverlay">
                            <FormGroup>
                                <Input id="guildId" type="text"/>
                            </FormGroup>
                            <Button color="primary" id="submit">Go!</Button>
                        </div>
                    </div>
                </Design>
            </div>
        );
    }

}

export default MusicPlayer;