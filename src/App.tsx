import { AppLayout } from "@src/components/layout/AppLayout";
import { NotFoundPage } from "@src/pages/NotFoundPage";
import { OrganizationBookPage } from "@src/pages/OrganizationBookPage";
import { OrganizationDocumentsPage } from "@src/pages/OrganizationDocumentsPage";
import { OrganizationLayout } from "@src/pages/OrganizationLayout";
import { OrganizationMeetingsPage } from "@src/pages/OrganizationMeetingsPage";
import { OrganizationMembersPage } from "@src/pages/OrganizationMembersPage";
import { OrganizationOverviewPage } from "@src/pages/OrganizationOverviewPage";
import { OrganizationTransactionBreakdownPage } from "@src/pages/OrganizationTransactionBreakdownPage";
import { OrganizationTransactionLayout } from "@src/pages/OrganizationTransactionLayout";
import { OrganizationTransactionProcedurePage } from "@src/pages/OrganizationTransactionProcedurePage";
import { OrganizationTransactionReceiptPage } from "@src/pages/OrganizationTransactionReceiptPage";
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
          <Route
            path="book/:transactionId"
            element={<OrganizationTransactionLayout />}
          >
            <Route index element={<OrganizationTransactionBreakdownPage />} />
            <Route
              path="procedure"
              element={<OrganizationTransactionProcedurePage />}
            />
            <Route path="receipt" element={<OrganizationTransactionReceiptPage />} />
          </Route>
          <Route path="members" element={<OrganizationMembersPage />} />
          <Route path="meetings" element={<OrganizationMeetingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export { App };
