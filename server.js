const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // In a real application, you should use a more secure way to store and check credentials
    if (username === 'admin' && password === 'password') {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

const ticketsPath = path.join(__dirname, 'data', 'tickets.json');

app.get('/api/tickets', (req, res) => {
    fs.readFile(ticketsPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error reading tickets data' });
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/tickets', (req, res) => {
    const newTicket = req.body;

    fs.readFile(ticketsPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error reading tickets data' });
        }

        const tickets = JSON.parse(data);
        newTicket.id = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1;
        tickets.push(newTicket);

        fs.writeFile(ticketsPath, JSON.stringify(tickets, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Error writing tickets data' });
            }
            res.json(newTicket);
        });
    });
});

app.delete('/api/tickets/:id', (req, res) => {
    const ticketId = parseInt(req.params.id, 10);

    fs.readFile(ticketsPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error reading tickets data' });
        }

        let tickets = JSON.parse(data);
        const ticketIndex = tickets.findIndex(t => t.id === ticketId);

        if (ticketIndex === -1) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        tickets = tickets.filter(t => t.id !== ticketId);

        fs.writeFile(ticketsPath, JSON.stringify(tickets, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Error writing tickets data' });
            }
            res.json({ success: true });
        });
    });
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});