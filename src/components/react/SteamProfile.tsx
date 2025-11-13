// src/components/SteamProfile.tsx
import React, { useEffect, useState } from 'react';

export default function SteamProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/.netlify/functions/steam-profile', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProfile(data);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!profile) return <p>Loading...</p>;

  return (
    <div>
      <img
        src={profile.avatarfull}
        alt={profile.personaname}
        style={{ borderRadius: '50%', width: 80, height: 80 }}
      />
      <p>{profile.personaname}</p>
    </div>
  );
}
