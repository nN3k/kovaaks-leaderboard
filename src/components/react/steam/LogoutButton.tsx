interface loggedIn {
    auth: string;
}

const LogoutButton = ({ auth }: loggedIn) => {
    const handleLogout = async () => {
        window.location.href = '/.netlify/functions/steam-logout';
    };

    if (auth !== "true") {
        return null;
    }

    return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;