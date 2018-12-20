import { Navbar, NavbarToggler, NavbarBrand, Collapse, Nav, NavItem, NavLink } from "reactstrap";
import React, { Component } from "react";

const avatar = "https://cdn.discordapp.com/avatars/459153545917235200/c588678a9c60e11dcca4c728ebf4ccfe.png?size=2048";
const allPages = [{
    href: "/",
    name: "Home",
    needsAuth: false,
    forOwner: false
}, {
    href: "/player",
    name: "Music Player",
    needsAuth: false,
    forOwner: false
}, {
    href: "/console",
    name: "Console",
    needsAuth: true,
    forOwner: true
}];

const pages = allPages.filter(p => !p.needsAuth);
const authPages = allPages.filter(p => p.needsAuth && !p.forOwner);
const ownerPages = allPages.filter(p => p.needsAuth && p.forOwner);

class NavBar extends Component {

    constructor(props) {
        super(props);
        this.state = { isOpen: false };
        this.toggleNav = this.toggleNav.bind(this);
    }

    toggleNav() {
        this.setState({ isOpen: !this.state.isOpen });
    }

    render() {
        return (
            <Navbar color="dark" dark expand="md" style={{ color: "#FFFFFF" }}>
                <NavbarBrand><img src={avatar} style={{ width: 30, height: 30 }}></img></NavbarBrand>
                <NavbarToggler onClick={this.toggleNav}/>
                <Collapse isOpen={this.state.isOpen} navbar>
                    <Nav className="ml-auto" navbar>
                        {pages.map(pg => <NavItem key={pg.name}><NavLink active={this.props.activePage === pg.name} href={pg.href}>{pg.name}</NavLink></NavItem>)}
                        {(() => {
                            if (this.props.authorized && this.props.usr) {
                                let base;
                                if (this.props.owner) base += ownerPages.map(pg => <NavItem key={pg.name}><NavLink active={this.props.activePage === pg.name} href={pg.href}>{pg.name}</NavLink></NavItem>);
                                base += <NavItem><NavLink href="/logout">Logout</NavLink></NavItem>;
                                return base;
                            }
                            return <NavItem key="login"><NavLink href="/login">Login</NavLink></NavItem>;
                        })()}
                    </Nav>
                </Collapse>
            </Navbar>
        );
    }

}

export default NavBar;