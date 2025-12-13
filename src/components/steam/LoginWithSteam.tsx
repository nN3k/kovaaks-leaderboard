interface loggedIn {
    auth: string;
}

const SteamLoginButton = ({ auth }: loggedIn) => {
    if (auth === "true") {
        return null;
    }
    return (
        <button onClick={() => window.location.href = '/.netlify/functions/steam-login'}>
            Login with Steam
        </button>
    );
}

export default SteamLoginButton;