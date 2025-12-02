import { useState, useEffect } from 'react';

const SteamProfile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Parse cookies
        const cookies = Object.fromEntries(
            document.cookie.split("; ").map((c) => {
                const [key, value] = c.split("=");
                return [key, decodeURIComponent(value)];
            })
        );

        const checkLogin = async () => {
            try {
                const res = await fetch("/.netlify/functions/check-login", {
                    credentials: "include",
                });
                const data = await res.json();

                if (data.loggedIn) {
                    // Extract personaName + avatar from cookies 
                    const personaName = cookies.personaName || null;
                    const avatar = cookies.avatar || null;

                    if (personaName && avatar) {
                        setProfile({
                            personaName,
                            avatar
                        });
                    } else {
                        setError("Missing profile cookies");
                    }
                } else {
                    setProfile(null);
                }
            } catch (err: any) {
                setError(err.message || "Something went wrong");
            }
        };

        checkLogin();
    }, []);


    if (error) return <p>{error}</p>;
    if (!profile) return <p>Loading...</p>;


    return (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {profile.avatar && (
                <img
                    src={profile.avatar}
                    alt={profile.personaName || ""}
                    style={{ borderRadius: "50%", width: 50, height: 50 }}
                />
            )}
            <div>
                {profile.personaName && <p>{profile.personaName}</p>}
            </div>
        </div>
    );


};

export default SteamProfile;
