function traer() {

    const contenido = document.getElementById("contenido");
    const reseñasTexto   =[
            "Excelente servicio, muy satisfecho con mi compra.",
            "Los productos llegaron a tiempo y en perfectas condiciones.",
             "Muy bueno. Recomendado.",
        "Me atendieron rápido por Whatsapp, aunque el proceso de pago fue lento pero seguro.",
        "Buena atención, pero el envio tardó un poco más de lo esperado",
        "Precios accesibles.",
        "Muy buena calidad de los pañales, y productos de higiene",
        "La atención al cliente fue excelente, me ayudaron con todas mis dudas.",
        "Los productos son de muy buena calidad, definitivamente volveré a comprar."
    ]; 
    fetch('https://randomuser.me/api/?results=9') // Llamada a la API
        .then(response => response.json()) // Convierte la respuesta de la API a JSON (objeto)
        .then(data => {
            contenido.innerHTML = "";
                    data.results.forEach((user, i) => {
            const div = document .createElement('div');
            div.classList.add('reseñas');
            div.innerHTML = `
            <img src="${user.picture.thumbnail}" alt="foto-cliente" style="border-radius:50%; margin-bottom:5px;">
            <p class="cliente-nombre">${user.name.first} ${user.name.last}</p>
            <div class="estrellas">&#9733;&#9733;&#9733;&#9733;&#9734;</div>
            <div class="comentario">${reseñasTexto[i]}</div>`;

            contenido.appendChild(div);           
                    });
   
            console.log(data); // Mostrar toda la respuesta en consola.
 })
          
        .catch(error => console.error('Error al obtener los datos:', error)); // Manejo de errores
}