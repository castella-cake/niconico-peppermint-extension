import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
    <div className="container">
        <div className="title-container">
            <div className="title toptitle"><a href="settings.html" target="_blank" rel="noopener noreferrer" className="optlink">PepperMint+</a></div>
            <div className="titlelink-container">
                <a href="https://github.com/sponsors/castella-cake" target="_blank" rel="noopener noreferrer" className="titlelink">Donate</a>
                <a href="https://github.com/castella-cake/niconico-peppermint-extension" target="_blank" rel="noopener noreferrer" className="titlelink">Github</a>
            </div>
        </div>
    </div>
    </React.StrictMode>,
);