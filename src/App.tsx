import { AppLayout } from "@src/components/layout/AppLayout";
import { UserProfilePage } from "@src/pages/UserProfilePage";
import { Route, Routes } from "react-router";

import "./App.css";

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
