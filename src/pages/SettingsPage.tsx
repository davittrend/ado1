import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { Settings } from '../components/Settings/Settings';

function SettingsPage() {
  return (
    <DashboardLayout>
      <Settings />
    </DashboardLayout>
  );
}

export default SettingsPage;