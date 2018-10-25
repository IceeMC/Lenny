import { Navbar, NavbarToggler, NavbarBrand, Collapse, Nav, NavItem, NavLink } from "reactstrap";
import React, { Component } from "react";

const avatar = "https://cdn.discordapp.com/avatars/459153545917235200/95295dfb8efc3e70d6395ffa26d54162.png?size=2048";
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
            <Navbar color="dark" dark expand="md" style={{ color: "#FFFFFF", backgroundColor: "#1A1210" }}>
                <NavbarBrand><img src={avatar} style={{ width: 30, height: 30 }}></img></NavbarBrand>
                <NavbarToggler onClick={this.toggleNav}/>
                <Collapse isOpen={this.state.isOpen} navbar>
                    <Nav className="ml-auto" navbar>
                        {pages.map(pg => <NavItem><NavLink active={this.props.activePage === pg.name} href={pg.href}>{pg.name}</NavLink></NavItem>)}
                    </Nav>
                    {this.listPages()}
                </Collapse>
            </Navbar>
        );
    }

    listPages() {
        if (this.props.authorized) {
            const base = (
                <div>
                    <NavItem><NavLink>{this.props.usr.username}</NavLink></NavItem>
                    <div>{authPages.map(pg => <NavItem><NavLink active={this.props.activePage === pg.name} href={pg.href}>{pg.name}</NavLink></NavItem>)}</div>
                </div>
            );
            if (this.props.owner) base += ownerPages.map(pg => <NavItem><NavLink active={this.props.activePage === pg.name} href={pg.href}>{pg.name}</NavLink></NavItem>);
            base += <NavItem><NavLink href="/logout">Logout</NavLink></NavItem>;
            return base;
        }
        return (<NavItem><NavLink href="/login">Login</NavLink></NavItem>);
    }

}

export default NavBar;