import { useStore } from "@nanostores/react";
import { selectedScenarioId } from "../../data/nanostores/stores";
import { useEffect, useState } from "react";
import { set } from "astro:schema";

const UploadRunComponent = () => {
    const selectedScenarioID = useStore(selectedScenarioId);
    const [user, setUser] = useState<{ loggedIn: boolean; steamId?: string } | null>(null);
    const [validUser, setValidUser] = useState(false);
    const [vod, setVodLink] = useState("");

    let kovaaksScenarioRank = 0;

    const handleChange = (link: string) => {
        setVodLink(link);
    }

    const onSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        let validLink = false;

        if (!user || !user.loggedIn) {
            alert("Please log in to submit a run");
            return;
        }
        if (!validUser) {
            alert(`You must have a score on this scenario in the top 50 to submit a run ${validUser}`);
            return;
        }

        if (vod.startsWith("https://www.youtube.com/watch?v=")) {
            validLink = true;
        } else if (vod.startsWith("https://youtu.be/")) {
            validLink = true;
        }
        
        if (!validLink) {
            if ( vod == "" ) {
                alert("Please enter a YouTube link");
                return;
            }
            alert("Invalid YouTube link");
            return;
        }

        //TODO: Upload to databse here
        console.log("Submitted VOD:", vod);
    }

    //When clicking a scenario, verify if logged in user has scored on it
    useEffect(() => {
        async function verifyUser() {
            await fetch('/.netlify/functions/check-login')
                .then(res => res.json())
                .then(data => setUser(data))
                .catch(() => setUser({ loggedIn: false }));
            
            //important on load
            if (!user || !user.loggedIn) {
                setValidUser(false);
                return;
            }


            const response = await fetch(
                `https://kovaaks.com/webapp-backend/leaderboard/scores/global?leaderboardId=${selectedScenarioID}&page=0&max=50`
            );
            
            const data = await response.json();
            kovaaksScenarioRank = 0;
            setValidUser(false);
            for (let i = 0; i < 50; i++) {
                console.log("Comparing", data.data[i].steamId, "to", user?.steamId);
                if (data.data[i].steamId == user?.steamId) {
                    kovaaksScenarioRank = i + 1;
                    setValidUser(true);
                    break;
                }
            }
        }
    verifyUser();
    }, [selectedScenarioID]);

    return <div>
        <form onSubmit={onSubmit}>
            <label>
                Youtube Link of the run:
                <input type="text" name="youtubeLink" onChange={(event) => handleChange(event.target.value)} />
            </label>
            <input type="submit" value="Submit" />
        </form>
    </div>;
}

export default UploadRunComponent;