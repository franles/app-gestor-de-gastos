const form = document.getElementById("transactionForm");

//EVENTO PARA ENVIAR EL FORMULARIO
form.addEventListener("submit", async function (event) {
  //submit es el evento que se dispara cuando se hace click en el boton de envio del formulario
  event.preventDefault();
  let transactionFormData = new FormData(form);
  let transactionObj = convertFormDataToTransactionObjet(transactionFormData);
  if (form.transactionAmount.value >= 0) {
    await saveTransactionObj(transactionObj); // espera a que la API confirme que guardo la transaccion
    insertRowInTransactionTable(transactionObj); //inserta una nueva fila en la tabla con los datos de la transaccion que se acaba de agregar
    form.reset(); //limpia el formulario despues de enviar los datos, para que quede listo para una nueva transaccion
  } else {
    alert("El monto debe ser mayor a 0");
  }
})

//DRAW CATEGORY OPTIONS
function draw_category(params) {
  let allCategories = [
    "Alimentacion",
    "Transporte",
    "Entretenimiento",
    "Salud",
    "Educacion",
    "Trabajo",
    "Otros",
  ];
  for (let index = 0; index < allCategories.length; index++) {
    insertCategory(allCategories[index]);
  }
}

// INSERT CATEGORY
function insertCategory(categoryName) {
  const selectElement = document.getElementById("transactionCategory");
  let htmlToInsert = `<option>${categoryName}</option>`;
  selectElement.insertAdjacentHTML("beforeend", htmlToInsert);
}

//EVENTO PARA CARGAR LAS TRANSACCIONES GUARDADAS EN EL LOCAL STORAGE CUANDO SE CARGA EL DOM
document.addEventListener("DOMContentLoaded", async function () {
  draw_category();//cargar las categorias
  //obtiene del localstorage la info de las transactions
  let transactionObjArr = await getTransactionsFromApi();
  console.log("Parseado:", transactionObjArr);
  transactionObjArr.forEach(function (arrayElement) {
    insertRowInTransactionTable(arrayElement);
  });
});



async function getTransactionsFromApi() {
  const response = await fetch("http://localhost:3000/transactions");
  const allTransactions = await response.json();
  return allTransactions;
}

//FUNCIONES PARA MANEJAR TRANSACCIONES
function getNewTransactionId() {
  //esta funcion se encarga de generar un nuevo id para cada transaccion, guardando el ultimo id generado en el local storage
  let lastTransactionId = localStorage.getItem("lastTransactionId") || "-1";
  let newTransactionId = JSON.parse(lastTransactionId) + 1;
  localStorage.setItem("lastTransactionId", JSON.stringify(newTransactionId));
  return newTransactionId;
}

//esta funcion se encarga de convertir los datos del formulario a un objeto con la estructura que necesito para guardar la transaccion en el local storage y mostrarla en la tabla
function convertFormDataToTransactionObjet(transactionFormData) {
  //esta funcion se encarga de convertir los datos del formulario
  let transactionType = transactionFormData.get("transactionType");
  let transactionDescription = transactionFormData.get(
    "transactionDescription",
  );
  let transactionAmount = transactionFormData.get("transactionAmount");
  let transactionCategory = transactionFormData.get("transactionCategory");
  let transactionId = getNewTransactionId();
  return {
    "transactionType": transactionType,
    "transactionDescription": transactionDescription,
    "transactionAmount": transactionAmount,
    "transactionCategory": transactionCategory,
    "transactionId": transactionId
  };
}

//esta funcion se encarga de insertar una nueva fila en la tabla con los datos de la transaccion que se acaba de agregar
function insertRowInTransactionTable(transactionObj) {
  //esta funcion se encarga de insertar una nueva fila en la tabla con los datos de la transaccion que se acaba de agregar
  let transactionTableRef = document.getElementById("transactionTable"); //referencia a la tabla, para poder agregarle filas y celdas

  let newTransactionRowRef = transactionTableRef.insertRow(-1); //crea una nueva fila y la posiciona al final de la tabla, el -1 es para eso
  newTransactionRowRef.setAttribute(
    "data-transaction-id",
    transactionObj["transactionId"],
  );

  let newTypeCellRef = newTransactionRowRef.insertCell(0);
  newTypeCellRef.textContent = transactionObj["transactionType"];

  newTypeCellRef = newTransactionRowRef.insertCell(1); //crea una celda y la posiciona en la columna 1
  newTypeCellRef.textContent = transactionObj["transactionDescription"]; //asigna el valor de la descripcion a esa celda

  newTypeCellRef = newTransactionRowRef.insertCell(2);
  newTypeCellRef.textContent = transactionObj["transactionAmount"];

  newTypeCellRef = newTransactionRowRef.insertCell(3);
  newTypeCellRef.textContent = transactionObj["transactionCategory"];

  let newDeleteCell = newTransactionRowRef.insertCell(4);
  let deleteButton = document.createElement("button");
  deleteButton.textContent = "Eliminar";
  newDeleteCell.appendChild(deleteButton);

  deleteButton.addEventListener("click", (event) => {
    //Cuando hagas click en el button eliminar, agarra la fila
    let transactionRow = event.target.parentNode.parentNode;
    //de la fila agarra el valor del atributo data-transaction-id
    let transactionId = transactionRow.getAttribute("data-transaction-id");
    //elimina la fila del html
    transactionRow.remove();
    // y luego elimina la fila del local storage
    deleteTransactionObj(transactionId);
  });
}

//esta funcion se encarga de eliminar la transaccion del local storage, recibiendo el id de la transaccion a eliminar
function deleteTransactionObj(transactionId) {
  //esta funcion se encarga de eliminar la transaccion del local storage, recibiendo el id de la transaccion a eliminar

  let data = localStorage.getItem("transactionData");

  let transactionObjArr = JSON.parse(data);

  if (!Array.isArray(transactionObjArr)) {
    transactionObjArr = [];
  }

  transactionId = parseInt(transactionId);

  let transactionIndexInArray = transactionObjArr.findIndex(
    (element) => element.transactionId == transactionId,
  );

  if (transactionIndexInArray !== -1) {
    transactionObjArr.splice(transactionIndexInArray, 1);
  }

  localStorage.setItem("transactionData", JSON.stringify(transactionObjArr));
}

// esta funcion se encarga de enviar la transaccion al backend via POST
async function saveTransactionObj(transactionObj) {
  const response = await fetch("http://localhost:3000/transactions", {
    method: "POST",                          // tipo de request: POST
    headers: { "Content-Type": "application/json" }, // le avisamos al backend que mandamos JSON
    body: JSON.stringify(transactionObj)     // convertimos el objeto a JSON para mandarlo
  });
  const result = await response.text();
  console.log("Respuesta del backend:", result); // deberia mostrar "Transaccion agregada"
}

