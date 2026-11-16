const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware para procesar JSON y servir archivos estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Función auxiliar para leer la base de datos JSON
function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            turnos: [],
            expedientes: [
                { id: 1, numero: "Exp. #402 - Venta Inmueble Centro", solicitante: "Pérez / Ruarte", etapa: "Estudio de Títulos", progreso: 40 },
                { id: 2, numero: "Exp. #403 - Constitución SRL", solicitante: "Tech Solutions S.A.", etapa: "Firma de Protocolo", progreso: 80 }
            ]
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// Función auxiliar para escribir en la base de datos JSON
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// --- API DE TURNOS ---
app.get('/api/turnos', (req, res) => {
    const data = readData();
    res.json(data.turnos);
});

app.post('/api/turnos', (req, res) => {
    const data = readData();
    const nuevoTurno = {
        id: Date.now(),
        nombre: req.body.nombre,
        email: req.body.email,
        telefono: req.body.telefono,
        motivo: req.body.motivo,
        estado: 'Pendiente'
    };
    data.turnos.push(nuevoTurno);
    writeData(data);
    res.status(201).json({ success: true, turno: nuevoTurno });
});

app.put('/api/turnos/:index', (req, res) => {
    const data = readData();
    const index = parseInt(req.params.index);
    if (data.turnos[index]) {
        data.turnos[index].estado = req.body.estado;
        writeData(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Turno no encontrado' });
    }
});

app.delete('/api/turnos/:index', (req, res) => {
    const data = readData();
    const index = parseInt(req.params.index);
    if (data.turnos[index]) {
        data.turnos.splice(index, 1);
        writeData(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Turno no encontrado' });
    }
});

// --- API DE EXPEDIENTES ---
app.get('/api/expedientes', (req, res) => {
    const data = readData();
    res.json(data.expedientes);
});

app.post('/api/expedientes', (req, res) => {
    const data = readData();
    const nuevoExp = {
        id: Date.now(),
        numero: req.body.numero,
        solicitante: req.body.solicitante,
        etapa: req.body.etapa,
        progreso: parseInt(req.body.progreso) || 20
    };
    data.expedientes.push(nuevoExp);
    writeData(data);
    res.status(201).json({ success: true, expediente: nuevoExp });
});

app.delete('/api/expedientes/:index', (req, res) => {
    const data = readData();
    const index = parseInt(req.params.index);
    if (data.expedientes[index]) {
        data.expedientes.splice(index, 1);
        writeData(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Expediente no encontrado' });
    }
});
// Servir la aplicación cliente en la ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sin espacio después de admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor de la escribanía Athie corriendo en http://localhost:${PORT}`);
});