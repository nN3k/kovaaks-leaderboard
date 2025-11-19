import { useState, type JSX } from 'react';

interface InsertProfileButtonProps {
    onInsert?: () => void;
}

interface ProfileData {
    steamId: number;
    steamName: string;
    country?: string;
    isBanned?: boolean;
}

export default function InsertProfileButton({ onInsert }: InsertProfileButtonProps): JSX.Element {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    const staticProfileData: ProfileData = {
        steamId: Math.floor(Math.random() * 1000000000),
        steamName: 'StaticPlayer',
        country: 'US',
        isBanned: false
    };

    const handleInsert = async (): Promise<void> => {
        setIsLoading(true);
        setMessage('');
        
        try {
            const response = await fetch('/api/profiles/insert.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(staticProfileData),
            });

            if (!response.ok) {
                throw new Error(`Insert failed: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                setMessage(`Profile inserted successfully! Steam ID: ${staticProfileData.steamId}`);
                
                if (onInsert) {
                    onInsert();
                }
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setMessage('Error inserting profile: ' + errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            <button 
                onClick={handleInsert}
                disabled={isLoading}
                style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: isLoading ? '#ccc' : '#007acc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
            >
                {isLoading ? 'Inserting...' : 'Insert Static Profile'}
            </button>
            
            {message && (
                <p style={{ 
                    marginTop: '0.5rem', 
                    color: message.includes('Error') ? 'red' : 'green' 
                }}>
                    {message}
                </p>
            )}
        </div>
    );
}