// src/components/SteamLogoutButton.tsx
const SteamLogoutButton = () => {
  return (
    <button onClick={() => {
      alert('Logged out'); 
      // You can also clear cookies or local storage here
    }}>
      Logout
    </button>
  );
}

export default SteamLogoutButton;