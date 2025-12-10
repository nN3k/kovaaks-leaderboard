import { useStore } from "@nanostores/react";
import { selectedScenarioId, selectedScenarioName } from "../../../data/nanostores/stores";
import { useEffect, useState } from "react";
import "../../../styles/uploadRun.css";


const UploadRunComponent = () => {
    const API_KEY = import.meta.env.PUBLIC_API_KEY;
    const insertProfileUrl = "/api/profiles/insert";
    const insertScenarioUrl = "/api/scenarios/insert";

    const selectedScenarioID = useStore(selectedScenarioId);
    const scenarioName = useStore(selectedScenarioName);

    // User and Steam profile state
    const [user, setUser] = useState<{ loggedIn: boolean; steamId?: string } | null>(null);
    const [profile, setProfile] = useState<any>(null);

    // Form and validation state
    const [validUser, setValidUser] = useState(false);
    const [vod, setVodLink] = useState("");
    const [score, setScore] = useState<number>(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });
    const [alertExiting, setAlertExiting] = useState(false);

    const handleChange = (link: string) => setVodLink(link);

    const fetchProfile = async () => {
        if (profile) return profile;
        const response = await fetch("/.netlify/functions/steam-profile", { credentials: "include" });
        const data = await response.json();
        setProfile(data);
        return data;
    };

    const extractYouTubeId = (url: string) => {
        if (url.startsWith("https://www.youtube.com/watch?v=")) return url.slice(32);
        if (url.startsWith("https://youtu.be/")) return url.slice(17);
        return null;
    };


    const showAlert = (type: 'success' | 'error', message: string) => {
        setAlertExiting(false);
        setSubmitStatus({ type, message });
        
        setTimeout(() => {
            setAlertExiting(true);
            setTimeout(() => {
                setSubmitStatus({ type: null, message: '' });
                setAlertExiting(false);
            }, 300);
        }, 5000);
    };


    const closeAlert = () => {
        setAlertExiting(true);
        setTimeout(() => {
            setSubmitStatus({ type: null, message: '' });
            setAlertExiting(false);
        }, 300);
    };

    // Submit both profile and run in a single flow
    const submitRun = async () => {
        if (!user?.loggedIn) {
            showAlert('error', "Please log in to submit a run");
            return;
        }
        
        if (!validUser) {
            showAlert('error', "You must have a score on this scenario in the top 50 to submit a run");
            return;
        }

        const videoId = extractYouTubeId(vod);
        if (!videoId) {
            showAlert('error', vod === "" ? "Please enter a YouTube link" : "Invalid YouTube link");
            return;
        }

        if (!score || score <= 0) {
            showAlert('error', "Invalid score. Please verify your score is in the top 50.");
            return;
        }

        setSubmitting(true);
        setSubmitStatus({ type: null, message: '' });

        try {
            const profileData = await fetchProfile();
            if (!profileData?.personaname || !user?.steamId) {
                showAlert('error', "Cannot submit: missing Steam ID or Steam name");
                return;
            }

            // Insert/update profile
            const profileResponse = await fetch(insertProfileUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    steamId: user.steamId,
                    steamName: profileData.personaname,
                    country: profileData.loccountrycode,
                    isBanned: false,
                }),
            });

            if (!profileResponse.ok) {
                throw new Error('Failed to update profile');
            }

            // Insert/update run
            const scenarioResponse = await fetch(insertScenarioUrl, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    steamId: user.steamId,
                    score,
                    vod: videoId,
                    scenarioName: scenarioName,
                }),
            });

            const scenarioResult = await scenarioResponse.json();

            if (scenarioResponse.ok && scenarioResult.success) {
                showAlert('success', "Run submitted successfully! It will appear in the leaderboard shortly.");
                setVodLink("");
            } else {
                showAlert('error', scenarioResult.error || "Failed to submit run. Please try again.");
            }

        } catch (error) {
            console.error("Submit error:", error);
            showAlert('error', "An unexpected error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };


    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitRun();
    };


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
    }, [selectedScenarioID]);

    return (
        <div className="upload-form-container">
            {/* Alert */}
            {submitStatus.type && (
                <div className={`upload-alert ${submitStatus.type} ${alertExiting ? 'exiting' : ''}`}>
                    <div className="upload-alert-icon">
                        {submitStatus.type === 'success' ? '✓' : '✗'}
                    </div>
                    <div className="upload-alert-content">
                        <div className="upload-alert-title">
                            {submitStatus.type === 'success' ? 'Success' : 'Error'}
                        </div>
                        <div className="upload-alert-message">{submitStatus.message}</div>
                    </div>
                        <button 
                            className="upload-alert-close"
                            onClick={closeAlert}
                            aria-label="Close alert"
                        >
                        ×
                    </button>
                </div>
            )}

            <h2 className="upload-form-title">Submit Your Run</h2>
            <form onSubmit={onSubmit} className="upload-form">
                <div className="form-group">
                    <input 
                        type="text" 
                        className="form-input"
                        placeholder="Youtube Video URL"
                        value={vod}
                        onChange={(e) => handleChange(e.target.value)}
                        disabled={submitting || !validUser}
                    />
                    <div className="error-message" style={{ display: 'none' }}>
                        Please enter a valid YouTube URL
                    </div>
                </div>

                <div className={`score-display ${validUser ? 'valid' : user?.loggedIn ? 'invalid' : 'neutral'}`}>
                    {validUser ? (
                        <>Your score: <span className="score-value">{score}</span></>
                    ) : user?.loggedIn ? (
                        "You need to be in the top 50 to submit a run"
                    ) : (
                        "Please log in to submit a run"
                    )}
                </div>

                <button 
                    type="submit" 
                    className={`submit-button ${submitting ? 'loading' : ''}`}
                    disabled={submitting || !validUser}
                >
                    {submitting ? 'Submitting...' : 'Submit Run'}
                </button>

                {submitting && (
                    <div className="upload-status info">
                        <div className="loading-spinner"></div>
                        Processing your submission...
                    </div>
                )}
            </form>
        </div>
    );
};

export default UploadRunComponent;