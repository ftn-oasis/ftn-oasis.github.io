import { AppLayout } from "@src/components/layout/AppLayout";
import { UserProfilePage } from "@src/pages/UserProfilePage";
import { Route, Routes } from "react-router";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/:userId" element={<UserProfilePage />} />
      </Route>
    </Routes>
  );
}

export { App };
