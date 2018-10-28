import { Navbar, NavbarToggler, NavbarBrand, Collapse, Nav, NavItem, NavLink } from "reactstrap";
import React, { Component } from "react";

const avatar = "https://cdn.discordapp.com/avatars/459153545917235200/95295dfb8efc3e70d6395ffa26d54162.png";
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
                        {this.listPages()}
                    </Nav>
                </Collapse>
            </Navbar>
        );
    }

    listPages() {
        if (this.props.authorized) {
            let base = <div>
                <NavItem><NavLink>{this.props.usr.username}</NavLink></NavItem>
                <div>{authPages.map(pg => <NavItem key={pg.name}><NavLink active={this.props.activePage === pg.name} href={pg.href}>{pg.name}</NavLink></NavItem>)}</div>
            </div>;
            if (this.props.owner) base += ownerPages.map(pg => <NavItem key={pg.name}><NavLink active={this.props.activePage === pg.name} href={pg.href}>{pg.name}</NavLink></NavItem>);
            base += <NavItem key="logout"><NavLink href="/logout">Logout</NavLink></NavItem>;
            return base;
        }
        return <NavItem key="login"><NavLink href="/login">Login</NavLink></NavItem>;
    }

}

export default NavBar;