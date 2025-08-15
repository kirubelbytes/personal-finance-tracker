import { Navigate, Outlet, Routes, Route } from "react-router-dom"
import SignUp from "./pages/auth/Sign-up"
import SignIn from "./pages/auth/Sign-in"
import Settings from "./pages/Settings"
import Dashboard from './pages/Dashboard'
import AccountPage from './pages/Account-page'
import Transactions from './pages/Transaction'
import useStore from "./store/index.js"
import { setAuthToken } from "./libs/apiCall.js"
import { Toaster } from "sonner"

const RootLayOut = () => {
  // const { user } = useStore((state) => (state));
  const user = useStore(state => state.user);
  setAuthToken(user?.token || "");  
  return (
    !user ? (<Navigate to="sign-in" replace={true}/>) : (
      <>
       <div className="min-h-[cal(h-screen-100px)]">
         <Outlet /> 
       </div>
      </>
    )   
  )
};
function App() {

  return (
    <main>
      <div className="w-full min-h-screen px-6 bg-gray-100 md:px-20 dark:bg-slate-900">
        <Routes>
          {/* Protected Routes */}
          <Route element={<RootLayOut/>}>
            <Route path="/" element= { <Navigate to="/overview"/>} />
            <Route path="/overview" element={<Dashboard/>}/>
            <Route path="/transaction" element={<Transactions/>}/>
            <Route path="/settings" element={<Settings/>}/>
            <Route path="/account" element={<AccountPage/>}/>
          </Route>
          {/* Public Routes */}
          <Route path="/sign-up" element={<SignUp/>}/>
          <Route path="/sign-in" element={<SignIn/>}/>
        </Routes>
      </div>
      <Toaster richColors position="top-center"/>
    </main>
  )
}

export default App
