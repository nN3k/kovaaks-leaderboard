import { useState, useEffect } from "react";
import LoginWithSteam from "./LoginWithSteam";
import LogoutButton from "./LogoutButton";
import SteamProfile from "./SteamProfile";

const SteamComponentsInHeader = () => {
    const [auth, setAuth] = useState("");
    
    useEffect(() => {
        const checkLogin = async () => {
            const res = await fetch('/.netlify/functions/check-login');
            const data = await res.json();
            if (data.loggedIn) {
                setAuth("true");
            } else {
                setAuth("false");
            }
        };
        checkLogin();
    }, []);


    return (
        <div className="steam-header-bundle">
            <LoginWithSteam auth={auth}/>
            <LogoutButton auth={auth}/>
            <SteamProfile auth={auth}/>
        </div>
    );
}

export default SteamComponentsInHeader;