import { AppLayout } from "@src/components/layout/AppLayout";
import { BookPage } from "@src/pages/BookPage";
import { DocumentsPage } from "@src/pages/DocumentsPage";
import { EquipmentLoansPage } from "@src/pages/EquipmentLoansPage";
import { HomePage } from "@src/pages/HomePage";
import { IssuesPage } from "@src/pages/IssuesPage";
import { MaterialDetailPage } from "@src/pages/MaterialDetailPage";
import { MaterialsPage } from "@src/pages/MaterialsPage";
import { MeetingsPage } from "@src/pages/MeetingsPage";
import { NewDocumentPage } from "@src/pages/NewDocumentPage";
import { NewDocumentUploadPage } from "@src/pages/NewDocumentUploadPage";
import { NewEquipmentLoanPage } from "@src/pages/NewEquipmentLoanPage";
import { NewMeetingPage } from "@src/pages/NewMeetingPage";
import { NewOrganizationPage } from "@src/pages/NewOrganizationPage";
import { NewPrintRequestPage } from "@src/pages/NewPrintRequestPage";
import { NewRoomReservationPage } from "@src/pages/NewRoomReservationPage";
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
import { PrintQueuePage } from "@src/pages/PrintQueuePage";
import { PullsPage } from "@src/pages/PullsPage";
import { RoomReservationsPage } from "@src/pages/RoomReservationsPage";
import { SettingsAccountPage } from "@src/pages/SettingsAccountPage";
import { SettingsLayout } from "@src/pages/SettingsLayout";
import { UserProfilePage } from "@src/pages/UserProfilePage";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router";

// useBlocker (作成画面の離脱ガード, useRequestSubmitFlow.ts を参照) はデータ
// ルーター (createBrowserRouter + RouterProvider) の内部でしか使えないため,
// 元は <BrowserRouter><Routes>...</Routes></BrowserRouter> (AppProviders.tsx)
// だった構成をこちらへ移行した — ルート定義の JSX 自体は createRoutesFromElements
// にそのまま渡せるため無変更で, 差分はこの App.tsx と AppProviders.tsx
// (BrowserRouter を外しただけ) の2箇所のみ
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/users/:userId" element={<UserProfilePage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/documents/new" element={<NewDocumentPage />} />
      <Route path="/documents/new/upload" element={<NewDocumentUploadPage />} />
      <Route path="/book" element={<BookPage />} />
      <Route path="/book/new" element={<NewTransactionPage />} />
      <Route path="/meetings" element={<MeetingsPage />} />
      <Route path="/meetings/new" element={<NewMeetingPage />} />
      <Route path="/issues" element={<IssuesPage />} />
      <Route path="/pulls" element={<PullsPage />} />
      <Route path="/orgs" element={<OrgsPage />} />
      <Route path="/orgs/new" element={<NewOrganizationPage />} />
      <Route path="/print-queue" element={<PrintQueuePage />} />
      <Route path="/print-queue/new" element={<NewPrintRequestPage />} />
      <Route path="/room-reservations" element={<RoomReservationsPage />} />
      <Route path="/room-reservations/new" element={<NewRoomReservationPage />} />
      <Route path="/equipment-loans" element={<EquipmentLoansPage />} />
      <Route path="/equipment-loans/new" element={<NewEquipmentLoanPage />} />
      <Route path="/materials" element={<MaterialsPage />} />
      <Route path="/materials/:documentKey" element={<MaterialDetailPage />} />
      <Route path="/settings" element={<SettingsLayout />}>
        <Route index element={<SettingsAccountPage />} />
      </Route>
      <Route path="/orgs/:orgId" element={<OrganizationLayout />}>
        <Route index element={<OrganizationOverviewPage />} />
        <Route path="documents" element={<OrganizationDocumentsPage />} />
        <Route path="documents/:documentId" element={<OrganizationDocumentLayout />}>
          <Route index element={<OrganizationDocumentOverviewPage />} />
          <Route path="versions" element={<OrganizationDocumentVersionsPage />} />
          <Route path="issues" element={<OrganizationDocumentIssuesPage />} />
          <Route path="pulls" element={<OrganizationDocumentPullsPage />} />
          <Route path="editors" element={<OrganizationDocumentEditorsPage />} />
        </Route>
        <Route path="book" element={<OrganizationBookPage />} />
        <Route path="book/:transactionId" element={<OrganizationTransactionLayout />}>
          <Route index element={<OrganizationTransactionBreakdownPage />} />
          <Route path="procedure" element={<OrganizationTransactionProcedurePage />} />
          <Route path="receipt" element={<OrganizationTransactionReceiptPage />} />
        </Route>
        <Route path="members" element={<OrganizationMembersPage />} />
        <Route path="meetings" element={<OrganizationMeetingsPage />} />
        <Route path="meetings/:meetingId" element={<OrganizationMeetingLayout />}>
          <Route index element={<OrganizationMeetingAgendaPage />} />
          <Route path="materials" element={<OrganizationMeetingMaterialsPage />} />
          <Route path="attendees" element={<OrganizationMeetingAttendeesPage />} />
          <Route path="minutes" element={<OrganizationMeetingMinutesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

export { App };
