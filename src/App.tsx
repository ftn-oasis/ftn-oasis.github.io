import { AppLayout } from "@src/components/layout/AppLayout";
import { NotFoundPage } from "@src/pages/NotFoundPage";
import { OrganizationProfilePage } from "@src/pages/OrganizationProfilePage";
import { UserProfilePage } from "@src/pages/UserProfilePage";
import { Route, Routes } from "react-router";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/users/:userId" element={<UserProfilePage />} />
        <Route path="/orgs/:orgId" element={<OrganizationProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export { App };
