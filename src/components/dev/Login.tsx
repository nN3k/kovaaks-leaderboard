import { steamId } from "../../data/nanostores/stores";

const DevLogin = () => {
  const handleLogin = async () => {
    const id = steamId.get(); // read the Nanostore

    const res = await fetch("/.netlify/functions/dev-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steamId: id }),
    });

    if (res.ok) {
      // redirect after cookie is set
      window.location.href = "/";
    } else {
      alert("Login failed");
    }
  };

  return (
    <button onClick={handleLogin}>
      Login as Dev
    </button>
  );
};

export default DevLogin;
