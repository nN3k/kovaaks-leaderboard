import { useState, type JSX } from 'react';
import InsertProfileButton from './InsertProfileButton';
import ProfileList from './ProfileList';

export default function ProfileManager(): JSX.Element {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleProfileInserted = (): void => {
    // Increment to trigger refresh in ProfileList
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      {/* Now TypeScript knows about the onInsert prop */}
      <InsertProfileButton onInsert={handleProfileInserted} />
      <ProfileList key={refreshTrigger} />
    </div>
  );
}