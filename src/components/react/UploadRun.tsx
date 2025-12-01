import { useStore } from "@nanostores/react";
import { selectedScenarioId, selectedScenarioName } from "../../data/nanostores/stores";
import { useEffect, useState } from "react";

const UploadRunComponent = () => {
  const selectedScenarioID = useStore(selectedScenarioId);

  // User and Steam profile state
  const [user, setUser] = useState<{ loggedIn: boolean; steamId?: string } | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // Form and validation state
  const [validUser, setValidUser] = useState(false);
  const [vod, setVodLink] = useState("");
  const [score, setScore] = useState<number>(0);

  // Handle input change for VOD
  const handleChange = (link: string) => setVodLink(link);

  // Fetch Steam profile once and store in state
  const fetchProfile = async () => {
    if (profile) return profile; // cache result
    const response = await fetch("/.netlify/functions/steam-profile", { credentials: "include" });
    const data = await response.json();
    setProfile(data);
    return data;
  };

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string) => {
    if (url.startsWith("https://www.youtube.com/watch?v=")) return url.slice(32);
    if (url.startsWith("https://youtu.be/")) return url.slice(17);
    return null;
  };

  // Submit both profile and run in a single flow
  const submitRun = async () => {
    if (!user?.loggedIn) return alert("Please log in to submit a run");
    if (!validUser) return alert("You must have a score on this scenario in the top 50 to submit a run");

    const videoId = extractYouTubeId(vod);
    if (!videoId) {
      return alert(vod === "" ? "Please enter a YouTube link" : "Invalid YouTube link");
    }

    const profileData = await fetchProfile();
    if (!profileData?.personaname || !user?.steamId) {
      return alert("Cannot submit: missing Steam ID or Steam name");
    }

    // Insert/update profile
    await fetch("/api/profiles/insert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        steamId: user.steamId,
        steamName: profileData.personaname,
        country: profileData.loccountrycode,
        isBanned: false,
      }),
    });

    // Insert/update run
    await fetch("/api/scenarios/insert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        steamId: user.steamId,
        score,
        vod: videoId,
        scenarioName: selectedScenarioName.get(),
      }),
    });

    console.log("Submitted run:", { steamId: user.steamId, score, vod: videoId });
  };

  // Handle form submission
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRun();
  };

  // Check if user has a score in top 50 when scenario changes
  useEffect(() => {
  const verifyUser = async () => {
    let loginData;
    try {
      loginData = await fetch("/.netlify/functions/check-login").then(res => res.json());
    } catch {
      loginData = { loggedIn: false };
    }
    setUser(loginData);

    if (!loginData.loggedIn) {
      setValidUser(false);
      return;
    }

    const response = await fetch(
      `https://kovaaks.com/webapp-backend/leaderboard/scores/global?leaderboardId=${selectedScenarioID}&page=0&max=50`
    );
    const data = await response.json();

    const userEntry = data.data.find((entry: any) => entry.steamId === loginData.steamId);
    if (userEntry) {
      setValidUser(true);
      setScore(userEntry.score);
    } else {
      setValidUser(false);
      setScore(0);
    }
  };

  verifyUser();
}, [selectedScenarioID]); // only run when scenario changes


  return (
    <div>
      <form onSubmit={onSubmit}>
        <label>
          Youtube Link of the run:
          <input type="text" name="youtubeLink" onChange={(e) => handleChange(e.target.value)} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default UploadRunComponent;
