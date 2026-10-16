import { useNavigate } from 'react-router-dom';
import { CreateCampaignModal } from '../components/modals/CreateCampaignModal';
import { MyCampaignsPage } from './MyCampaignsPage';

export function CreateCampaignPage() {
  const navigate = useNavigate();

  return (
    <>
      <MyCampaignsPage />
      <CreateCampaignModal
        open
        onClose={() => navigate('/campaigns?mine=1', { replace: true })}
        onCreated={(campaign) => navigate(`/campaigns/${campaign.id}`)}
      />
    </>
  );
}
