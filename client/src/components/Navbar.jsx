import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import '../css/Navbar.css';
import { useNavigate } from 'react-router-dom';
import AuthAPI from '../services/AuthAPI';
import UsersAPI from '../services/UsersAPI';
import { loadStripe } from '@stripe/stripe-js';

function CustomNavbar({ isAuthenticated, setIsAuthenticated, dataUser, setDataUser }) {
    const navigate = useNavigate();
    const stripePromise = loadStripe('pk_test_51R6eCg7bv3eYgpHrl0msZXzey0nuoKE4qMVcTvexuQcbxYbu4hE1UhC0K04HzS4ZunifmwmfiUeTrqBC4SVEYlVZ00iqLrwFm4');
    const logOut = async () => {
        AuthAPI.logoutUser()
            .then(() => {
                setIsAuthenticated(false);
                setDataUser({ 'username': '', 'fullname': '', 'group': '' });
                navigate('/login');
            })
            .catch(() => {
                alert('Error authenticating: Logout failed');
            });
    }

    const handleUpgradePremium = async (e) => {
        e.preventDefault();
        // Redirect to the upgrade page
        // This assumes you have a route set up for upgrading to premium
        try {
            const response = await UsersAPI.upgradePremium();
            const { sessionId } = response; 
            const stripe = await stripePromise;
            await stripe.redirectToCheckout({ sessionId });
        } catch (error) {
            alert('Error during upgrade: ' + error.message);
        }
    };

    return (
        <Navbar bg="light" expand="lg">
            <Container className="container">
                <Navbar.Brand href="/"><img height='60px' src='/logo.jpg' /></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav>
                        <Nav.Link href="/"><b>Home</b></Nav.Link>
                        <Nav.Link href="/quote">Quote</Nav.Link>
                        {isAuthenticated && (
                            <>
                                {['User', 'Premium User'].includes(dataUser.group) && (
                                    <>
                                        <Nav.Link href="/buy">Buy</Nav.Link>
                                        <Nav.Link href="/sell">Sell</Nav.Link>
                                        <Nav.Link href="/history">History</Nav.Link>
                                    </>
                                )}
                                {dataUser.group === 'Expert' && (
                                    <Nav.Link href="/">Chats</Nav.Link>
                                )}
                                {dataUser.group === 'Premium User' && (
                                    <Nav.Link href="/">Expert</Nav.Link>
                                )}
                                {dataUser.group === 'User' && (
                                    <Nav.Link disabled>Expert (Premium Only)</Nav.Link>
                                )}
                            </>
                        )}
                    </Nav>
                    <Nav className="ms-auto">
                        {isAuthenticated ? (
                            <NavDropdown title={dataUser.fullname} id="basic-nav-dropdown">
                                <NavDropdown.Item disabled>{dataUser.group}</NavDropdown.Item>
                                <NavDropdown.Item onClick={logOut}>Log Out</NavDropdown.Item>
                                <NavDropdown.Item href="/changepw">Change Password</NavDropdown.Item>
                                {['User', 'Premium User'].includes(dataUser.group) &&
                                    <NavDropdown.Item href="/addcash">Add Cash</NavDropdown.Item>
                                }
                                {dataUser.group === 'User' &&
                                    <NavDropdown.Item onClick={handleUpgradePremium}>Upgrade Premium</NavDropdown.Item>
                                }
                            </NavDropdown>
                        ) : (
                            <NavDropdown title="Start Here" id="basic-nav-dropdown">
                                <NavDropdown.Item href="/login">Log In</NavDropdown.Item>
                                <NavDropdown.Item href="/signup">Sign Up</NavDropdown.Item>
                            </NavDropdown>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default CustomNavbar;
