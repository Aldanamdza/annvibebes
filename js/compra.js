document.addEventListener('DOMContentLoaded', function() {
    // --- Referencias a elementos específicos de compra.html ---
    const detalleCompraDiv = document.getElementById('detalle');
    const formulario = document.getElementById('formulario');
    const botonEnviar = document.getElementById('botonEnviar');

    // --- Funciones de utilidad del carrito (tomadas de tu JS principal) ---
    // Estas funciones son clave para interactuar con localStorage
    function getCartFromLocalStorage() {
        return JSON.parse(localStorage.getItem('carrito')) || [];
    }

    // --- Función para renderizar el resumen en #detalle ---
    function mostrarResumenCompra() {
        const carrito = getCartFromLocalStorage();
        let contenidoHTML = '';
        let totalCompra = 0;

        if (carrito.length === 0) {
            contenidoHTML = '<p>Tu carrito está vacío. ¡Añade algunos productos desde la página de <a href="pañales.html">Productos</a>!</p>';
            // Si el carrito está vacío, ocultamos el formulario para evitar envíos sin productos.
            formulario.style.display = 'none';
        } else {
            contenidoHTML += '<h4>Productos en tu solicitud:</h4>';
            carrito.forEach(item => {
                const precioNumerico = parseFloat(item.precio) || 0;
                const cantidad = item.cantidad || 1;
                const subtotal = precioNumerico * cantidad;

                contenidoHTML += `
                    <p>
                        <strong>${item.nombre}</strong>
                        ${item.talle && item.talle !== 'N/A' ? `(Talle: ${item.talle})` : ''}
                        ${item.pack && item.pack !== 'N/A' ? `(${item.pack})` : ''}
                        (x${cantidad}) - $${precioNumerico.toFixed(2)} c/u =
                        <strong>$${subtotal.toFixed(2)}</strong>
                    </p>
                `;
                totalCompra += subtotal;
            });
            contenidoHTML += `<hr><p><strong>Total compra: $${totalCompra.toFixed(2)}</strong></p>`;
            // Aseguramos que el formulario esté visible si hay productos
            formulario.style.display = 'flex'; 
        }

        detalleCompraDiv.innerHTML = contenidoHTML;
    }

    // --- Manejo del envío del formulario ---
    formulario.addEventListener('submit', function(event) {
        const carritoActual = getCartFromLocalStorage();
        if (carritoActual.length === 0) {
            alert('No puedes enviar la solicitud de compra, tu carrito está vacío.');
            event.preventDefault(); // Evita que el formulario se envíe
            return;
        }

        // Antes de enviar a Formspree, puedes añadir un campo oculto
        // con los detalles del carrito para que te lleguen por email.
        const productosComprados = carritoActual.map(item =>
            `${item.nombre} ${item.talle !== 'N/A' ? `(Talle: ${item.talle})` : ''} ${item.pack !== 'N/A' ? `(${item.pack})` : ''} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}`
        ).join('\n');

        const totalFinal = carritoActual.reduce((sum, item) => sum + (parseFloat(item.precio) || 0) * (item.cantidad || 1), 0);

        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'Resumen de Pedido'; // Nombre del campo que verás en Formspree
        hiddenInput.value = `Productos:\n${productosComprados}\n\nTotal compra: $${totalFinal.toFixed(2)}`;
        formulario.appendChild(hiddenInput);

        // Opcional: Deshabilitar el botón para evitar múltiples envíos
        botonEnviar.disabled = true;
        botonEnviar.textContent = 'Enviando...';

        setTimeout(() => { // Pequeño retraso para dar tiempo a Formspree
            localStorage.removeItem('carrito');
            alert('¡Solicitud de compra enviada con éxito! Nos pondremos en contacto contigo pronto.');
           
        }, 100);
    });

    // --- Inicialización: Cargar y mostrar el resumen cuando la página cargue ---
    mostrarResumenCompra();
});