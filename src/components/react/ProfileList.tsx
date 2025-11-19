import { useState, useEffect, type JSX } from 'react';

// Type for profiles from the API
interface ProfileFromDB {
    steamId: number;
    steamName: string;
    country: string;
    isBanned: boolean;
}

export default function ProfileList(): JSX.Element {
    const [profiles, setProfiles] = useState<ProfileFromDB[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const fetchProfiles = async (): Promise<void> => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/profiles.json');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }
            
            const data = await response.json();
            setProfiles(data);
            setError('');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profiles';
            setError(errorMessage);
            console.error('Error fetching profiles:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const refreshProfiles = (): void => {
        fetchProfiles();
    };

    if (isLoading) {
        return <div>Loading profiles...</div>;
    }

    if (error) {
        return (
            <div>
                <p style={{ color: 'red' }}>Error: {error}</p>
                <button onClick={refreshProfiles}>Retry</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '1rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Profiles in Database ({profiles.length})</h3>
                <button 
                    onClick={refreshProfiles}
                    style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#007acc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Refresh
                </button>
            </div>

            {profiles.length === 0 ? (
                <p>No profiles found in the database.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>Steam ID</th>
                                <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>Steam Name</th>
                                <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>Country</th>
                                <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>Banned</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profiles.map((profile) => (
                                <tr key={profile.steamId}>
                                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{profile.steamId}</td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{profile.steamName}</td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{profile.country}</td>
                                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                                        {profile.isBanned ? 'Yes' : 'No'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}