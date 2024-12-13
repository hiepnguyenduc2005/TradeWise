import Finance from "./Finance"
import NumberFormat from "../utilities/NumberFormat";

export default function About({company, price}) {
    return (
        <div className="profile-row">
            <div className="profile-description">
                {company.description}
            </div>
            <div className="profile-summary">
            <table className="profile-table">
                <thead>
                    <tr>
                        <th>Metrics</th>
                        <th>Values</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>CEO</td>
                        <td>{company.ceo}</td>
                    </tr>
                    <tr>
                        <td>Sector</td>
                        <td>{company.sector}</td>
                    </tr>
                    <tr>
                        <td>Industry</td>
                        <td>{company.industry}</td>
                    </tr>
                    <tr>
                        <td>Website</td>
                        <td><a className="profile-link" href={company.website}>{company.website}</a></td>
                    </tr>
                    <tr>
                        <td>Address</td>
                        <td>{company.address}, {company.city}, {company.state} {company.zip}, {company.country}</td>
                    </tr>
                    <tr>
                        <td>Employee</td>
                        <td>{NumberFormat(Number(company.fullTimeEmployees))}</td>
                    </tr>
                </tbody>
            </table>
            <h5 className="profile-section">Financial Summary</h5>
            <Finance company={company} price={price} />
            </div>
        </div>
)};