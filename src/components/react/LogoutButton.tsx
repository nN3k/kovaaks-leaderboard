export default function LogoutButton() {
  const handleLogout = async () => {
    // Redirecting to logout function
    window.location.href = '/.netlify/functions/steam-logout';
  };

  return <button onClick={handleLogout}>Logout</button>;
}
