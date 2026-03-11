const express = require('express')
const cors = require('cors');

const app = express() 
app.use(cors());
app.use(express.json()); // permite leer el body JSON que manda el frontend

const port = 3000  

const transactions = 
[
  {
    "transactionType": "Egreso",
    "transactionDescription": "manzana",
    "transactionAmount": "500",
    "transactionCategory": "Alimentacion",
    "transactionId": 12
  },
  {
    "transactionType": "Ingreso",
    "transactionDescription": "Mi sueldo en dolares",
    "transactionAmount": "5000",
    "transactionCategory": "Trabajo",
    "transactionId": 13
  }
]

console.log(transactions);

//app.get está definiendo una ruta para manejar las solicitudes GET a la raíz del sitio web ('/').
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/transactions', (req, res) => {
  res.send(transactions);
})

app.get('/transactions/:id', (req, res) => {
  const transactionId = req.params.id;
  const selectedTransaction = transactions.find(transaction => transaction.transactionId == transactionId);
  res.send(selectedTransaction);
})


app.post('/transactions', (req, res) => {
  // obteneme la transaccion que viene en la request
  const transaction = req.body; // aca llega el JSON que manda el frontend
  transactions.push(transaction); // guardala en el array global
  res.send("Transaccion agregada"); // respondeme que fue hecho
})


//app.listen está iniciando el servidor y escuchando en el puerto especificado (3000 en este caso). Cuando el servidor esté listo, se ejecutará la función de callback que imprime un mensaje en la consola indicando que la aplicación está escuchando en ese puerto.
app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})