import React from "react";

const MetaData = ({
    title = "Chat Noir",
    description = "A simple to use discord bot with a TON of features.",
    image = "https://cdn.discordapp.com/avatars/459153545917235200/95295dfb8efc3e70d6395ffa26d54162.png?size=2048",
    url = "https://chatnoir.ml",
    color = "#1A1210"
}) => (
    <div>
        <meta property="og:title" content={title}/>
        <meta property="og:description" content={description}/>
        <meta property="og:image" content={image}/>
        <meta property="og:url" content={url}/>
        <meta name="theme-color" content={color}/>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
    </div>
);

export default MetaData;