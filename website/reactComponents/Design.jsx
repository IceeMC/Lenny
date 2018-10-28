import React from "react";
import Head from "next/head";
import MetaData from "./MetaData.jsx";
import { Container } from "reactstrap";

const Design = ({
    children,
    title = "Chat Noir",
    description = "A simple to use discord bot with a TON of features.",
    image = "https://cdn.discordapp.com/avatars/459153545917235200/95295dfb8efc3e70d6395ffa26d54162.png?size=2048",
    url = "https://chatnoir.ml",
    color = "#1A1210"
}) => (
    <div>
        <Head><MetaData title={title} description={description} image={image} url={url} color={color}></MetaData></Head>
        <Container>{children}</Container>
    </div>
);

export default Design;