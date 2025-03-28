import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

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
  const [dataUser, setDataUser] = useState({'username': '', 'fullname': '', 'group': ''});
  const [loading, setLoading] = useState(true); 
  const [tempTransactions, setTempTransactions] = useState([]);
  const [cash, setCash] = useState(0);

    useEffect(() => {
        AuthAPI.authenticate()
        .then(data => {
            setIsAuthenticated(data.isAuthenticated);
            setLoading(false); 
            if (data.isAuthenticated) {
                setDataUser({username: data.username, fullname: data.fullname, group: data.group});
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
        <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} 
        dataUser={dataUser} setDataUser={setDataUser}/>
        <div id="floating">
          <span className="welcome">Welcome to Trade<b>Wise</b>!</span>
        </div>
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
