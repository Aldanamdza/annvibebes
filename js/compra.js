document.addEventListener("DOMContentLoaded", function () {

    const productos = JSON.parse(sessionStorage.getItem('productos')) || [];
    const total = parseFloat(sessionStorage.getItem('total')) || 0;
    const detalle = document.getElementById("detalle");
    const resumenHidden = document.getElementById("resumenCompra");
    
    if (productos.length === 0){
        detalle.innerHTML = "<p>No hay productos en el carrito.</p>";
    }
    else {
        let html = "<ul>";
        let resumenTexto = "";
        productos.forEach (producto => {
            html +=`<li>${producto.nombre} - $ {producto.cantidad} u. - $$ {producto.precio * producto.cantidad}</li>`;
            resumenTexto += `${producto.nombre} - ${prodictp.cantidad} u. $${producto.precio * producto.cantidad}/n;
        })`;
        html += `</ul><p><strong>Total: </strong> $$ {total.toFixed (2)}</p>`;
        resumenTexto += `/nTOTAL: $$ {total.toFixed(2)}`;

        detalle.innerHTML = html;
        resumenHidden.value = resumenTexto;
    }
}
});

    /*const resumenDiv = document.getElementById("detalle");

    let resumenTextoHTML = "<h3>Resumen de tu Compra:</h3><br>";

    for (let i = 0; i < productos.length; i++) {
        const productoActual = productos[i]; 
        resumenTextoHTML += `${productoActual.nombre}: $${parseFloat(productoActual.precio).toFixed(2)}<br>`;
    }

    resumenTextoHTML += `<br><strong>Total a pagar: $${totalFormateado}</strong>`;
    resumenDiv.innerHTML = resumenTextoHTML;

    function enviarFormulario(event) {
        event.preventDefault();

        const nombreContacto = document.getElementById('nombre').value.trim();
        const emailContacto = document.getElementById('contactoEmail').value.trim();
        const telefonoContacto = document.getElementById('telefono').value.trim();

        if (!nombreContacto || !emailContacto || !telefonoContacto) {
            alert("Por favor, completa todos los campos de contacto antes de enviar.");
            return; // Detenemos la función si falta algún campo.
        }

        let detallesCarritoParaEnvio = '';
        for (let i = 0; i < productos.length; i++) {
            const productoActual = productos[i];
            detallesCarritoParaEnvio += `${productoActual.nombre} - $${parseFloat(productoActual.precio).toFixed(2)}\n`;
        }

        document.getElementById('carritoData').value = detallesCarritoParaEnvio;
        document.getElementById('totalCarrito').value = `$${totalFormateado}`;
        document.getElementById('formulario').submit();
    }

    const botonEnviar = document.getElementById('botonEnviar');
   
    if (botonEnviar) {
        botonEnviar.addEventListener('click', enviarFormulario);
    } else {
        console.warn("ADVERTENCIA: No se encontró el botón con ID 'botonEnviar'.");
    }
}); 