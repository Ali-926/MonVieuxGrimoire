import React, { useEffect, useState } from "react";
import * as PropTypes from "prop-types";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import SignIn from "./pages/SignIn/SignIn";
import Home from "./pages/Home/Home";
import Book from "./pages/Book/Book";
import AddBook from "./pages/AddBook/AddBook";
import UpdateBook from "./pages/updateBook/UpdateBook";

import { APP_ROUTES } from "./utils/constants";
import { useUser } from "./lib/customHooks";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

function AppContent(props) {
  const { user, setUser } = props;
  const location = useLocation();
  const isSignInPage = location.pathname === APP_ROUTES.SIGN_IN;

  return (
    <div>
      <ScrollToTop />
      {!isSignInPage && <Header user={user} setUser={setUser} />}
      <Routes>
        <Route index element={<Home />} />
        <Route
          path={APP_ROUTES.SIGN_IN}
          element={<SignIn setUser={setUser} />}
        />
        <Route path={APP_ROUTES.BOOK} element={<Book />} />
        <Route path={APP_ROUTES.UPDATE_BOOK} element={<UpdateBook />} />
        <Route path={APP_ROUTES.ADD_BOOK} element={<AddBook />} />
      </Routes>
      {!isSignInPage && <Footer />}
    </div>
  );
}

AppContent.propTypes = {
  user: PropTypes.shape({
    userId: PropTypes.string,
    token: PropTypes.string,
  }),
  setUser: PropTypes.func.isRequired,
};

AppContent.defaultProps = {
  user: null,
};

function App() {
  const [user, setUser] = useState(null);
  const { connectedUser } = useUser();

  useEffect(() => {
    setUser(connectedUser);
  }, [connectedUser]);

  return (
    <BrowserRouter>
      <AppContent user={user} setUser={setUser} />
    </BrowserRouter>
  );
}

export default App;
