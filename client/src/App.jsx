import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

import React, { useEffect, useState } from 'react';
import { useRoutes } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import ProtectedRoute from './components/ProtectedRoute';
import AntiProtectedRoute from './components/AntiProtectedRoute';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import Demo from './components/Demo';

import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';
import AddCash from './pages/AddCash';
import Quote from './pages/Quote';
import Profile from './pages/Profile';
import Buy from './pages/Buy';
import Sell from './pages/Sell';
import History from './pages/History';
import NotFound from './pages/NotFound';
import Success from './pages/Success';
import Failure from './pages/Failure';

import AuthAPI from './services/AuthAPI';
import UsersAPI from './services/UsersAPI';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [dataUser, setDataUser] = useState({'id': '', 'username': '', 'fullname': '', 'group': ''});
  const [loading, setLoading] = useState(true); 
  const [tempTransactions, setTempTransactions] = useState([]);
  const [cash, setCash] = useState(0);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

    const navigate = useNavigate();
    const logOut = async () => {
        AuthAPI.logoutUser()
            .then(() => {
                setIsAuthenticated(false);
                setDataUser({'id': '', 'username': '', 'fullname': '', 'group': '' });
                navigate('/login');
            })
            .catch(() => {
                alert('Error authenticating: Logout failed');
            });
    }

    useEffect(() => {
        const updateActivity = () => {
            localStorage.setItem('lastActivity', Date.now().toString());
        };
    
        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
    
        return () => {
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
        };
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        const checkTimeout = () => {
            const last = parseInt(localStorage.getItem('lastActivity') || '0');
            const now = Date.now();
            const diff = (now - last) / 1000; 

            const EXPIRE_TIME = 600;
            if (diff > 0.9 * EXPIRE_TIME && diff < EXPIRE_TIME) {
                setShowTimeoutWarning(true);  
            } else if (diff >= EXPIRE_TIME) {
                logOut();
            } else {
                setShowTimeoutWarning(false);
            }
        };

        const interval = setInterval(checkTimeout, 10000); 
        return () => clearInterval(interval);
    }, [isAuthenticated]);
  
    useEffect(() => {
        AuthAPI.authenticate()
        .then(data => {
            setIsAuthenticated(data.isAuthenticated);
            setLoading(false); 
            if (data.isAuthenticated) {
                setDataUser({ 'id': data.id, 'username': data.username, 'fullname': data.fullname, 'group': data.group });
            }
        })
        .catch(() => {
            setIsAuthenticated(false);
            setLoading(false); 
        });
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }
        UsersAPI.temp()
          .then(data => {
              if (Array.isArray(data)) {
                  setTempTransactions(data.reverse())
              }
          })
          .catch(error => console.error('Error fetching transactions:', error.message));
        UsersAPI.showCash()
          .then(data => setCash(data.balance))
          .catch(error => console.error('Error fetching cash:', error.message));
    }, [isAuthenticated, dataUser.group]);

  let element = useRoutes([
      {
          path: '/',
          element: <Index isAuthenticated={isAuthenticated} dataUser={dataUser} cash={cash} />,
      },
      {   
          path: '/login',
          element: (
              <AntiProtectedRoute isAuthenticated={isAuthenticated}>
                  <Login setIsAuthenticated={setIsAuthenticated} setDataUser={setDataUser}/>
              </AntiProtectedRoute>
          ),
      },
      {
          path: '/signup',
          element: (
              <AntiProtectedRoute isAuthenticated={isAuthenticated}>
                  <Signup setIsAuthenticated={setIsAuthenticated} setDataUser={setDataUser}/>
              </AntiProtectedRoute>
          ),
      },
      {
          path: '/changepw',
          element: (
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ChangePassword />
              </ProtectedRoute>
          ),
      },
      {
        path: '/success', 
        element: (
            <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Success />
            </ProtectedRoute>
        ),
      },
      {
        path: '/failure',
        element: (
            <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Failure />
            </ProtectedRoute>
        ),
      },
      {
          path: '/addcash',
          element: (
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AddCash setCash={setCash}/>
              </ProtectedRoute>
          ),
      },
      {
          path: '/quote',
          element: <Quote />,
      },
      {
          path: 'quote/:symbol',
          element: <Profile dataUser={dataUser}/>,
      },
      {
          path: '/buy',
          element: (
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Buy setCash={setCash} setTempTransactions={setTempTransactions}/>
              </ProtectedRoute>
          ),
      },
      {
          path: '/sell',
          element: (
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Sell setCash={setCash} setTempTransactions={setTempTransactions}/>
              </ProtectedRoute>
          ),
      },
      {
          path: '/history',
          element: (
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <History />
              </ProtectedRoute>
          ),
      },
      {
          path: '*',
          element: <NotFound />,
      }
  ]);

  if (loading || (isAuthenticated && !dataUser.username)) {
    return "Loading...";  
  }

  return (
      <div>
        <Navbar logOut={logOut} isAuthenticated={isAuthenticated} 
        dataUser={dataUser} />
        <div id="floating">
          <span className="welcome">Welcome to Trade<b>Wise</b>!</span>
        </div>
        {showTimeoutWarning && (
            <div className="session-warning-modal">
                <p>Your session will expire soon. Move your mouse or press a key to stay logged in.</p>
            </div>
        )}
        <Row className="row">
          <Col xs={12} md={9}>
            <div className="element">
                {element}
            </div>
          </Col>
          <Col xs={12} md={3}>
            <div className="component">
                {isAuthenticated ? (
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                        <Chatbot tempTransactions={tempTransactions} cash={cash} dataUser={dataUser} />
                    </ProtectedRoute>)
                    : <Demo />}
            </div>
          </Col>
        </Row>
      </div>
  );
}

export default App
