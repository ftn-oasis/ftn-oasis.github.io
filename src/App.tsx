import { AppLayout } from "@src/components/layout/AppLayout";
import { BookPage } from "@src/pages/BookPage";
import { DocumentsPage } from "@src/pages/DocumentsPage";
import { HomePage } from "@src/pages/HomePage";
import { IssuesPage } from "@src/pages/IssuesPage";
import { MaterialDetailPage } from "@src/pages/MaterialDetailPage";
import { MaterialsPage } from "@src/pages/MaterialsPage";
import { MeetingsPage } from "@src/pages/MeetingsPage";
import { NewDocumentPage } from "@src/pages/NewDocumentPage";
import { NewTransactionPage } from "@src/pages/NewTransactionPage";
import { NotFoundPage } from "@src/pages/NotFoundPage";
import { NotificationsPage } from "@src/pages/NotificationsPage";
import { OrganizationBookPage } from "@src/pages/OrganizationBookPage";
import { OrganizationDocumentEditorsPage } from "@src/pages/OrganizationDocumentEditorsPage";
import { OrganizationDocumentIssuesPage } from "@src/pages/OrganizationDocumentIssuesPage";
import { OrganizationDocumentLayout } from "@src/pages/OrganizationDocumentLayout";
import { OrganizationDocumentOverviewPage } from "@src/pages/OrganizationDocumentOverviewPage";
import { OrganizationDocumentPullsPage } from "@src/pages/OrganizationDocumentPullsPage";
import { OrganizationDocumentVersionsPage } from "@src/pages/OrganizationDocumentVersionsPage";
import { OrganizationDocumentsPage } from "@src/pages/OrganizationDocumentsPage";
import { OrganizationLayout } from "@src/pages/OrganizationLayout";
import { OrganizationMeetingAgendaPage } from "@src/pages/OrganizationMeetingAgendaPage";
import { OrganizationMeetingAttendeesPage } from "@src/pages/OrganizationMeetingAttendeesPage";
import { OrganizationMeetingLayout } from "@src/pages/OrganizationMeetingLayout";
import { OrganizationMeetingMaterialsPage } from "@src/pages/OrganizationMeetingMaterialsPage";
import { OrganizationMeetingMinutesPage } from "@src/pages/OrganizationMeetingMinutesPage";
import { OrganizationMeetingsPage } from "@src/pages/OrganizationMeetingsPage";
import { OrganizationMembersPage } from "@src/pages/OrganizationMembersPage";
import { OrganizationOverviewPage } from "@src/pages/OrganizationOverviewPage";
import { OrganizationTransactionBreakdownPage } from "@src/pages/OrganizationTransactionBreakdownPage";
import { OrganizationTransactionLayout } from "@src/pages/OrganizationTransactionLayout";
import { OrganizationTransactionProcedurePage } from "@src/pages/OrganizationTransactionProcedurePage";
import { OrganizationTransactionReceiptPage } from "@src/pages/OrganizationTransactionReceiptPage";
import { OrgsPage } from "@src/pages/OrgsPage";
import { PullsPage } from "@src/pages/PullsPage";
import { UserProfilePage } from "@src/pages/UserProfilePage";
import { Route, Routes } from "react-router";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/users/:userId" element={<UserProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/documents/new" element={<NewDocumentPage />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/book/new" element={<NewTransactionPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/pulls" element={<PullsPage />} />
        <Route path="/orgs" element={<OrgsPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/materials/:documentKey" element={<MaterialDetailPage />} />
        <Route path="/orgs/:orgId" element={<OrganizationLayout />}>
          <Route index element={<OrganizationOverviewPage />} />
          <Route path="documents" element={<OrganizationDocumentsPage />} />
          <Route
            path="documents/:documentId"
            element={<OrganizationDocumentLayout />}
          >
            <Route index element={<OrganizationDocumentOverviewPage />} />
            <Route path="versions" element={<OrganizationDocumentVersionsPage />} />
            <Route path="issues" element={<OrganizationDocumentIssuesPage />} />
            <Route path="pulls" element={<OrganizationDocumentPullsPage />} />
            <Route path="editors" element={<OrganizationDocumentEditorsPage />} />
          </Route>
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
          <Route
            path="meetings/:meetingId"
            element={<OrganizationMeetingLayout />}
          >
            <Route index element={<OrganizationMeetingAgendaPage />} />
            <Route path="materials" element={<OrganizationMeetingMaterialsPage />} />
            <Route path="attendees" element={<OrganizationMeetingAttendeesPage />} />
            <Route path="minutes" element={<OrganizationMeetingMinutesPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export { App };
