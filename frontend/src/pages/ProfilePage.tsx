import React from 'react';
import { ProfileSettings } from '../components/profile/ProfileSettings';

export const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <ProfileSettings />
    </div>
  );
};
