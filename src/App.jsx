import React from 'react';
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { StateProvider } from "./context";

import Layout from './views/layout';
import Home from "./views/dashboard";
import Search from './views/Search';
import CompareAircrafts from "./views/compareAircrafts";
import Sample from "./views/Sample/Sample";
import NotFound from "./views/NotFound/NotFound";
import NotAuthorized from "./views/NotAuthorized";
import AircraftLookup from './views/aircraftLookup';
import SingleAircraftDetails from './views/SingleAircraft/SingleAircraftDetails';
import useUserAuthentication from "./custom-hooks/useUserAuthentication";
import "./styles/global.module.scss";
import "./styles/index.css"
import authStyles from "./styles/authentication.module.scss";
import useQuestionLimitation from './custom-hooks/useQuestionLimitation';
import AppContext from './custom-context/appContext';


function App() {
  const { isAuthenticating, isAuthenticated } = useUserAuthentication();
  const { limitation, setLimitation } = useQuestionLimitation();
  const router = createBrowserRouter([
    { path: "/", element: <Layout><Home /></Layout> },
    { path: "/lookup", element: <Layout><AircraftLookup /></Layout> },
    { path: "/search", element: <Layout><Search /></Layout> },
    { path: "/aircraft", element: <Layout><SingleAircraftDetails /></Layout>},
    { path: "/compare", element: <Layout><CompareAircrafts /></Layout> },
    { path: "/sample", element: <Sample /> },
    { path: "/not-found", element: <NotFound />, errorElement: <NotFound /> },
    { path: "/not-authorized", element: <NotAuthorized />, errorElement: <NotFound /> },
  ]);

  return (
    <StateProvider>
      <AppContext.Provider value={{limitation, setLimitation}}>
        {isAuthenticating 
          ? <div className={authStyles.mainwrapper}>Authenticating...</div>
          : isAuthenticated
            ? <RouterProvider router={router} />
            : <NotAuthorized />
        }
      </AppContext.Provider>
    </StateProvider>
  );
}

export default App;
