export default function LogoutButton() {
    const handleLogout = async () => {
        window.location.href = '/.netlify/functions/steam-logout';
    };

    return <button onClick={handleLogout}>Logout</button>;
}
