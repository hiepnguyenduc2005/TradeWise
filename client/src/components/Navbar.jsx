import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import '../css/Navbar.css';
import { useNavigate } from 'react-router-dom';
import AuthAPI from '../services/AuthAPI';

function CustomNavbar({ isAuthenticated, setIsAuthenticated, dataUser, setDataUser }) {
    const navigate = useNavigate();
    
    const logOut = async () => {
        AuthAPI.logoutUser()
            .then(() => {
                setIsAuthenticated(false);
                setDataUser({ 'username': '', 'fullname': '' });
                navigate('/login');
            })
            .catch(() => {
                alert('Error authenticating: Logout failed');
            });
    }

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
                                <Nav.Link href="/buy">Buy</Nav.Link>
                                <Nav.Link href="/sell">Sell</Nav.Link>
                                <Nav.Link href="/history">History</Nav.Link>
                            </>
                        )}
                    </Nav>
                    <Nav className="ms-auto">
                        {isAuthenticated ? (
                            <NavDropdown title={dataUser.fullname} id="basic-nav-dropdown">
                                <NavDropdown.Item onClick={logOut}>Log Out</NavDropdown.Item>
                                <NavDropdown.Item href="/changepw">Change Password</NavDropdown.Item>
                                <NavDropdown.Item href="/addcash">Add Cash</NavDropdown.Item>
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
