const CopyToClipboard = ({ text }) => {
    const [isCopied, setIsCopied] = React.useState(false);

    const copy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000); // Reset after 2 seconds
        });
    };

    return (
        <button onClick={copy} className="copy-button" title="Copy to clipboard">
            {isCopied ? <i className="fas fa-check"></i> : <i className="fas fa-copy"></i>}
        </button>
    );
};

const LaptopCard = ({ laptop }) => {
    const specsToShow = {
        "Processor": laptop.Processor,
        "Memory": laptop.Memory,
        "Internal Drive": laptop["Internal Drive"],
        "Display": laptop.Display,
        "Graphics": laptop.Graphics,
        "Screen Part #(s)": laptop["Screen Replacement Part # (Common)"],
        "Battery Part #(s)": laptop["Battery Replacement Part # (Common)"],
        "RAM Part #(s)": laptop["RAM Replacement Part # (Common)"],
        "SSD Part #(s)": laptop["SSD Replacement Part # (Common)"]
    };

    const partNumberKeys = ["Screen Part #(s)", "Battery Part #(s)", "RAM Part #(s)", "SSD Part #(s)"];

    return (
        <div className="laptop-card">
            <h3>{laptop.Model}</h3>
            {Object.entries(specsToShow).map(([key, value]) => {
                if (value) {
                    return (
                        <div key={key} className="spec">
                            <span className="spec-key">{key}:</span>
                            <span className="spec-value">{value}</span>
                            {partNumberKeys.includes(key) && <CopyToClipboard text={value} />}
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