const LaptopCard = ({ laptop }) => {
    const specsToShow = {
        "Processor": laptop.Processor,
        "Memory": laptop.Memory,
        "Internal Drive": laptop["Internal Drive"],
        "Display": laptop.Display,
        "Graphics": laptop.Graphics,
        "Screen Part #": laptop["Screen Replacement Part # (Common)"],
        "Battery Part #": laptop["Battery Replacement Part # (Common)"],
        "RAM Part #": laptop["RAM Replacement Part # (Common)"],
        "SSD Part #": laptop["SSD Replacement Part # (Common)"]
    };

    return (
        <div className="laptop-card">
            <h3>{laptop.Model}</h3>
            {Object.entries(specsToShow).map(([key, value]) => {
                if (value) {
                    return (
                        <div key={key} className="spec">
                            <span className="spec-key">{key}:</span>
                            <span className="spec-value">{value}</span>
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
};

const Laptops = () => {
    const [laptops, setLaptops] = React.useState([]);

    React.useEffect(() => {
        fetch('../laptops.json')
            .then(response => response.json())
            .then(data => setLaptops(data));
    }, []);

    const elitebooks = laptops.filter(laptop => laptop.Model.includes('EliteBook'));
    const zbooks = laptops.filter(laptop => laptop.Model.includes('ZBook'));

    return (
        <React.Fragment>
            <h1 className="section-title">HP Laptops Parts List Database</h1>
            <h3 className="section-title">HP EliteBook</h3>
            <div id="elitebook-cards" className="card-grid">
                {elitebooks.map(laptop => <LaptopCard key={laptop.Model} laptop={laptop} />)}
            </div>
            <h3 className="section-title">HP ZBook Studio</h3>
            <div id="zbook-cards" className="card-grid">
                {zbooks.map(laptop => <LaptopCard key={laptop.Model} laptop={laptop} />)}
            </div>
        </React.Fragment>
    );
};

ReactDOM.render(<Laptops />, document.getElementById('root'));