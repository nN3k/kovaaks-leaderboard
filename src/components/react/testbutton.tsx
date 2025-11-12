import { useEffect, useState } from 'react';


//checking if user is logged in
const ShowSteam = () => {
  const [user, setUser] = useState<{ steamId: string } | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const res = await fetch('/.netlify/functions/check-login');
      const data = await res.json();
      if (data.loggedIn) setUser({ steamId: data.steamId });
    };
    checkLogin();
  }, []);

  return (
    <div>
      {user ? <p>Logged in as {user.steamId}</p> : <p>Not logged in</p>}
    </div>
  );
}
export default ShowSteam;