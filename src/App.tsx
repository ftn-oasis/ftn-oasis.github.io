import { AppLayout } from "@src/components/layout/AppLayout";
import { NotFoundPage } from "@src/pages/NotFoundPage";
import { OrganizationBookPage } from "@src/pages/OrganizationBookPage";
import { OrganizationDocumentsPage } from "@src/pages/OrganizationDocumentsPage";
import { OrganizationLayout } from "@src/pages/OrganizationLayout";
import { OrganizationMeetingsPage } from "@src/pages/OrganizationMeetingsPage";
import { OrganizationMembersPage } from "@src/pages/OrganizationMembersPage";
import { OrganizationOverviewPage } from "@src/pages/OrganizationOverviewPage";
import { UserProfilePage } from "@src/pages/UserProfilePage";
import { Route, Routes } from "react-router";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/users/:userId" element={<UserProfilePage />} />
        <Route path="/orgs/:orgId" element={<OrganizationLayout />}>
          <Route index element={<OrganizationOverviewPage />} />
          <Route path="documents" element={<OrganizationDocumentsPage />} />
          <Route path="book" element={<OrganizationBookPage />} />
          <Route path="members" element={<OrganizationMembersPage />} />
          <Route path="meetings" element={<OrganizationMeetingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export { App };
