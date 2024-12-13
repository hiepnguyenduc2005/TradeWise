import NumberFormat from "../utilities/NumberFormat"
export default function Finance({ company, price }) {
    return (
        <div>
                        <table className="profile-table">
                <thead>
                    <tr>
                        <th>Metrics</th>
                        <th>Values</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Market Cap</td>
                        <td>{NumberFormat(Number(company.mktCap))}</td>
                    </tr>
                    <tr>
                        <td>52-Week</td>
                        <td>{company.range}</td>
                    </tr>
                    <tr>
                        <td>Price</td>
                        <td>{price.price}</td>
                    </tr>
                    <tr>
                        <td>Volume Avg.</td>
                        <td>{NumberFormat(Number(company.volAvg))}</td>
                    </tr>
                </tbody>
            </table>
        </div>
)};