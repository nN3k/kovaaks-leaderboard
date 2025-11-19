const SteamLoginButton = () => {
    return (
        <button onClick={() => window.location.href = '/.netlify/functions/steam-login'}>
            Login with Steam
        </button>
    );
}

export default SteamLoginButton;